import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => value.length === 0 || value.length >= 5,
        message: "Description must be empty or contain at least 5 characters.",
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "member", "admin"],
          default: "member",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index({ "members.user": 1 });

export const Workspace = mongoose.model("Workspace", workspaceSchema);
