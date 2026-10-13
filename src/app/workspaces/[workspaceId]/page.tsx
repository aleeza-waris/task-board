"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { useWorkspace } from "@/hooks/workspaces";
import TaskBoard from "@/components/tasks/TaskBoard";

export default function WorkspaceDetailsPage() {
  // useParams() Used in	Next.js frontend	Gets data from	Current URL in the browser	Example	/workspaces/123
  const { workspaceId } = useParams<{ workspaceId: string }>();
  // Gets the workspace ID from the browser route: /workspaces/123.

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useWorkspace(workspaceId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <WorkspaceHeader
  onMenuClick={() => setSidebarOpen(true)}
  workspaceId={workspaceId}
  canAssignTasks={workspace?.role === "admin"}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>

      <div className="relative flex min-h-0 flex-1">
        <WorkspaceSidebar
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          workspaceRole={workspace?.role}
        />

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <h1 className="text-2xl font-bold">
            {workspace?.name ?? "Workspace"}
          </h1>

          {workspace?.description && (
            <p className="mt-2 text-sm text-zinc-600">
              {workspace.description}
            </p>
          )}
          <div className="mt-6">
  <TaskBoard
    workspaceId={workspaceId}
    canAssignTasks={workspace?.role === "admin"}
    searchQuery={searchQuery}
  />
</div>
        </main>
      </div>
    </div>
  );
}
