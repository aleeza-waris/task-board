"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { addTask, updateTask } from "@/store/slices/tasksSlice";
import type { AppDispatch } from "@/store/store";
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

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["todo", "in-progress", "review", "done"]),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type TaskFormProps = {
  task?: Task;
  onSuccess: () => void;
};

export default function TaskForm({
  task,
  onSuccess,
}: TaskFormProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [isDescriptionOpen, setIsDescriptionOpen] =
    useState(false);

  const [descriptionDraft, setDescriptionDraft] =
    useState(task?.description ?? "");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      dueDate: task?.dueDate ?? "",
    },
  });

  useEffect(() => {
  if (!task) return;

  reset({
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
  });

  setDescriptionDraft(task.description);
  setIsDescriptionOpen(false);
}, [task, reset]);

  const onSubmit = (values: TaskFormValues) => {
    if (task) {
      dispatch(
        updateTask({
          ...task,
          title: values.title,
          description: values.description,
          status: values.status,
          dueDate: values.dueDate,
        })
      );
    } else {
      dispatch(
        addTask({
          id: crypto.randomUUID(),
          title: values.title,
          description: values.description,
          status: values.status,
          dueDate: values.dueDate,
          createdAt: new Date().toISOString().split("T")[0],
        })
      );
    }

    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Title
        </label>

        <Input
          {...register("title")}
          placeholder="Enter task title"
          className="font-semibold"
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

        {!isDescriptionOpen ? (
          <button
            type="button"
            onClick={() => setIsDescriptionOpen(true)}
            className="w-full rounded-md border border-input px-3 py-3 text-left text-sm transition-colors hover:bg-muted/50"
          >
            {descriptionDraft ? (
              <div
                className="text-foreground"
                dangerouslySetInnerHTML={{
                  __html: descriptionDraft,
                }}
              />
            ) : (
              <span className="text-muted-foreground">
                Add a description...
              </span>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <RichTextEditor
              value={descriptionDraft}
              onChange={setDescriptionDraft}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDescriptionDraft(
                    task?.description ?? ""
                  );
                  setIsDescriptionOpen(false);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setValue(
                    "description",
                    descriptionDraft,
                    {
                      shouldValidate: true,
                    }
                  );

                  setIsDescriptionOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}

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

      {/* Submit */}
      <div className="flex justify-end border-t pt-4">
        <Button type="submit">
          {task ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}