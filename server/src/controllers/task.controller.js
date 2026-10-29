import mongoose from "mongoose";
import fs from "node:fs/promises";

import { Task } from "../models/task.model.js";
import { Workspace } from "../models/workspace.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { Label } from "../models/label.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const TASK_STATUSES = ["todo", "inProgress", "review", "completed"];
const TASK_PRIORITIES = ["low", "medium", "high"];
const MAX_ATTACHMENTS = 10;

const USER_FIELDS = "fullName userName email";

const TASK_POPULATE = [
  { path: "workspace", select: "name description owner" },
  { path: "project", select: "name title workspace" },
  { path: "assignedTo", select: USER_FIELDS },
  { path: "createdBy", select: USER_FIELDS },
  { path: "labels" },
];

const getCurrentUserId = (req) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required.");
  }

  return req.user._id;
};

const validateObjectId = (id, fieldName = "ID") => {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }
};

const getWorkspaceForUser = async (workspaceId, userId) => {
  validateObjectId(workspaceId, "workspace ID");

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  return workspace;
};

const getWorkspaceRole = (workspace, userId) => {
  if (String(workspace.owner?._id || workspace.owner) === String(userId)) {
    return "owner";
  }

  const member = (workspace.members || []).find(
    (item) => String(item.user?._id || item.user) === String(userId),
  );

  return member?.role || null;
};

const isManager = (workspace, userId) =>
  ["owner", "admin"].includes(getWorkspaceRole(workspace, userId));

const ensureProjectBelongsToWorkspace = async (projectId, workspaceId) => {
  validateObjectId(projectId, "project ID");

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new ApiError(404, "Project not found in this workspace.");
  }

  return project;
};

const validateAssignedUser = async (assignedTo, workspace) => {
  if (assignedTo === undefined || assignedTo === null || assignedTo === "") {
    return null;
  }

  validateObjectId(assignedTo, "assignee ID");

  const userExists = await User.exists({ _id: assignedTo });

  if (!userExists) {
    throw new ApiError(404, "Assignee not found.");
  }

  const belongsToWorkspace =
    String(workspace.owner?._id || workspace.owner) === String(assignedTo) ||
    (workspace.members || []).some(
      (member) =>
        String(member.user?._id || member.user) === String(assignedTo),
    );

  if (!belongsToWorkspace) {
    throw new ApiError(400, "The assignee must belong to this workspace.");
  }

  return assignedTo;
};

const validateLabels = async (labels, workspaceId) => {
  if (!Array.isArray(labels)) {
    throw new ApiError(400, "Labels must be an array.");
  }

  const labelIds = [...new Set(labels.map(String))];

  for (const labelId of labelIds) {
    validateObjectId(labelId, "label ID");
  }

  if (labelIds.length === 0) {
    return [];
  }

  const existingLabels = await Label.find({
    _id: { $in: labelIds },
  })
    .select("_id workspace")
    .lean();

  if (existingLabels.length !== labelIds.length) {
    throw new ApiError(400, "One or more labels do not exist.");
  }

  for (const label of existingLabels) {
    if (label.workspace && String(label.workspace) !== String(workspaceId)) {
      throw new ApiError(
        400,
        "Labels must belong to the same workspace as the task.",
      );
    }
  }

  return labelIds;
};

const validateAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    throw new ApiError(400, "Attachments must be an array.");
  }

  return attachments.map((attachment) => {
    if (
      !attachment ||
      typeof attachment.url !== "string" ||
      !attachment.url.trim() ||
      typeof attachment.publicId !== "string" ||
      !attachment.publicId.trim() ||
      typeof attachment.resourceType !== "string" ||
      !attachment.resourceType.trim()
    ) {
      throw new ApiError(
        400,
        "Each attachment requires a URL, public ID, and resource type.",
      );
    }

    return {
      url: attachment.url.trim(),
      publicId: attachment.publicId.trim(),
      resourceType: attachment.resourceType.trim(),
      fileName:
        typeof attachment.fileName === "string"
          ? attachment.fileName.trim()
          : undefined,
      fileType:
        typeof attachment.fileType === "string"
          ? attachment.fileType.trim()
          : undefined,
      fileSize:
        Number.isFinite(attachment.fileSize) && attachment.fileSize >= 0
          ? attachment.fileSize
          : undefined,
    };
  });
};

const populateTask = (query) => query.populate(TASK_POPULATE);

const removeTempUpload = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Unable to remove temporary upload:", error);
    }
  }
};

