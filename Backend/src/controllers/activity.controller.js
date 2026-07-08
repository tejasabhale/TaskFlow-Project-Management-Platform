import { Workspace } from "../models/workspace.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Activity } from "../models/activity.model.js";
import { ApiError } from "../utils/ApiError.js";

const getWorkspaceActivities = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  const member = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!member) {
    throw new ApiError(403, "Access denied.");
  }

  const activities = await Activity.find({
    workspace: workspaceId,
  })
    .populate("user", "fullName email avatar")
    .populate("project", "name")
    .populate("task", "title")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        activities,
        "Workspace activities fetched successfully.",
      ),
    );
});

const getProjectActivities = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const workspace = await Workspace.findById(project.workspace);

  const member = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!member) {
    throw new ApiError(403, "Access denied.");
  }

  const activities = await Activity.find({
    project: projectId,
  })
    .populate("user", "fullName email avatar")
    .populate("task", "title")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        activities,
        "Project activities fetched successfully.",
      ),
    );
});

const getTaskActivities = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await Workspace.findById(task.workspace);

  const member = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!member) {
    throw new ApiError(403, "Access denied.");
  }

  const activities = await Activity.find({
    task: taskId,
  })
    .populate("user", "fullName email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, activities, "Task activities fetched successfully."),
    );
});

export { getWorkspaceActivities, getProjectActivities, getTaskActivities };
