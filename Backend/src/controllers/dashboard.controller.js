import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboard = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    "members.user": req.user._id,
  }).select("_id");

  const workspaceIds = workspaces.map((workspace) => workspace._id);

  const totalWorkspaces = workspaces.length;

  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
  ] = await Promise.all([
    Project.countDocuments({
      workspace: { $in: workspaceIds },
    }),

    Task.countDocuments({
      workspace: { $in: workspaceIds },
    }),

    Task.countDocuments({
      workspace: { $in: workspaceIds },
      status: "completed",
    }),

    Task.countDocuments({
      workspace: { $in: workspaceIds },
      status: { $ne: "completed" },
    }),

    Task.countDocuments({
      workspace: { $in: workspaceIds },
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalWorkspaces,
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      "Dashboard fetched successfully.",
    ),
  );
});

export { getDashboard };