// Create a task — workspace owner only
const createTask = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const {
    title,
    description = "",
    workspace: workspaceId,
    project: projectId,
    assignedTo,
    status = "todo",
    priority = "medium",
    dueDate,
    labels = [],
    attachments = [],
  } = req.body || {};

  if (typeof title !== "string" || !title.trim()) {
    throw new ApiError(400, "Task title is required.");
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Task description must be a string.");
  }

  if (!TASK_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid task status.");
  }

  if (!TASK_PRIORITIES.includes(priority)) {
    throw new ApiError(400, "Invalid task priority.");
  }

  const workspace = await getWorkspaceForUser(workspaceId, userId);

  if (String(workspace.owner?._id || workspace.owner) !== String(userId)) {
    throw new ApiError(403, "Only the workspace owner can create tasks.");
  }

  await ensureProjectBelongsToWorkspace(projectId, workspace._id);

  const validatedAssignee = await validateAssignedUser(assignedTo, workspace);

  const validatedLabels = await validateLabels(labels, workspace._id);

  const validatedAttachments = validateAttachments(attachments);

  let parsedDueDate;

  if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
    parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      throw new ApiError(400, "Invalid due date.");
    }
  }

  const task = await Task.create({
    title: title.trim(),
    description: description.trim(),
    workspace: workspace._id,
    project: projectId,
    createdBy: userId,
    assignedTo: validatedAssignee,
    status,
    priority,
    ...(parsedDueDate && { dueDate: parsedDueDate }),
    labels: validatedLabels,
    attachments: validatedAttachments,
  });

  const populatedTask = await populateTask(Task.findById(task._id));

  return res
    .status(201)
    .json(new ApiResponse(201, populatedTask, "Task created successfully."));
});

// Get workspace tasks.
// Owner/admin: all tasks.
// Regular member: tasks assigned to them only.
const getTasks = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const { workspaceId, projectId, status, priority, assignedTo } = req.query;

  if (!workspaceId) {
    throw new ApiError(400, "Workspace ID is required to fetch tasks.");
  }

  const workspace = await getWorkspaceForUser(workspaceId, userId);

  const canViewAll = isManager(workspace, userId);

  const filter = {
    workspace: workspace._id,
  };

  if (projectId) {
    await ensureProjectBelongsToWorkspace(projectId, workspace._id);

    filter.project = projectId;
  }

  if (status) {
    if (!TASK_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid task status filter.");
    }

    filter.status = status;
  }

  if (priority) {
    if (!TASK_PRIORITIES.includes(priority)) {
      throw new ApiError(400, "Invalid task priority filter.");
    }

    filter.priority = priority;
  }

  if (assignedTo) {
    validateObjectId(assignedTo, "assignee ID");

    if (!canViewAll && String(assignedTo) !== String(userId)) {
      throw new ApiError(403, "You can only view tasks assigned to you.");
    }

    filter.assignedTo = assignedTo;
  } else if (!canViewAll) {
    filter.assignedTo = userId;
  }

  const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully."));
});

// Get one task.
// Owner/admin: any task in an accessible workspace.
// Member: tasks assigned to them only.
const getTaskById = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  const canViewAll = isManager(workspace, userId);
  const isAssignee = String(task.assignedTo || "") === String(userId);

  if (!canViewAll && !isAssignee) {
    throw new ApiError(403, "You can only view tasks assigned to you.");
  }

  const populatedTask = await populateTask(Task.findById(task._id));

  return res
    .status(200)
    .json(new ApiResponse(200, populatedTask, "Task fetched successfully."));
});

// Update a task.
// Owner/admin: any task in their workspace.
// Member: tasks assigned to them.
const updateTask = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  const canManage = isManager(workspace, userId);
  const isAssignee = String(task.assignedTo || "") === String(userId);

  if (!canManage && !isAssignee) {
    throw new ApiError(403, "You can only update tasks assigned to you.");
  }

  const {
    title,
    description,
    project,
    assignedTo,
    status,
    priority,
    dueDate,
    labels,
    attachments,
  } = req.body || {};

  if (
    Object.prototype.hasOwnProperty.call(req.body || {}, "workspace") ||
    Object.prototype.hasOwnProperty.call(req.body || {}, "createdBy")
  ) {
    throw new ApiError(400, "Workspace and creator cannot be changed.");
  }

  if (
    !canManage &&
    (project !== undefined ||
      assignedTo !== undefined ||
      labels !== undefined ||
      attachments !== undefined)
  ) {
    throw new ApiError(
      403,
      "Only workspace owners or admins can change projects, assignees, labels, or attachments.",
    );
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new ApiError(400, "Task title cannot be empty.");
    }

    task.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ApiError(400, "Task description must be a string.");
    }

    task.description = description.trim();
  }

  if (project !== undefined) {
    await ensureProjectBelongsToWorkspace(project, workspace._id);

    task.project = project;
  }

  if (assignedTo !== undefined) {
    task.assignedTo = await validateAssignedUser(assignedTo, workspace);
  }

  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid task status.");
    }

    task.status = status;
  }

  if (priority !== undefined) {
    if (!TASK_PRIORITIES.includes(priority)) {
      throw new ApiError(400, "Invalid task priority.");
    }

    task.priority = priority;
  }

  if (dueDate !== undefined) {
    if (dueDate === null || dueDate === "") {
      task.dueDate = undefined;
    } else {
      const parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        throw new ApiError(400, "Invalid due date.");
      }

      task.dueDate = parsedDueDate;
    }
  }

  if (labels !== undefined) {
    task.labels = await validateLabels(labels, workspace._id);
  }

  if (attachments !== undefined) {
    task.attachments = validateAttachments(attachments);
  }

  await task.save();

  const populatedTask = await populateTask(Task.findById(task._id));

  return res
    .status(200)
    .json(new ApiResponse(200, populatedTask, "Task updated successfully."));
});

