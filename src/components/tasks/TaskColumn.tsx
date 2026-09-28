"use client";

import { useMemo } from "react";
import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";

import TaskCard from "./TaskCard";

import type { Task, TaskStatus } from "@/types/task";
import type { RootState } from "@/store/store";

type TaskColumnProps = {
  id: TaskStatus;
  title: string;
};

type DraggableTaskProps = {
  task: Task;
};

function DraggableTask({ task }: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <TaskCard task={task} />
    </div>
  );
}

export default function TaskColumn({
  id,
  title,
}: TaskColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const {
    setNodeRef: setDroppableNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  const tasks = useSelector(
    (state: RootState) => state.tasks.tasks
  );

  const columnTasks = useMemo(
    () => tasks.filter((task) => task.status === id),
    [tasks, id]
  );

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setSortableNodeRef(node);
        setDroppableNodeRef(node);
      }}
      style={style}
      className={`flex min-h-30 flex-col self-start rounded-lg p-3 transition-colors sm:p-4 ${
        isOver ? "bg-primary/10" : "bg-muted/50"
      }`}
    >
      {/* Column header */}
      <div
        {...listeners}
        {...attributes}
        className="mb-4 flex touch-none cursor-grab items-center justify-between active:cursor-grabbing"
      >
        <h2 className="text-sm font-semibold sm:text-base">
          {title}
        </h2>

        <span className="rounded-full bg-background px-2 py-1 text-xs font-medium">
          {columnTasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex flex-1 flex-col gap-3">
        {columnTasks.length === 0 ? (
          <div
            className={`flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
              isOver
                ? "border-primary bg-primary/5"
                : "border-border/70"
            }`}
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-background">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              No tasks here
            </p>

            <p className="mt-1 text-xs text-muted-foreground/70">
              Drag a task here
            </p>
          </div>
        ) : (
          columnTasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
            />
          ))
        )}
      </div>
    </div>
  );
}