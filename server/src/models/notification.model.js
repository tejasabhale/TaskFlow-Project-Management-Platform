import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_UPDATED",
        "TASK_COMPLETED",
        "TASK_ATTACHMENT_UPLOADED",
        "PROJECT_CREATED",
        "WORKSPACE_INVITE",
        "WORKSPACE_MEMBER_ADDED",
        "WORKSPACE MEMBER REMOVED",
        "LABEL_CREATED",
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },

    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ task: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