// Delete a task.
// Owner/admin: any task in their workspace.
// Regular member: cannot delete tasks.
const deleteTask = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!isManager(workspace, userId)) {
    throw new ApiError(
      403,
      "Only workspace owners or admins can delete tasks.",
    );
  }

  await Task.deleteOne({ _id: task._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully."));
});

// Upload one task attachment to Cloudinary.
const uploadTaskAttachment = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  let uploadedAsset = null;
  let savedToTask = false;

  try {
    const userId = getCurrentUserId(req);
    const { taskId } = req.params;

    validateObjectId(taskId, "task ID");

    if (!req.file) {
      throw new ApiError(400, "Please select a file to upload.");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found.");
    }

    const workspace = await getWorkspaceForUser(task.workspace, userId);

    if (!isManager(workspace, userId)) {
      throw new ApiError(
        403,
        "Only workspace owners or admins can manage attachments.",
      );
    }

    if (task.attachments.length >= MAX_ATTACHMENTS) {
      throw new ApiError(
        400,
        `A task can have a maximum of ${MAX_ATTACHMENTS} attachments.`,
      );
    }

    // The utility removes the temporary local file after uploading.
    // "auto" lets Cloudinary choose the resource type.
    uploadedAsset = await uploadOnCloudinary(filePath, "auto");

    if (
      !uploadedAsset?.secure_url ||
      !uploadedAsset?.public_id ||
      !uploadedAsset?.resource_type
    ) {
      throw new ApiError(500, "Cloudinary did not return valid file details.");
    }

    task.attachments.push({
      url: uploadedAsset.secure_url,
      publicId: uploadedAsset.public_id,
      resourceType: uploadedAsset.resource_type,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await task.save();
    savedToTask = true;

    const populatedTask = await populateTask(Task.findById(task._id));

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          populatedTask,
          "Attachment uploaded successfully.",
        ),
      );
  } catch (error) {
    // Avoid leaving an uploaded Cloudinary file orphaned if
    // MongoDB fails to save the attachment reference.
    if (uploadedAsset?.public_id && !savedToTask) {
      try {
        await deleteFromCloudinary(
          uploadedAsset.public_id,
          uploadedAsset.resource_type,
        );
      } catch (cleanupError) {
        console.error("Unable to clean up Cloudinary upload:", cleanupError);
      }
    }

    throw error;
  } finally {
    // Safe if Cloudinary already removed the temporary file.
    await removeTempUpload(filePath);
  }
});

// Remove one attachment from a task.
const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  const attachmentId = String(req.body?.attachmentId || "").trim();

  validateObjectId(taskId, "task ID");

  if (!attachmentId) {
    throw new ApiError(400, "Attachment ID is required.");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  if (!isManager(workspace, userId)) {
    throw new ApiError(
      403,
      "Only workspace owners or admins can manage attachments.",
    );
  }

  // The frontend may send a Cloudinary public ID, URL,
  // or MongoDB attachment subdocument ID.
  const attachmentIndex = task.attachments.findIndex(
    (attachment) =>
      String(attachment._id) === attachmentId ||
      attachment.publicId === attachmentId ||
      attachment.url === attachmentId,
  );

  if (attachmentIndex === -1) {
    throw new ApiError(404, "Attachment not found.");
  }

  const [attachment] = task.attachments.splice(attachmentIndex, 1);

  // Save the removal from the task before cleaning up Cloudinary.
  await task.save();

  let storageCleanupFailed = false;

  try {
    await deleteFromCloudinary(
      attachment.publicId,
      attachment.resourceType || "image",
    );
  } catch (cleanupError) {
    storageCleanupFailed = true;

    console.error(
      "Attachment removed from task, but Cloudinary cleanup failed:",
      cleanupError,
    );
  }

  const populatedTask = await populateTask(Task.findById(task._id));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedTask,
        storageCleanupFailed
          ? "Attachment removed from the task, but storage cleanup failed."
          : "Attachment removed successfully.",
      ),
    );
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  uploadTaskAttachment,
  deleteTaskAttachment,
};
