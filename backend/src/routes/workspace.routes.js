
import { Router } from "express";

import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
} from "../controllers/workspace.controllers.js";

import {
  createWorkspaceTask,
  getWorkspaceTasks,
  updateWorkspaceTask,
  deleteWorkspaceTask,
} from "../controllers/task.controllers.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middlewares/workspace.middleware.js";

import {
  sendWorkspaceInvitation,
  listWorkspaceInvitations,
  acceptWorkspaceInvitation,
  revokeWorkspaceInvitation,
} from "../controllers/invitation.controllers.js";




const router = Router();

// Get all workspaces the logged-in user belongs to.
router.get("/", authMiddleware, getMyWorkspaces);

// Create a workspace; its creator becomes the admin.
router.post("/", authMiddleware, createWorkspace);

// Get one workspace; only its members,admin can access it.
router.get(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceMember,
  getWorkspaceById
);

// Update workspace details; admins only.
router.patch(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceMember,
  requireWorkspaceAdmin,
  updateWorkspace
);

// Delete a workspace; admins only.
router.delete(
  "/:workspaceId",
  authMiddleware,
  requireWorkspaceMember,
  requireWorkspaceAdmin,
  deleteWorkspace
);

// Get team members; workspace members can view the team.
router.get(
  "/:workspaceId/members",
  authMiddleware,
  requireWorkspaceMember,
  getWorkspaceMembers
);


/* Workspace tasks */

// Get tasks belonging to this workspace.
router.get(
  "/:workspaceId/tasks",
  authMiddleware,
  requireWorkspaceMember,
  getWorkspaceTasks
);

// Create a task in this workspace.
router.post(
  "/:workspaceId/tasks",
  authMiddleware,
  requireWorkspaceMember,
  createWorkspaceTask
);

// Update a task in this workspace.
router.patch(
  "/:workspaceId/tasks/:id",
  authMiddleware,
  requireWorkspaceMember,
  updateWorkspaceTask
);

// Delete a task in this workspace.
router.delete(
  "/:workspaceId/tasks/:id",
  authMiddleware,
  requireWorkspaceMember,
  deleteWorkspaceTask
);
/* Workspace invitations */

// Send an invitation; workspace admins only.
router.post(
  "/:workspaceId/invitations",
  authMiddleware,
  requireWorkspaceMember,
  requireWorkspaceAdmin,
  sendWorkspaceInvitation
);

// List workspace invitations; admins only.
router.get(
  "/:workspaceId/invitations",
  authMiddleware,
  requireWorkspaceMember,
  requireWorkspaceAdmin,
  listWorkspaceInvitations
);

// Accept an invitation; any logged-in user can accept if they have a valid token.
router.post(
  "/invitations/accept",
  authMiddleware,
  acceptWorkspaceInvitation
);
// delete a workspace invitation; workspace admins only.
router.delete(
"/:workspaceId/invitations/:invitationId",
authMiddleware,
requireWorkspaceMember,
requireWorkspaceAdmin,
revokeWorkspaceInvitation
);

export default router;
