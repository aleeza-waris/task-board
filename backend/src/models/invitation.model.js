
import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    revokedAt: { // for cancelling invitations before they are accepted
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

invitationSchema.index({ workspaceId: 1, email: 1 });

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;