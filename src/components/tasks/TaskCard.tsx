"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteTask } from "@/store/slices/tasksSlice";
import type { AppDispatch } from "@/store/store";
import { Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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

type TaskCardProps = {
  task: Task;
};

function formatDueDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskCard({
  task,
}: TaskCardProps) {
  const [open, setOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

const dispatch = useDispatch<AppDispatch>();
  
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

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted"
                    aria-label="Task actions"
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
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
    setDeleteOpen(true);
  }}
  className="text-destructive focus:text-destructive"
>
  <Trash2 className="mr-2 h-4 w-4" />
  Delete task
</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <div
            className="mt-2 max-h-24 overflow-y-auto overscroll-contain pr-1 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: task.description,
            }}
          />

          {/* Due Date */}
          <div className="mt-4 flex items-center justify-between gap-3">
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

            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex items-center gap-1.5" />
                }
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDueDate(task.dueDate)}</span>
              </TooltipTrigger>

              <TooltipContent side="bottom">
                <p>Due date</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        open={open}
        onOpenChange={setOpen}
      />

      <Dialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete task?</DialogTitle>

      <DialogDescription>
        Are you sure you want to delete this task? This
        action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <button
        type="button"
        onClick={() => setDeleteOpen(false)}
        className="rounded-md border px-4 py-2 text-sm"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={() => {
          dispatch(deleteTask(task.id));
          setDeleteOpen(false);
        }}
        className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground"
      >
        Delete
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  );
}
