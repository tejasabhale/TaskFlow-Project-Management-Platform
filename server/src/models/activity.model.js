import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
