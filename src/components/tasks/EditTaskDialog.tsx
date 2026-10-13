"use client";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import TaskForm from "./TaskForm";
import type { Task } from "@/types/task";

type EditTaskDialogProps = {
  task: Task;
  workspaceId: string;
  canAssignTasks: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditTaskDialog({
  task,
  open,
  workspaceId,
  canAssignTasks,
  onOpenChange,
}: EditTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <TaskForm
            task={task}
            workspaceId={workspaceId}
            canAssignTasks={canAssignTasks}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
