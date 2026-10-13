
import mongoose from "mongoose";
import WorkspaceMember from "../models/workspaceMember.model.js";
import ApiError from "../utils/ApiError.js";

export const requireWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.isValidObjectId(workspaceId)) {
      throw new ApiError(400, "Invalid workspace ID");
    }

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user.userId,
    });

    if (!membership) {
      throw new ApiError(
        403,
        "You are not a member of this workspace"
      );
    }

    req.workspaceMembership = membership;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireWorkspaceAdmin = async (req, res, next) => {
  try {
    // This middleware expects requireWorkspaceMember to run first.
    if (!req.workspaceMembership) {
      throw new ApiError(
        403,
        "Workspace membership must be verified first"
      );
    }

    if (req.workspaceMembership.role !== "admin") {
      throw new ApiError(
        403,
        "Only workspace admins can perform this action"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};