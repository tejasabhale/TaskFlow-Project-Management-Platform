import mongoose from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const USER_FIELDS = "fullName userName email";

const getCurrentUserId = (req) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required.");
  }

  return req.user._id;
};

const getWorkspaceForUser = async (workspaceId, userId) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace ID.");
  }

  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  return workspace;
};

const getMemberRole = (workspace, userId) => {
  if (String(workspace.owner) === String(userId)) {
    return "owner";
  }

  const member = workspace.members.find(
    (item) => String(item.user?._id || item.user) === String(userId),
  );

  return member?.role || null;
};

const requireManager = (workspace, userId) => {
  const role = getMemberRole(workspace, userId);

  if (!["owner", "admin"].includes(role)) {
    throw new ApiError(
      403,
      "You do not have permission to manage this workspace.",
    );
  }

  return role;
};

// Create a workspace
const createWorkspace = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { name, description = "" } = req.body || {};

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Workspace name is required.");
  }

  if (name.trim().length < 3) {
    throw new ApiError(
      400,
      "Workspace name must contain at least 3 characters.",
    );
  }

  if (typeof description !== "string") {
    throw new ApiError(400, "Description must be a string.");
  }

  const normalizedDescription = description.trim();

  if (normalizedDescription.length > 0 && normalizedDescription.length < 5) {
    throw new ApiError(400, "Description must contain at least 5 characters.");
  }

  const workspace = await Workspace.create({
    name: name.trim(),
    description: normalizedDescription,
    owner: userId,
    members: [
      {
        user: userId,
        role: "owner",
      },
    ],
  });

  const populatedWorkspace = await Workspace.findById(workspace._id)
    .populate("owner", USER_FIELDS)
    .populate("members.user", USER_FIELDS);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedWorkspace,
        "Workspace created successfully.",
      ),
    );
});

// Get all workspaces accessible to the logged-in user
const getWorkspaces = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  })
    .populate("owner", USER_FIELDS)
    .populate("members.user", USER_FIELDS)
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, workspaces, "Workspaces fetched successfully."));
});

// Get one workspace
const getWorkspaceById = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  await workspace.populate("owner", USER_FIELDS);
  await workspace.populate("members.user", USER_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, workspace, "Workspace fetched successfully."));
});

// Update workspace details
const updateWorkspace = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  requireManager(workspace, userId);

  const { name, description } = req.body || {};
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 3) {
      throw new ApiError(
        400,
        "Workspace name must contain at least 3 characters.",
      );
    }

    updates.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ApiError(400, "Description must be a string.");
    }

    const normalizedDescription = description.trim();

    if (normalizedDescription.length > 0 && normalizedDescription.length < 5) {
      throw new ApiError(
        400,
        "Description must contain at least 5 characters.",
      );
    }

    updates.description = normalizedDescription;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(
      400,
      "Provide a workspace name or description to update.",
    );
  }

  Object.assign(workspace, updates);
  await workspace.save();

  await workspace.populate("owner", USER_FIELDS);
  await workspace.populate("members.user", USER_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, workspace, "Workspace updated successfully."));
});

// Delete a workspace (owner only)
const deleteWorkspace = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  if (String(workspace.owner) !== String(userId)) {
    throw new ApiError(
      403,
      "Only the workspace owner can delete this workspace.",
    );
  }

  await Workspace.deleteOne({ _id: workspace._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Workspace deleted successfully."));
});

// Add a user to a workspace
const addWorkspaceMember = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { memberId, role = "member" } = req.body || {};

  if (!mongoose.isValidObjectId(memberId)) {
    throw new ApiError(400, "A valid member ID is required.");
  }

  if (!["member", "admin"].includes(role)) {
    throw new ApiError(400, "Member role must be either member or admin.");
  }

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  const requesterRole = requireManager(workspace, userId);

  if (role === "admin" && requesterRole !== "owner") {
    throw new ApiError(
      403,
      "Only the workspace owner can assign the admin role.",
    );
  }

  if (String(workspace.owner) === String(memberId)) {
    throw new ApiError(
      409,
      "The workspace owner is already part of this workspace.",
    );
  }

  const existingMember = workspace.members.some(
    (member) => String(member.user?._id || member.user) === String(memberId),
  );

  if (existingMember) {
    throw new ApiError(409, "This user is already a workspace member.");
  }

  const userExists = await User.exists({ _id: memberId });

  if (!userExists) {
    throw new ApiError(404, "User not found.");
  }

  workspace.members.push({
    user: memberId,
    role,
  });

  await workspace.save();
  await workspace.populate("owner", USER_FIELDS);
  await workspace.populate("members.user", USER_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member added successfully."));
});

// Change a member's role (owner only)
const updateWorkspaceMemberRole = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { memberId } = req.params;
  const { role } = req.body || {};

  if (!mongoose.isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid member ID.");
  }

  if (!["member", "admin"].includes(role)) {
    throw new ApiError(400, "Role must be either member or admin.");
  }

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  const requesterRole = getMemberRole(workspace, userId);

  if (requesterRole !== "owner") {
    throw new ApiError(
      403,
      "Only the workspace owner can change member roles.",
    );
  }

  if (String(workspace.owner) === String(memberId)) {
    throw new ApiError(400, "The workspace owner's role cannot be changed.");
  }

  const member = workspace.members.find(
    (item) => String(item.user?._id || item.user) === String(memberId),
  );

  if (!member) {
    throw new ApiError(404, "Workspace member not found.");
  }

  member.role = role;

  await workspace.save();
  await workspace.populate("owner", USER_FIELDS);
  await workspace.populate("members.user", USER_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member role updated successfully."));
});

// Remove a member from a workspace
const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId(req);
  const { memberId } = req.params;

  if (!mongoose.isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid member ID.");
  }

  const workspace = await getWorkspaceForUser(req.params.workspaceId, userId);

  const requesterRole = requireManager(workspace, userId);

  if (String(workspace.owner) === String(memberId)) {
    throw new ApiError(400, "The workspace owner cannot be removed.");
  }

  const memberIndex = workspace.members.findIndex(
    (item) => String(item.user?._id || item.user) === String(memberId),
  );

  if (memberIndex === -1) {
    throw new ApiError(404, "Workspace member not found.");
  }

  const targetRole = workspace.members[memberIndex].role;

  if (requesterRole === "admin" && targetRole !== "member") {
    throw new ApiError(403, "Admins can remove regular members only.");
  }

  workspace.members.splice(memberIndex, 1);

  await workspace.save();
  await workspace.populate("owner", USER_FIELDS);
  await workspace.populate("members.user", USER_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, workspace, "Member removed successfully."));
});

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
};
