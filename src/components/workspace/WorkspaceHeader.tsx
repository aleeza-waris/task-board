"use client";

import Link from "next/link";
import { House, ListTodo, Menu, Search } from "lucide-react";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import UserMenu from "@/components/auth/UserMenu";

type WorkspaceHeaderProps = {
  onMenuClick: () => void;
  workspaceId: string;
  canAssignTasks: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};
export default function WorkspaceHeader({
  onMenuClick,
  workspaceId,
  canAssignTasks,
  searchQuery,
  onSearchChange,
}: WorkspaceHeaderProps) {
  return (
    <header className="relative z-10 w-full shrink-0 border-b border-zinc-200 bg-[#FFFFFF] text-zinc-950">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap sm:px-6">
        <button
          type="button"
          aria-label="Open sidebar"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-teal-50 hover:text-teal-800 md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          aria-label="Task Board home"
          className="flex shrink-0 cursor-pointer items-center gap-3"
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
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-zinc-900 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          <House aria-hidden="true" className="size-4 text-[#0F766E]" />
          <span>Home</span>
        </Link>

        <div className="relative order-last w-full sm:order-0 sm:mx-auto sm:max-w-xl sm:flex-1">
          <label htmlFor="workspace-task-search" className="sr-only">
            Search tasks
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="workspace-task-search"
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white py-2 pr-3 pl-9 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {canAssignTasks && (
            <CreateTaskDialog
              workspaceId={workspaceId}
              canAssignTasks={canAssignTasks}
            />
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
