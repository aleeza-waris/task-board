"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { House, ListTodo, Menu, Users } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import { UserAvatar } from "@/components/auth/UserMenu";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useWorkspace,
  useWorkspaceInvitations,
  useWorkspaceMembers,
  type WorkspaceInvitation,
} from "@/hooks/workspaces";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const invitationStatusLabels: Record<WorkspaceInvitation["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  revoked: "Revoked",
  expired: "Expired",
};

const invitationStatusClasses: Record<WorkspaceInvitation["status"], string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-900/10",
  accepted: "bg-emerald-50 text-emerald-800 ring-emerald-900/10",
  revoked: "bg-zinc-100 text-zinc-700 ring-zinc-900/10",
  expired: "bg-red-50 text-red-700 ring-red-900/10",
};

function formatInvitationDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function WorkspaceInvitationsSection({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const invitationsQuery = useWorkspaceInvitations(workspaceId);
  const visibleInvitations =
    invitationsQuery.data?.filter(
      (invitation) => invitation.status === "pending",
    ) ?? [];
  const queryClient = useQueryClient();
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<WorkspaceInvitation | null>(null);
  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/invitations/${invitationId}`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to revoke invitation.");
      }

      return result as { message?: string };
    },
    onSuccess: async (result) => {
      toast.success(result.message || "Invitation revoked successfully.");
      setInvitationToRevoke(null);
      await queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", workspaceId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke invitation.",
      );
    },
  });

  const handleRevoke = () => {
    if (!invitationToRevoke || revokeMutation.isPending) return;
    revokeMutation.mutate(invitationToRevoke._id);
  };

  return (
    <section className="mt-10" aria-labelledby="workspace-invitations-heading">
      <div className="mb-4">
        <h2
          id="workspace-invitations-heading"
          className="text-xl font-semibold tracking-tight text-zinc-950"
        >
          Invitations
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Invitations sent to this workspace and their current status.
        </p>
      </div>

      {invitationsQuery.isLoading ? (
        <div
          role="status"
          aria-label="Loading workspace invitations"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted/60"
            />
          ))}
        </div>
      ) : invitationsQuery.isError ? (
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-destructive">
              {invitationsQuery.error instanceof Error
                ? invitationsQuery.error.message
                : "Failed to load workspace invitations."}
            </p>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => void invitationsQuery.refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : visibleInvitations.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleInvitations.map((invitation) => (
            <Card
              key={invitation._id}
              className="border border-teal-900/10 bg-white shadow-sm"
            >
              <CardContent className="min-w-0 p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <p
                    className="min-w-0 break-all text-sm font-semibold text-zinc-900"
                    title={invitation.email}
                  >
                    {invitation.email}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${invitationStatusClasses[invitation.status]}`}
                  >
                    {invitationStatusLabels[invitation.status]}
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">Invited</dt>
                    <dd className="text-right text-zinc-800">
                      <time dateTime={invitation.createdAt}>
                        {formatInvitationDate(invitation.createdAt)}
                      </time>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">Expires</dt>
                    <dd className="text-right text-zinc-800">
                      <time dateTime={invitation.expiresAt}>
                        {formatInvitationDate(invitation.expiresAt)}
                      </time>
                    </dd>
                  </div>
                </dl>
                {invitation.status === "pending" && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer border-teal-700 text-teal-800 hover:bg-teal-50"
                      disabled={revokeMutation.isPending}
                      onClick={() => setInvitationToRevoke(invitation)}
                    >
                      Revoke
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
            <h3 className="text-base font-semibold text-zinc-900">
              No pending invitations
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Pending invitations sent to new members will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(invitationToRevoke)}
        onOpenChange={(open) => {
          if (revokeMutation.isPending) return;
          if (!open) setInvitationToRevoke(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke invitation?</DialogTitle>
            <DialogDescription>
              The invitation sent to {invitationToRevoke?.email} will no longer
              be usable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={revokeMutation.isPending}
              onClick={() => setInvitationToRevoke(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="cursor-pointer bg-teal-700 text-white hover:bg-teal-800"
              disabled={revokeMutation.isPending}
              onClick={handleRevoke}
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function WorkspaceTeamPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const workspaceQuery = useWorkspace(workspaceId);
  const membersQuery = useWorkspaceMembers(workspaceId);
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiFetch(
        `/workspaces/${workspaceId}/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to send invitation.");
      }

      return result as { message?: string };
    },
    onSuccess: (result) => {
      toast.success(result.message || "Invitation sent successfully.");
      setInviteEmail("");
      setInviteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation.",
      );
    },
  });

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inviteMutation.isPending) return;

    const email = inviteEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    inviteMutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <header className="relative z-10 w-full shrink-0 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            aria-label="Open sidebar"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-teal-50 hover:text-teal-800 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <Link
            href="/"
            aria-label="Task Board home"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ListTodo className="size-5" strokeWidth={2.2} />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Task Board
            </span>
          </Link>

          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex shrink-0 items-center gap-1.5 rounded-md text-sm font-medium text-zinc-900 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <House aria-hidden="true" className="size-4 text-[#0F766E]" />
            <span>Home</span>
          </Link>

          <div className="ml-auto shrink-0">
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <WorkspaceSidebar
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          workspaceRole={workspaceQuery.data?.role}
        />

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Dialog
              open={inviteDialogOpen}
              onOpenChange={setInviteDialogOpen}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Users className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-teal-800">
                      {workspaceQuery.data?.name ?? "Workspace"}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                      Team
                    </h1>
                  </div>
                </div>
                {workspaceQuery.data?.role === "admin" && (
                  <Button
                    type="button"
                    className="cursor-pointer bg-teal-700 text-white hover:bg-teal-800"
                    onClick={() => {
                      inviteMutation.reset();
                      setInviteEmail("");
                      setInviteDialogOpen(true);
                    }}
                  >
                    Invite member
                  </Button>
                )}
              </div>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a team member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this workspace.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleInviteSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="team-invite-email">Email address</Label>
                    <Input
                      id="team-invite-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>

                  <DialogFooter className="mt-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={inviteMutation.isPending}
                      onClick={() => setInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="cursor-pointer bg-teal-700 text-white hover:bg-teal-800"
                      disabled={inviteMutation.isPending}
                    >
                      {inviteMutation.isPending
                        ? "Sending..."
                        : "Send invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <p className="mt-3 text-sm text-zinc-600">
              People who belong to this workspace and their roles.
            </p>

            {workspaceQuery.isLoading ? (
              <div
                role="status"
                aria-label="Loading workspace team"
                className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : workspaceQuery.isError ? (
              <Card className="mt-8">
                <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-destructive">
                    {workspaceQuery.error instanceof Error
                      ? workspaceQuery.error.message
                      : "Failed to load workspace."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => void workspaceQuery.refetch()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : membersQuery.isLoading ? (
              <div
                role="status"
                aria-label="Loading workspace members"
                className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : membersQuery.isError ? (
              <Card className="mt-8">
                <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-destructive">
                    {membersQuery.error instanceof Error
                      ? membersQuery.error.message
                      : "Failed to load workspace members."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => void membersQuery.refetch()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : membersQuery.data?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {membersQuery.data.map((member) => {
                  const memberUser = member.userId;
                  const username = memberUser?.username || "Workspace member";
                  const email = memberUser?.email || "Email unavailable";

                  return (
                    <Card
                      key={member._id}
                      className="border border-teal-900/10 bg-white shadow-sm"
                    >
                      <CardContent className="flex min-w-0 items-center gap-3 p-4">
                        <UserAvatar
                          user={{
                            username,
                            email,
                            avatar: memberUser?.avatar,
                          }}
                          size="large"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-semibold text-zinc-900"
                            title={username}
                          >
                            {username}
                          </p>
                          <p
                            className="truncate text-sm text-zinc-600"
                            title={email}
                          >
                            {email}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium capitalize text-teal-800 ring-1 ring-teal-900/10">
                            {member.role}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="mt-8">
                <CardContent className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Users className="size-6" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-zinc-900">
                    No team members found
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    This workspace does not have any members to display yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {workspaceQuery.data?.role === "admin" && (
              <WorkspaceInvitationsSection workspaceId={workspaceId} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
