"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  EllipsisVertical,
  House,
  ListTodo,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistance } from "date-fns";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

type WorkspaceRole = "admin" | "member";
type WorkspaceSortOrder = "recently-updated" | "default";

type Workspace = {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
};

type WorkspaceMemberSummary = {
  userId: {
    username: string;
    email: string;
  } | null;
};

export default function WorkspacesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [workspaceSortOrder, setWorkspaceSortOrder] =
    useState<WorkspaceSortOrder>("recently-updated");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [error, setError] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editWorkspaceName, setEditWorkspaceName] = useState("");
  const [editWorkspaceDescription, setEditWorkspaceDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const {
    data: workspaces = [],
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await apiFetch("/workspaces");

      if (!response.ok) {
        throw new Error("Failed to fetch workspaces.");
      }

      const result = await response.json();
      return result.data;
    },
  });

  const workspaceMemberQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: ["workspace-members", workspace._id],
      queryFn: async (): Promise<WorkspaceMemberSummary[]> => {
        const response = await apiFetch(
          `/workspaces/${workspace._id}/members`,
        );

        if (!response.ok) {
          throw new Error("Failed to load workspace members.");
        }

        const result = await response.json();
        return result.data;
      },
    })),
  });

  const sortedWorkspaces = [...workspaces];
  if (workspaceSortOrder === "recently-updated") {
    sortedWorkspaces.sort((first, second) => {
      const firstUpdatedAt = Date.parse(first.updatedAt);
      const secondUpdatedAt = Date.parse(second.updatedAt);

      if (Number.isNaN(firstUpdatedAt)) {
        return Number.isNaN(secondUpdatedAt) ? 0 : 1;
      }
      if (Number.isNaN(secondUpdatedAt)) return -1;

      return secondUpdatedAt - firstUpdatedAt;
    });
  }
  const normalizedSearch = workspaceSearch.trim().toLowerCase();
  const visibleWorkspaces = sortedWorkspaces.filter((workspace) =>
    `${workspace.name} ${workspace.description}`
      .toLowerCase()
      .includes(normalizedSearch),
  );
  const recentlyActiveCount =
    currentTime === null
      ? null
      : workspaces.filter((workspace) => {
          const updatedAt = Date.parse(workspace.updatedAt);
          return (
            !Number.isNaN(updatedAt) &&
            updatedAt <= currentTime &&
            currentTime - updatedAt < 7 * 24 * 60 * 60 * 1000
          );
        }).length;

  const createWorkspaceMutation = useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => {
      const response = await apiFetch("/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.message || "Failed to create workspace.");
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      toast.success("Workspace created successfully.");
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({
      workspaceId,
      name,
      description,
    }: {
      workspaceId: string;
      name: string;
      description: string;
    }) => {
      const response = await apiFetch(`/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to update workspace.");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      setEditDialogOpen(false);
      setEditingWorkspace(null);

      toast.success("Workspace updated successfully.");
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await apiFetch(`/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.message || "Failed to delete workspace.");
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      setDeleteDialogOpen(false);
      setDeletingWorkspace(null);
      setDeleteError("");

      toast.success("Workspace deleted successfully.");
    },
  });

  const handleCreateWorkspace = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = workspaceName.trim();
    const description = workspaceDescription.trim();

    if (!name) {
      setError("Please enter a workspace name.");
      return;
    }

    if (description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    setError("");

    try {
      await createWorkspaceMutation.mutateAsync({
        name,
        description,
      });

      setWorkspaceName("");
      setWorkspaceDescription("");
      setError("");
      setDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace.",
      );
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (createWorkspaceMutation.isPending) return;

    setDialogOpen(open);

    if (!open) {
      setError("");
    }
  };

  const handleEditWorkspaceOpen = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditWorkspaceName(workspace.name);
    setEditWorkspaceDescription(workspace.description ?? "");
    setEditError("");
    setEditDialogOpen(true);
  };

  const handleEditWorkspace = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingWorkspace) return;

    const name = editWorkspaceName.trim();
    const description = editWorkspaceDescription.trim();

    if (!name) {
      setEditError("Please enter a workspace name.");
      return;
    }

    if (name.length > 80) {
      setEditError("Workspace name cannot exceed 80 characters.");
      return;
    }

    if (description.length > 500) {
      setEditError("Description cannot exceed 500 characters.");
      return;
    }

    setEditError("");

    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId: editingWorkspace._id,
        name,
        description,
      });
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update workspace.",
      );
    }
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    if (updateWorkspaceMutation.isPending) return;

    setEditDialogOpen(open);
    if (!open) {
      setEditingWorkspace(null);
      setEditError("");
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F8F7] text-foreground">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link
            href="/"
            aria-label="Task Board home"
            className="flex min-w-0 cursor-pointer items-center gap-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ListTodo className="size-5" strokeWidth={2.2} />
            </span>

            <span className="truncate text-lg font-semibold tracking-tight">
              Task Board
            </span>
          </Link>

          <Link
            href="/"
            aria-label="Go to homepage"
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-zinc-900 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            <House aria-hidden="true" className="size-4 text-[#0F766E]" />
            <span>Home</span>
          </Link>

          <Button
            className="shrink-0 cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <Plus />
            <span className="hidden sm:inline">Create Workspace</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">
              YOUR WORKSPACES
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Where your team gets{" "}
              <span className="text-teal-700">work done</span>
            </h1>

            <p className="mt-3 text-[#52525B]">
              Open a workspace to manage tasks, collaborate with your team, and
              keep your projects moving.
            </p>
          </div>

          {!isLoading && !isError && workspaces.length > 0 && (
            <div className="inline-flex w-fit shrink-0 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5">
              <span className="text-xs font-medium uppercase tracking-wide text-[#71717A]">
                Your overview
              </span>
              <span className="h-5 w-px bg-zinc-200" aria-hidden="true" />
              <p className="whitespace-nowrap text-sm font-semibold text-[#09090B]">
                {workspaces.length}{" "}
                {workspaces.length === 1 ? "workspace" : "workspaces"}
              </p>
              <span className="h-5 w-px bg-zinc-200" aria-hidden="true" />
              <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#52525B]">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-teal-600"
                />
                <span>
                  {recentlyActiveCount ?? "—"} recently active
                  <span className="sr-only"> in the last 7 days</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <Card className="mt-10">
            <CardContent className="flex min-h-64 items-center justify-center">
              <p role="status" className="text-sm text-muted-foreground">
                Loading workspaces...
              </p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="mt-10">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="text-sm text-destructive">
                {queryError instanceof Error
                  ? queryError.message
                  : "Failed to load workspaces."}
              </p>

              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : workspaces.length === 0 ? (
          <Card className="mt-10">
            <CardContent className="flex min-h-64 flex-col items-center justify-center py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
                <ListTodo
                  className="size-7 text-muted-foreground"
                  strokeWidth={2.2}
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold">No workspaces yet</h2>

              <p className="mt-2 max-w-sm text-sm text-[#52525B]">
                Create your first workspace to organize tasks and bring your
                team together.
              </p>

              <Button
                className="mt-6 cursor-pointer"
                onClick={() => setDialogOpen(true)}
              >
                <Plus />
                Create your first workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[min(100%,42rem)]">
                <div className="relative">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                  />
                  <Input
                    aria-label="Search workspaces"
                    className="h-10 border-zinc-200 bg-white pl-10"
                    onChange={(event) => setWorkspaceSearch(event.target.value)}
                    placeholder="Search workspaces..."
                    type="search"
                    value={workspaceSearch}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <label
                    htmlFor="workspace-sort-order"
                    className="text-sm text-[#52525B]"
                  >
                    Sort by
                  </label>
                  <Select
                    value={workspaceSortOrder}
                    onValueChange={(value) => {
                      if (
                        value === "recently-updated" ||
                        value === "default"
                      ) {
                        setWorkspaceSortOrder(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="workspace-sort-order"
                      className="w-48 cursor-pointer border-zinc-200 bg-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recently-updated">
                        Recently updated
                      </SelectItem>
                      <SelectItem value="default">Default order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {visibleWorkspaces.length === 0 ? (
              <Card className="mt-5 border-zinc-200 bg-white">
                <CardContent className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
                  <Search className="size-6 text-zinc-400" aria-hidden="true" />
                  <h2 className="mt-3 font-semibold text-[#09090B]">
                    No matching workspaces
                  </h2>
                  <p className="mt-1 text-sm text-[#52525B]">
                    Try a different search term.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-4 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleWorkspaces.map((workspace) => {
                const membersQuery = workspaceMemberQueries.find(
                  (_, index) => workspaces[index]._id === workspace._id,
                );
                const members = membersQuery?.data ?? [];
                const updatedAt = Date.parse(workspace.updatedAt);
                const updatedLabel = Number.isNaN(updatedAt)
                  ? "Update time unavailable"
                  : currentTime === null
                    ? "Updated recently"
                    : `Updated ${formatDistance(
                        new Date(updatedAt),
                        new Date(currentTime),
                        { addSuffix: true },
                      )}`;

                return (
                <Card
                  key={workspace._id}
                  className="min-w-0 overflow-hidden border border-zinc-200 border-t-2 border-t-teal-600 bg-card transition-colors hover:bg-linear-to-br hover:from-teal-50/70 hover:via-white hover:to-emerald-50/70 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <ListTodo className="size-5" strokeWidth={2.2} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium capitalize text-teal-700">
                          {workspace.role}
                        </span>

                        {workspace.role === "admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Manage ${workspace.name}`}
                              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-teal-50 hover:text-teal-700"
                            >
                              <EllipsisVertical className="size-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditWorkspaceOpen(workspace)
                                }
                              >
                                <Pencil />
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  setDeletingWorkspace(workspace);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <CardTitle className="wrap-break-word pt-3">
                      {workspace.name}
                    </CardTitle>

                    <CardDescription className="flex items-center gap-2">
                      <Users className="size-4 shrink-0" />
                      Workspace
                    </CardDescription>

                    {workspace.description && (
                      <p className="max-h-20 overflow-y-auto whitespace-pre-wrap wrap-break-word pr-1 text-sm text-[#52525B]">
                        {workspace.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      {membersQuery?.isError ? (
                        <p className="text-xs text-destructive">
                          Team details unavailable
                        </p>
                      ) : membersQuery?.isLoading ? (
                        <p className="text-xs text-[#71717A]">
                          Loading team...
                        </p>
                      ) : (
                        <div
                          aria-label={`${members.length} workspace ${members.length === 1 ? "member" : "members"}`}
                          className="flex items-center"
                        >
                          <div className="flex -space-x-2">
                            {members.slice(0, 3).map((member, index) => {
                              const label =
                                member.userId?.username ||
                                member.userId?.email ||
                                "Workspace member";
                              const initials = label
                                .split(/[\s@._-]+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0].toUpperCase())
                                .join("");

                              return (
                                <span
                                  key={`${workspace._id}-${index}`}
                                  aria-label={label}
                                  className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-teal-50 text-[10px] font-semibold text-teal-800"
                                  title={label}
                                >
                                  {initials || "?"}
                                </span>
                              );
                            })}
                          </div>
                          {members.length > 3 && (
                            <span className="ml-2 text-xs text-[#71717A]">
                              +{members.length - 3} members
                            </span>
                          )}
                          {members.length > 0 && members.length <= 3 && (
                            <span className="ml-2 text-xs text-[#71717A]">
                              {members.length}{" "}
                              {members.length === 1 ? "member" : "members"}
                            </span>
                          )}
                        </div>
                      )}
                      <span className="flex shrink-0 items-center gap-1 text-xs text-[#71717A]">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {updatedLabel}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800"
                      onClick={() =>
                        router.push(`/workspaces/${workspace._id}`)
                      }
                    >
                      Open Workspace
                      <ArrowRight />
                    </Button>
                  </CardContent>
                </Card>
                );
              })}
            </div>
            )}
          </>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>

            <DialogDescription>
              Give your workspace a name and an optional description. You will
              be its admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateWorkspace} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-medium">
                Workspace name
              </label>

              <Input
                id="workspace-name"
                autoFocus
                maxLength={80}
                placeholder="e.g. Website Redesign"
                value={workspaceName}
                disabled={createWorkspaceMutation.isPending}
                onChange={(event) => {
                  setWorkspaceName(event.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="workspace-description"
                className="text-sm font-medium"
              >
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>

              <textarea
                id="workspace-description"
                placeholder="What is this workspace for?"
                maxLength={500}
                rows={3}
                value={workspaceDescription}
                disabled={createWorkspaceMutation.isPending}
                onChange={(event) => {
                  setWorkspaceDescription(event.target.value);
                  setError("");
                }}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="text-xs text-muted-foreground">
                Up to 500 characters.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={createWorkspaceMutation.isPending}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="cursor-pointer"
                disabled={createWorkspaceMutation.isPending}
              >
                {createWorkspaceMutation.isPending
                  ? "Creating..."
                  : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update the workspace name and description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditWorkspace} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="edit-workspace-name"
                className="text-sm font-medium"
              >
                Workspace name
              </label>
              <Input
                id="edit-workspace-name"
                autoFocus
                maxLength={80}
                value={editWorkspaceName}
                disabled={updateWorkspaceMutation.isPending}
                onChange={(event) => {
                  setEditWorkspaceName(event.target.value);
                  setEditError("");
                }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-workspace-description"
                className="text-sm font-medium"
              >
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>
              <textarea
                id="edit-workspace-description"
                maxLength={500}
                rows={3}
                value={editWorkspaceDescription}
                disabled={updateWorkspaceMutation.isPending}
                onChange={(event) => {
                  setEditWorkspaceDescription(event.target.value);
                  setEditError("");
                }}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Up to 500 characters.
              </p>
            </div>

            {editError && (
              <p role="alert" className="text-sm text-destructive">
                {editError}
              </p>
            )}

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={updateWorkspaceMutation.isPending}
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={updateWorkspaceMutation.isPending}
              >
                {updateWorkspaceMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingWorkspace?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                if (deleteWorkspaceMutation.isPending) return;

                setDeleteDialogOpen(false);
                setDeletingWorkspace(null);
                setDeleteError("");
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              disabled={deleteWorkspaceMutation.isPending}
              onClick={async () => {
                if (!deletingWorkspace) return;

                setDeleteError("");

                try {
                  await deleteWorkspaceMutation.mutateAsync(
                    deletingWorkspace._id,
                  );
                } catch (err) {
                  setDeleteError(
                    err instanceof Error
                      ? err.message
                      : "Failed to delete workspace.",
                  );
                }
              }}
            >
              {deleteWorkspaceMutation.isPending
                ? "Deleting..."
                : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
