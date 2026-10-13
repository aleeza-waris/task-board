"use client";

import { useState } from "react";

import {
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Task } from "@/types/task";
import EditTaskDialog from "./EditTaskDialog";
import { useDeleteTask } from "@/hooks/tasks";
type TaskCardProps = {
  task: Task;
  workspaceId: string;
  canAssignTasks: boolean;
};

function formatDueDate(dateString: string) {
  if (!dateString) {
    return "No due date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AssigneeAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-[10px] font-semibold text-white">
      {avatar && !imageFailed ? (
        <img
          src={avatar}
          alt=""
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}

export default function TaskCard({
  task,
  workspaceId,
  canAssignTasks,
}: TaskCardProps) {
  const [open, setOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const deleteTaskMutation = useDeleteTask(workspaceId);

  const handleDelete = async () => {
    setDeleteError("");

    try {
      await deleteTaskMutation.mutateAsync({
        taskId: task.id,
      });

      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete task:", error);

      if (error instanceof Error) {
        setDeleteError(
          error.message === "Failed to fetch"
            ? "Unable to connect to the server"
            : error.message,
        );
      } else {
        setDeleteError("Something went wrong");
      }
    }
  };

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="cursor-pointer border border-teal-900/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-700/25 hover:shadow-md"
      >
        <CardContent className="p-4">
          {/* Title + Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold tracking-tight text-zinc-900">
              {task.title}
            </div>

            {canAssignTasks && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-muted"
                      aria-label="Task actions"
                    />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="start" sideOffset={8}>
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit task
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteError("");
                      setDeleteOpen(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Description */}
          <div
            className="mt-2 max-h-24 overflow-x-hidden overflow-y-auto overscroll-contain wrap-break-words pr-1 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: task.description,
            }}
          />

          {/* Due Date */}
          <div className="mt-4 space-y-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                task.status === "todo"
                  ? "bg-muted text-muted-foreground"
                  : task.status === "in-progress"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : task.status === "review"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
              }`}
            >
              {task.status === "todo" && "To Do"}
              {task.status === "in-progress" && "In Progress"}
              {task.status === "review" && "Review"}
              {task.status === "done" && "Done"}
            </span>

            <div className="flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={<div className="flex items-center gap-1.5" />}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </TooltipTrigger>

                <TooltipContent side="bottom">
                  <p>Due date</p>
                </TooltipContent>
              </Tooltip>
              {task.assignedTo && typeof task.assignedTo === "object" ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        tabIndex={0}
                        aria-label={`Assignee: ${task.assignedTo.username || task.assignedTo.email || "Workspace member"}`}
                        className="flex size-6 cursor-default items-center justify-center rounded-full"
                      />
                    }
                  >
                    <AssigneeAvatar
                      name={
                        task.assignedTo.username ||
                        task.assignedTo.email ||
                        "Workspace member"
                      }
                      avatar={task.assignedTo.avatar}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border border-[#245451] bg-[#123B3A] text-[#F4FAF8]"
                  >
                    <p>
                      {task.assignedTo.username ||
                        task.assignedTo.email ||
                        "Workspace member"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        tabIndex={0}
                        aria-label={
                          task.assignedTo ? "Assignee" : "Assignee: none"
                        }
                        className="flex size-6 cursor-default items-center justify-center rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-900/10 dark:bg-teal-950/40 dark:text-teal-300"
                      />
                    }
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border border-[#245451] bg-[#123B3A] text-[#F4FAF8]"
                  >
                    <p>{task.assignedTo ? "Assignee" : "Assignee: none"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        workspaceId={workspaceId}
        canAssignTasks={canAssignTasks}
        open={open}
        onOpenChange={setOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
