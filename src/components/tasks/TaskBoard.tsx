"use client";


import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Search } from "lucide-react";

import {
  useWorkspaceTasks,
  useUpdateTaskStatus,
} from "@/hooks/tasks";

import type { TaskStatus } from "@/types/task";
import { useEffect, useMemo, useState } from "react";
import TaskColumn from "./TaskColumn";

const initialColumns: {
  id: TaskStatus;
  title: string;
}[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

const statuses: TaskStatus[] = [
  "todo",
  "in-progress",
  "review",
  "done",
];

const normalizeSearchText = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

type TaskBoardProps = {
  workspaceId: string;
  canAssignTasks: boolean;
  searchQuery: string;
};


export default function TaskBoard({
  workspaceId,
  canAssignTasks,
  searchQuery,
}: TaskBoardProps) {
  const {
    data: tasks = [],
    isLoading,
    error: queryError,
  } = useWorkspaceTasks(workspaceId);

  const updateTaskStatusMutation = useUpdateTaskStatus(workspaceId);

  const [mutationError, setMutationError] = useState("");
  const [columns, setColumns] = useState(initialColumns);
  const [hasLoadedColumns, setHasLoadedColumns] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = normalizeSearchText(debouncedSearchQuery);

    if (!normalizedQuery) return tasks;

    return tasks.filter((task) =>
      normalizeSearchText(task.title).includes(normalizedQuery)
    );
  }, [debouncedSearchQuery, tasks]);

  // LOAD COLUMNS FROM LOCAL STORAGE
  useEffect(() => {
    const savedColumns = localStorage.getItem("task-board-columns");

    if (savedColumns) {
      try {
        const parsedColumns = JSON.parse(savedColumns);
        setColumns(parsedColumns);
      } catch {
        console.error("Failed to load saved columns");
      }
    }

    setHasLoadedColumns(true);
  }, []);

  // SAVE COLUMNS TO LOCAL STORAGE
  useEffect(() => {
    if (!hasLoadedColumns) return;

    localStorage.setItem(
      "task-board-columns",
      JSON.stringify(columns)
    );
  }, [columns, hasLoadedColumns]);

  // DETECT MOBILE SCREEN
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // DRAG SENSORS
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // COLUMN SORTING STRATEGY
  const columnSortingStrategy = isMobile
    ? verticalListSortingStrategy
    : horizontalListSortingStrategy;

  // DRAG END
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // TASK DRAG
    if (
      !statuses.includes(activeId as TaskStatus) &&
      statuses.includes(overId as TaskStatus)
    ) {
      setMutationError("");

      try {
        await updateTaskStatusMutation.mutateAsync({
          taskId: activeId,
          status: overId as TaskStatus,
        });
      } catch (error) {
        console.error("Failed to update task status:", error);

        if (error instanceof Error) {
          setMutationError(
            error.message === "Failed to fetch"
              ? "Unable to connect to the server"
              : error.message
          );
        } else {
          setMutationError("Something went wrong");
        }
      }

      return;
    }

    // COLUMN DRAG
    const oldIndex = columns.findIndex(
      (column) => column.id === activeId
    );

    const newIndex = columns.findIndex(
      (column) => column.id === overId
    );

    if (
      oldIndex !== -1 &&
      newIndex !== -1 &&
      oldIndex !== newIndex
    ) {
      setColumns((currentColumns) =>
        arrayMove(currentColumns, oldIndex, newIndex)
      );
    }
  };

  // WAIT FOR DATA
  if (isLoading || !hasLoadedColumns) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {initialColumns.map((column) => (
          <div
            key={column.id}
            className="min-h-45 rounded-xl border bg-muted/30 p-4"
          >
            <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />

            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {(queryError || mutationError) && (
        <p className="mb-4 text-sm text-destructive">
          {mutationError ||
            (queryError instanceof Error
              ? queryError.message
              : "Failed to load tasks")}
        </p>
      )}

      {debouncedSearchQuery.trim() && filteredTasks.length === 0 ? (
        <div
          role="status"
          className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center"
        >
          <Search className="size-6 text-zinc-400" aria-hidden="true" />
          <p className="mt-3 font-medium text-zinc-800">
            No tasks match "{debouncedSearchQuery.trim()}"
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Try another title or description.
          </p>
        </div>
      ) : (
        <DndContext
          id="task-board-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((column) => column.id)}
            strategy={columnSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => (
                <TaskColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={filteredTasks}
                  workspaceId={workspaceId}
                  canAssignTasks={canAssignTasks}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
}
