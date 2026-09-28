"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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

import type { RootState, AppDispatch } from "@/store/store";

import {
  setTasks,
  updateTaskStatus,
} from "@/store/slices/tasksSlice";

import type { TaskStatus } from "@/types/task";

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

export default function TaskBoard() {
  const dispatch = useDispatch<AppDispatch>();

  const tasks = useSelector(
    (state: RootState) => state.tasks.tasks
  );

  const [columns, setColumns] = useState(initialColumns);

  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);
  const [hasLoadedColumns, setHasLoadedColumns] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // --------------------------------
  // LOAD TASKS FROM LOCAL STORAGE
  // --------------------------------

  useEffect(() => {
    const savedTasks = localStorage.getItem("task-board-tasks");

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        dispatch(setTasks(parsedTasks));
      } catch {
        console.error("Failed to load saved tasks");
      }
    }

    setHasLoadedTasks(true);
  }, [dispatch]);

  // --------------------------------
  // SAVE TASKS TO LOCAL STORAGE
  // --------------------------------

  useEffect(() => {
    if (!hasLoadedTasks) return;

    localStorage.setItem(
      "task-board-tasks",
      JSON.stringify(tasks)
    );
  }, [tasks, hasLoadedTasks]);

  // --------------------------------
  // LOAD COLUMNS FROM LOCAL STORAGE
  // --------------------------------

  useEffect(() => {
    const savedColumns = localStorage.getItem(
      "task-board-columns"
    );

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

  // --------------------------------
  // SAVE COLUMNS TO LOCAL STORAGE
  // --------------------------------

  useEffect(() => {
    if (!hasLoadedColumns) return;

    localStorage.setItem(
      "task-board-columns",
      JSON.stringify(columns)
    );
  }, [columns, hasLoadedColumns]);

  // --------------------------------
  // DETECT MOBILE SCREEN
  // --------------------------------

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 767px)"
    );

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  // --------------------------------
  // DRAG SENSORS
  // --------------------------------

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

  // --------------------------------
  // COLUMN SORTING STRATEGY
  // --------------------------------

  const columnSortingStrategy = isMobile
    ? verticalListSortingStrategy
    : horizontalListSortingStrategy;

  // --------------------------------
  // DRAG END
  // --------------------------------

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // --------------------------------
    // TASK DRAG
    // --------------------------------

    if (
      !statuses.includes(activeId as TaskStatus) &&
      statuses.includes(overId as TaskStatus)
    ) {
      dispatch(
        updateTaskStatus({
          taskId: activeId,
          status: overId as TaskStatus,
        })
      );

      return;
    }

    // --------------------------------
    // COLUMN DRAG
    // --------------------------------

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
        arrayMove(
          currentColumns,
          oldIndex,
          newIndex
        )
      );
    }
  };

  // --------------------------------
  // WAIT FOR LOCAL STORAGE
  // --------------------------------

  if (!hasLoadedTasks || !hasLoadedColumns) {
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
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
