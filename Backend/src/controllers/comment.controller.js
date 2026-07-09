import { Comment } from "../models/comment.model.js";
import { Task } from "../models/task.model.js";
import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createActivity } from "../utils/activity.js";
import { createNotification } from "../utils/notification.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const { content } = req.body;

  const task = await Task.findById(taskId).populate([
    { path: "workspace", select: "name" },
    { path: "project", select: "name" },
    { path: "createdBy", select: "fullName email avatar" },
    { path: "assignedTo", select: "fullName email avatar" },
  ]);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await Workspace.findById(task.workspace._id);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  const currentMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "Access denied.");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required.");
  }

  const comment = await Comment.create({
    task: task._id,
    workspace: workspace._id,
    user: req.user._id,
    content: content.trim(),
  }).populate("user", "fullName email avatar");

  if (
    task.assignedTo &&
    task.assignedTo._id.toString() !== req.user._id.toString()
  ) {
    await createNotification({
      recipient: task.assignedTo._id,
      sender: req.user._id,
      title: "New Comment",
      message: `${req.user.fullName} commented on "${task.title}"`,
      type: "TASK_UPDATED",
      task: task._id,
    });
  }

  await createActivity({
    user: req.user._id,
    workspace: workspace._id,
    task: task._id,
    action: `${req.user.fullName} commented on "${task.title}"`,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully."));
});

const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  const currentMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "Access denied.");
  }

  const comments = await Comment.find({
    task: task._id,
  })
    .populate("user", "fullName email avatar")
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .skip(skip);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  if (!comment.user.equals(req.user._id)) {
    throw new ApiError(403, "Access denied.");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required.");
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await comment.save();

  await comment.populate("user", "fullName email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully."));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  const workspace = await Workspace.findById(comment.workspace);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  const currentMember = workspace.members.find(
    (m) => m.user.toString() === req.user._id.toString(),
  );

  if (!currentMember) {
    throw new ApiError(403, "Access denied.");
  }

  if (
    !["admin", "owner"].includes(currentMember.role) &&
    !comment.user.equals(req.user._id)
  ) {
    throw new ApiError(403, "Access denied.");
  }

  await comment.deleteOne();

  await createActivity({
    user: req.user._id,
    workspace: workspace._id,
    task: comment.task,
    action: `${req.user.fullName} deleted comment.`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully."));
});

export { addComment, getComments, updateComment, deleteComment };
