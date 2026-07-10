import mongoose, { Schema } from "mongoose";

const labelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      lowercase: true,
    },

    color: {
      type: String,
      default: "#3B82F6",
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

labelSchema.index({ workspace: 1, name: 1 }, { unique: true });

export const Label = mongoose.model("Label", labelSchema);
