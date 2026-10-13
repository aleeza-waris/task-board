"use client";

import { useEffect,useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Task } from "@/types/task";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

import RichTextEditor from "./RichTextEditor";
import { useCreateTask, useEditTask } from "@/hooks/tasks";
import { useWorkspaceMembers } from "@/hooks/workspaces";

const UNASSIGNED_VALUE = "__unassigned__";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  status: z.enum(["todo", "in-progress", "review", "done"]),
  dueDate: z.string(),
  assignedTo: z.string().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type TaskFormProps = {
  task?: Task;
   workspaceId: string;
  canAssignTasks: boolean;
  onSuccess: () => void;
};

export default function TaskForm({
  task,
  onSuccess,
  workspaceId,
  canAssignTasks,
}: TaskFormProps) {
  const [error, setError] = useState("");

const createTaskMutation = useCreateTask(workspaceId);
const editTaskMutation = useEditTask(workspaceId);
const workspaceMembersQuery = useWorkspaceMembers(workspaceId, canAssignTasks);
const workspaceMembers = workspaceMembersQuery.data ?? [];

const isSubmitting =
  createTaskMutation.isPending || editTaskMutation.isPending;
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      dueDate: task?.dueDate ?? "",
      assignedTo:
        typeof task?.assignedTo === "string"
          ? task.assignedTo
          : task?.assignedTo?._id ?? null,
    },
  });

  useEffect(() => {
  if (!task) return;

  reset({
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    assignedTo:
      typeof task.assignedTo === "string"
        ? task.assignedTo
        : task.assignedTo?._id ?? null,
  });

}, [task, reset]);


const onSubmit = async (values: TaskFormValues) => {
  setError("");

  const token = localStorage.getItem("token");

  if (!token) {
    setError("Please log in to continue");
    return;
  }

  try {
    if (task) {
      await editTaskMutation.mutateAsync({
        taskId: task.id,
        updates: {
          title: values.title,
          description: values.description,
          status: values.status,
          dueDate: values.dueDate,
          ...(canAssignTasks ? { assignedTo: values.assignedTo } : {}),
        },
      });
    } else {
      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status,
        dueDate: values.dueDate,
        ...(canAssignTasks ? { assignedTo: values.assignedTo } : {}),
      });
    }

    onSuccess();
  } catch (error) {
    console.error("Failed to save task:", error);

    if (error instanceof Error) {
      setError(
        error.message === "Failed to fetch"
          ? "Unable to connect to the server"
          : error.message
      );
    } else {
      setError("Something went wrong");
    }
  }
};


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
    {error && (
  <p className="text-sm text-destructive">
    {error}
  </p>
)}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4 pr-2">
        {/* Title */}
        <div>
        <label className="mb-1.5 block text-sm font-medium">
          Title
        </label>

       <Controller
  name="title"
  control={control}
  render={({ field }) => (
    <Input
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      placeholder="Enter task title"
      className="font-semibold"
    />
  )}
/>

        {errors.title && (
          <p className="mt-1 text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
        </div>

        {/* Description */}
        <div>
        <label className="mb-1.5 block text-sm font-medium">
          Description
        </label>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {errors.description && (
          <p className="mt-1 text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        </div>

        {/* Status + Due Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Status
          </label>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todo">
                    To Do
                  </SelectItem>
                  <SelectItem value="in-progress">
                    In Progress
                  </SelectItem>
                  <SelectItem value="review">
                    Review
                  </SelectItem>
                  <SelectItem value="done">
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Due Date
          </label>

          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {field.value || "Select due date"}
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                 <Calendar
  mode="single"
  selected={
    field.value
      ? new Date(`${field.value}T00:00:00`)
      : undefined
  }
  disabled={(date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date <= today;
  }}
  onSelect={(date) => {
    if (!date) return;

    field.onChange(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`
    );
  }}
/>
                </PopoverContent>
              </Popover>
            )}
          />

          {errors.dueDate && (
            <p className="mt-1 text-sm text-destructive">
              {errors.dueDate.message}
            </p>
          )}
        </div>
        </div>

        {canAssignTasks && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Assigned To
            </label>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value === UNASSIGNED_VALUE ? null : value)
                  }
                  disabled={workspaceMembersQuery.isLoading || workspaceMembersQuery.isError}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        workspaceMembersQuery.isLoading
                          ? "Loading members..."
                          : "Select a member"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {workspaceMembers.map((member) =>
                      member.userId ? (
                        <SelectItem key={member.userId._id} value={member.userId._id}>
                          {member.userId.username || member.userId.email || "Workspace member"}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {workspaceMembersQuery.isError && (
              <p className="mt-1 text-sm text-destructive">
                Unable to load workspace members.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex shrink-0 justify-end border-t bg-popover pt-4">
        {task && !canAssignTasks ? (
          <Button type="button" onClick={onSuccess}>
            Close
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? task
                ? "Updating..."
                : "Creating..."
              : task
                ? "Update Task"
                : "Create Task"}
          </Button>
        )}
      </div>
    </form>
  );
}
