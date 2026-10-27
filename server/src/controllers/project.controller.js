import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { Workspace } from "../models/workspace.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PROJECT_STATUSES = ["Planning", "Active", "Completed", "Archived"];

const USER_FIELDS = "fullName userName email";

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

const requireManager = (workspace, userId) => {
  const role = getWorkspaceRole(workspace, userId);

  if (!["owner", "admin"].includes(role)) {
    throw new ApiError(
      403,
      "Only the workspace owner or an admin can manage projects.",
    );
  }
};

const parseOptionalDate = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}.`);
  }

  return date;
};

const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate && startDate > endDate) {
    throw new ApiError(400, "Project start date cannot be after its end date.");
  }
};

const populateProject = (query) =>
  query
    .populate("workspace", "name description owner")
    .populate("createdBy", USER_FIELDS);

// Create a project
const createProject = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const {
    name,
    description = "",
    status = "Planning",
    startDate,
    endDate,
  } = req.body || {};

  // Accept either "workspace" or "workspaceId" in the request body.
  const workspaceId = req.body?.workspaceId || req.body?.workspace;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Project name is required.");
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Project description must be a string.");
  }

  if (!PROJECT_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid project status.");
  }

  const workspace = await getWorkspaceForUser(workspaceId, userId);
  requireManager(workspace, userId);

  const parsedStartDate = parseOptionalDate(startDate, "start date");
  const parsedEndDate = parseOptionalDate(endDate, "end date");

  validateDateRange(parsedStartDate, parsedEndDate);

  try {
    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      workspace: workspace._id,
      createdBy: userId,
      status,
      ...(parsedStartDate && { startDate: parsedStartDate }),
      ...(parsedEndDate && { endDate: parsedEndDate }),
    });

    const populatedProject = await populateProject(
      Project.findById(project._id),
    );

    return res
      .status(201)
      .json(
        new ApiResponse(201, populatedProject, "Project created successfully."),
      );
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A project with this name already exists in the workspace.",
      );
    }

    throw error;
  }
});

// Get all projects in a workspace
const getProjects = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { workspaceId, status, search } = req.query;

  if (!workspaceId) {
    throw new ApiError(400, "Workspace ID is required to fetch projects.");
  }

  const workspace = await getWorkspaceForUser(workspaceId, userId);

  const filter = {
    workspace: workspace._id,
  };

  if (status) {
    if (!PROJECT_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid project status filter.");
    }

    filter.status = status;
  }

  if (search) {
    if (typeof search !== "string") {
      throw new ApiError(400, "Search must be a string.");
    }

    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (escapedSearch) {
      filter.name = {
        $regex: escapedSearch,
        $options: "i",
      };
    }
  }

  const projects = await populateProject(
    Project.find(filter).sort({ updatedAt: -1 }),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully."));
});

// Get one project by ID
const getProjectById = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { projectId } = req.params;

  validateObjectId(projectId, "project ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  await getWorkspaceForUser(project.workspace, userId);

  const populatedProject = await populateProject(Project.findById(project._id));

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedProject, "Project fetched successfully."),
    );
});

// Update project details
const updateProject = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { projectId } = req.params;

  validateObjectId(projectId, "project ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const workspace = await getWorkspaceForUser(project.workspace, userId);

  const role = getWorkspaceRole(workspace, userId);
  const isCreator = String(project.createdBy) === String(userId);

  if (!["owner", "admin"].includes(role) && !isCreator) {
    throw new ApiError(
      403,
      "You do not have permission to update this project.",
    );
  }

  const { name, description, status, startDate, endDate } = req.body || {};

  if (
    Object.prototype.hasOwnProperty.call(req.body || {}, "workspace") ||
    Object.prototype.hasOwnProperty.call(req.body || {}, "workspaceId") ||
    Object.prototype.hasOwnProperty.call(req.body || {}, "createdBy")
  ) {
    throw new ApiError(400, "Project workspace and creator cannot be changed.");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Project name cannot be empty.");
    }

    project.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ApiError(400, "Project description must be a string.");
    }

    project.description = description.trim();
  }

  if (status !== undefined) {
    if (!PROJECT_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid project status.");
    }

    project.status = status;
  }

  const parsedStartDate =
    startDate !== undefined
      ? parseOptionalDate(startDate, "start date")
      : project.startDate;

  const parsedEndDate =
    endDate !== undefined
      ? parseOptionalDate(endDate, "end date")
      : project.endDate;

  validateDateRange(parsedStartDate, parsedEndDate);

  if (startDate !== undefined) {
    project.startDate = parsedStartDate;
  }

  if (endDate !== undefined) {
    project.endDate = parsedEndDate;
  }

  try {
    await project.save();
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "A project with this name already exists in the workspace.",
      );
    }

    throw error;
  }

  const populatedProject = await populateProject(Project.findById(project._id));

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedProject, "Project updated successfully."),
    );
});

// Delete a project
const deleteProject = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { projectId } = req.params;

  validateObjectId(projectId, "project ID");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const workspace = await getWorkspaceForUser(project.workspace, userId);

  const role = getWorkspaceRole(workspace, userId);
  const isCreator = String(project.createdBy) === String(userId);

  if (!["owner", "admin"].includes(role) && !isCreator) {
    throw new ApiError(
      403,
      "You do not have permission to delete this project.",
    );
  }

  const taskCount = await Task.countDocuments({
    project: project._id,
  });

  if (taskCount > 0) {
    throw new ApiError(
      409,
      "This project has tasks. Delete or move its tasks before deleting the project.",
    );
  }

  await Project.deleteOne({ _id: project._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully."));
});

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
