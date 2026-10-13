import Task from "../models/task.model.js";
import ApiError from "../utils/ApiError.js";
import WorkspaceMember from "../models/workspaceMember.model.js";

const requireWorkspaceAdmin = async (workspaceId, userId) => {
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  if (membership.role !== "admin") {
    throw new ApiError(403, "Only workspace admins can manage tasks");
  }

  return membership;
};



const createWorkspaceTask = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const {
      title,
      description,
      status,
      dueDate,
      assignedTo,
    } = req.body;

    // Only admins can create workspace tasks.
    await requireWorkspaceAdmin(workspaceId, req.user.userId);

    // If an assignee was selected, verify they belong to this workspace.
    if (assignedTo) {
      const assigneeMembership = await WorkspaceMember.findOne({
        workspaceId,
        userId: assignedTo,
      });

      if (!assigneeMembership) {
        throw new ApiError(
          400,
          "The assigned user must be a member of this workspace"
        );
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      user: req.user.userId,
      workspaceId,
      assignedTo: assignedTo || null,
    });

    await task.populate("assignedTo", "username email avatar");

    return res.status(201).json({
      success: true,
      message: "Workspace task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};


const getWorkspaceTasks = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    // Confirm that the user belongs to this workspace.
    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user.userId,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this workspace");
    }

    const taskFilter = {
      workspaceId,
      ...(req.workspaceMembership.role === "member"
        ? { assignedTo: req.user.userId }
        : {}),
    };

    const tasks = await Task.find(taskFilter)
      .populate("assignedTo", "username email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Workspace tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};


const updateWorkspaceTask = async (req, res, next) => {
  try {
    const { workspaceId, id } = req.params;
    const { title, description, status, dueDate, assignedTo } = req.body;

    const membership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user.userId,
    });

    if (!membership) {
      throw new ApiError(403, "You are not a member of this workspace");
    }

    const task = await Task.findOne({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new ApiError(404, "Workspace task not found");
    }

    if (membership.role === "admin") {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) {
        const currentAssigneeId = task.assignedTo?.toString() ?? null;

        if (assignedTo !== null && assignedTo !== currentAssigneeId) {
          const assigneeMembership = await WorkspaceMember.findOne({
            workspaceId,
            userId: assignedTo,
          });

          if (!assigneeMembership) {
            throw new ApiError(
              400,
              "The assigned user must be a member of this workspace"
            );
          }
        }

        task.assignedTo = assignedTo;
      }
    } else {
      // Members may update only the status of tasks assigned to them.
      if (task.assignedTo?.toString() !== req.user.userId) {
        throw new ApiError(
          403,
          "You can only update tasks assigned to you"
        );
      }

      const allowedStatuses = ["todo", "in-progress", "review", "done"];

      if (
        status === undefined ||
        Object.keys(req.body).some((key) => key !== "status") ||
        !allowedStatuses.includes(status)
      ) {
        throw new ApiError(
          403,
          "Members can only update the status of their assigned tasks"
        );
      }

      task.status = status;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Workspace task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};


const deleteWorkspaceTask = async (req, res, next) => {
  try {
    const { workspaceId, id } = req.params;

    // Only workspace admins can delete tasks.
    await requireWorkspaceAdmin(workspaceId, req.user.userId);

    const task = await Task.findOneAndDelete({
      _id: id,
      workspaceId,
    });

    if (!task) {
      throw new ApiError(404, "Workspace task not found");
    }

    return res.status(200).json({
      success: true,
      message: "Workspace task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


export {
  createWorkspaceTask,
  getWorkspaceTasks,
  updateWorkspaceTask,
  deleteWorkspaceTask,
};
