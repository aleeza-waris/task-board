
import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
      required: true,
    },
  },
  { timestamps: true }
);

workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);

export default WorkspaceMember;