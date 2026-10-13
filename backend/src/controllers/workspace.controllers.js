
import Workspace from "../models/workspace.model.js";
import WorkspaceMember from "../models/workspaceMember.model.js";
import ApiError from "../utils/ApiError.js";
import Task from "../models/task.model.js";

/* 1. Create workspace controller
When a logged-in user creates a workspace:

It validates the workspace name and optional description.

It saves the workspace in MongoDB.

It adds the creator to WorkspaceMember with the admin role.

It returns the created workspace with HTTP status 201. */
export const createWorkspace = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || "";

    if (!name) {
      throw new ApiError(400, "Workspace name is required");
    }

    if (name.length > 80) {
      throw new ApiError(
        400,
        "Workspace name cannot exceed 80 characters"
      );
    }

    if (description.length > 500) {
      throw new ApiError(
        400,
        "Description cannot exceed 500 characters"
      );
    }

    const workspace = await Workspace.create({
      name,
      description,
      ownerId: req.user.userId,
    });

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: req.user.userId,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

/*
  Suppose you belong to two workspaces:

My Team — admin

Project Alpha — member

This function finds your membership records, retrieves the associated workspace details, and returns both workspaces with your role in each.

A few important concepts:

WorkspaceMember.find() finds memberships belonging to the logged-in user.

.populate("workspaceId") replaces the workspace ID with the actual workspace document.

.map() prepares the response and includes the user's role.

res.status(200).json() sends a successful response.

Why query WorkspaceMember instead of Workspace?

Because a user can belong to workspaces created by other people, too. Searching memberships lets us return both owned workspaces and workspaces where the user is a member.
 */
export const getMyWorkspaces = async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({
      userId: req.user.userId,
    }).populate("workspaceId");

    const workspaces = memberships
      .filter((membership) => membership.workspaceId)
      .map((membership) => ({
        ...membership.workspaceId.toObject(),
        role: membership.role,
      }));

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

// which retrieves the details of one specific workspace.
export const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(
      req.params.workspaceId
    );

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    return res.status(200).json({
      success: true,
      data: {
        ...workspace.toObject(),  // as workspace is a Mongoose document, we convert it to a plain object to include all its properties in the response.
        role: req.workspaceMembership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        throw new ApiError(400, "Workspace name is required");
      }

      if (name.trim().length > 80) {
        throw new ApiError(
          400,
          "Workspace name cannot exceed 80 characters"
        );
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        throw new ApiError(400, "Description must be a string");
      }

      if (description.trim().length > 500) {
        throw new ApiError(
          400,
          "Description cannot exceed 500 characters"
        );
      }

      updates.description = description.trim();
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(
        400,
        "Provide workspace details to update"
      );
    }

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { $set: updates },
      {   returnDocument: "after"
        , runValidators: true }
    );

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    /*
    Promise.all() returns a single Promise representing all the supplied operations.

If all three succeed, await continues to the success response.

If any operation rejects, Promise.all() rejects, and execution moves to the catch block.
    */
    await Promise.all([
      Task.deleteMany({ workspaceId }),
      WorkspaceMember.deleteMany({ workspaceId }),
      Workspace.deleteOne({ _id: workspaceId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// can only see its members if they are logged in and belong to that workspace.
//  This is enforced by the requireWorkspaceMember middleware.
export const getWorkspaceMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({
      workspaceId: req.params.workspaceId,
    })
      .populate("userId", "username email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};