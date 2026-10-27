import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { Workspace } from "../models/workspace.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { Label } from "../models/label.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TASK_STATUSES = ["todo", "inProgress", "review", "completed"];
const TASK_PRIORITIES = ["low", "medium", "high"];

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

  const member = workspace.members.find(
    (item) => String(item.user?._id || item.user) === String(userId),
  );

  return member?.role || null;
};

const isWorkspaceMember = (workspace, userId) =>
  Boolean(getWorkspaceRole(workspace, userId));

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

  if (!isWorkspaceMember(workspace, assignedTo)) {
    throw new ApiError(400, "The assignee must belong to this workspace.");
  }

  return assignedTo;
};

// Validate label IDs and ensure workspace-scoped labels belong to this workspace.
const validateLabels = async (labels, workspaceId) => {
  if (!Array.isArray(labels)) {
    throw new ApiError(400, "Labels must be an array.");
  }

  const labelIds = [...new Set(labels.map((id) => String(id)))];

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
    // If the Label model defines workspace, prevent cross-workspace use.
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

  if (String(workspace.owner) !== String(userId)) {
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

// Get tasks in a workspace with optional filters
const getTasks = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const { workspaceId, projectId, status, priority, assignedTo } = req.query;

  if (!workspaceId) {
    throw new ApiError(400, "Workspace ID is required to fetch tasks.");
  }

  const workspace = await getWorkspaceForUser(workspaceId, userId);

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
    filter.assignedTo = assignedTo;
  }

  const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully."));
});

// Get a single task
const getTaskById = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  await getWorkspaceForUser(task.workspace, userId);

  const populatedTask = await populateTask(Task.findById(task._id));

  return res
    .status(200)
    .json(new ApiResponse(200, populatedTask, "Task fetched successfully."));
});

// Update a task
const updateTask = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);

  const isCreator = String(task.createdBy) === String(userId);
  const isAssignee = String(task.assignedTo || "") === String(userId);

  if (!isManager(workspace, userId) && !isCreator && !isAssignee) {
    throw new ApiError(403, "You do not have permission to update this task.");
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

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { taskId } = req.params;

  validateObjectId(taskId, "task ID");

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await getWorkspaceForUser(task.workspace, userId);
  const isCreator = String(task.createdBy) === String(userId);

  if (!isManager(workspace, userId) && !isCreator) {
    throw new ApiError(
      403,
      "Only the task creator, workspace owner, or admin can delete this task.",
    );
  }

  await Task.deleteOne({ _id: task._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully."));
});

export { createTask, getTasks, getTaskById, updateTask, deleteTask };
