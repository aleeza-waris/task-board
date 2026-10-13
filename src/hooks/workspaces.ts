"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type WorkspaceMember = {
  _id: string;
  role: "admin" | "member";
  userId: {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
  } | null;
};

export type WorkspaceInvitation = {
  _id: string;
  email: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  status: "pending" | "accepted" | "revoked" | "expired";
};

type WorkspaceMembersResponse = {
  success: boolean;
  data: WorkspaceMember[];
};

type WorkspaceInvitationsResponse = {
  success: boolean;
  data: WorkspaceInvitation[];
};

export type Workspace = {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  role: "admin" | "member";
};

type WorkspaceResponse = {
  success: boolean;
  data: Workspace;
};

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await apiFetch(`/workspaces/${workspaceId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load workspace.");
      }

      return result.data as Workspace;
    },
    enabled: Boolean(workspaceId),
  });
}

export function useWorkspaceMembers(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const response = await apiFetch(`/workspaces/${workspaceId}/members`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load workspace members.");
      }

      return (result as WorkspaceMembersResponse).data;
    },
    enabled: Boolean(workspaceId) && enabled,
  });
}

export function useWorkspaceInvitations(workspaceId: string) {
  const hasValidWorkspaceId = /^[a-f\d]{24}$/i.test(workspaceId);

  return useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: async () => {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/invitations`
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load workspace invitations."
        );
      }

      return (result as WorkspaceInvitationsResponse).data;
    },
    enabled: hasValidWorkspaceId,
  });
}
