import { Label } from "../models/label.model.js";
import { Task } from "../models/task.model.js";
import { Workspace } from "../models/workspace.model.js";
import { createActivity } from "../utils/activity.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateLabel = asyncHandler(async (req, res) => {
  const { labelId } = req.params;
  const { name, color } = req.body;

  const label = await Label.findById(labelId);

  if (!label) {
    throw new ApiError(404, "Label not found.");
  }

  const workspace = await Workspace.findById(label.workspace);

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
    !["owner", "admin"].includes(currentMember.role) &&
    label.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied.");
  }

  if (!name?.trim()) {
    throw new ApiError(400, "Name is required.");
  }

  const existingLabel = await Label.findOne({
    workspace: label.workspace,
    name: name.trim(),
    _id: { $ne: label._id },
  });

  if (existingLabel) {
    throw new ApiError(409, "Label already exists.");
  }

  const oldName = label.name;

  label.name = name.trim();

  if (color?.trim()) {
    label.color = color.trim();
  }

  await label.save();

  await label.populate("createdBy", "fullName email avatar");

  const action =
    oldName !== label.name
      ? `${req.user.fullName} renamed the label "${oldName}" to "${label.name}".`
      : `${req.user.fullName} updated the "${label.name}" label.`;

  await createActivity({
    user: req.user._id,
    workspace: workspace._id,
    action,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, label, "Label updated successfully."));
});

const deleteLabel = asyncHandler(async (req, res) => {
  const { labelId } = req.params;
  const label = await Label.findById(labelId);

  if (!label) {
    throw new ApiError(404, "Label not found.");
  }

  const workspace = await Workspace.findById(label.workspace);

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
    !["owner", "admin"].includes(currentMember.role) &&
    !label.createdBy.equals(req.user._id)
  ) {
    throw new ApiError(403, "Access denied.");
  }

  const labelName = label.name;

  await Task.updateMany(
    { labels: label._id },
    { $pull: { labels: label._id } },
  );
  await label.deleteOne();

  await createActivity({
    user: req.user._id,
    workspace: workspace._id,
    action: `${req.user.fullName} deleted label "${labelName}"`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Label deleted successfully."));
});

export { updateLabel, deleteLabel };
