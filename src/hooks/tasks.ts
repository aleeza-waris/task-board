"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  mapApiTaskToTask,
  type ApiTask,
  type GetTasksResponse,
  type Task,
  type TaskResponse,
  type TaskStatus,
} from "@/types/task";

export const taskKeys = {
  workspace: (workspaceId: string) =>
    ["workspace-tasks", workspaceId] as const,
};

type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo?: string | null;
};

type UpdateTaskInput = {
  taskId: string;
  updates: Partial<TaskInput>;
};

type UpdateTaskStatusInput = {
  taskId: string;
  status: TaskStatus;
};

type DeleteTaskInput = {
  taskId: string;
};

type DeleteTaskResponse = {
  success: boolean;
  message: string;
};

const getTaskKey = (workspaceId: string) => taskKeys.workspace(workspaceId);

const getTaskEndpoint = (workspaceId: string) =>
  `/workspaces/${workspaceId}/tasks`;

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || "Task request failed.");
  }

  return result as T;
}

async function fetchTasks(endpoint: string): Promise<Task[]> {
  const response = await apiFetch(endpoint);
  const result = await readResponse<GetTasksResponse>(response);

  return result.tasks.map((task: ApiTask) => mapApiTaskToTask(task));
}

export function useWorkspaceTasks(workspaceId: string) {
  const hasValidWorkspaceId = /^[a-f\d]{24}$/i.test(workspaceId);

  return useQuery({
    queryKey: taskKeys.workspace(workspaceId),
    queryFn: () => fetchTasks(getTaskEndpoint(workspaceId)),
    enabled: hasValidWorkspaceId,
    refetchInterval: hasValidWorkspaceId ? 5000 : false, // query will refetch every 5 seconds if workspaceId is valid, otherwise it won't refetch
  });
}

export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInput) => {
      const { assignedTo, ...taskFields } = task;
      const response = await apiFetch(getTaskEndpoint(workspaceId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskFields, assignedTo }),
      });
      const result = await readResponse<TaskResponse>(response);

      return mapApiTaskToTask(result.task);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getTaskKey(workspaceId) }),
  });
}

export function useEditTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, updates }: UpdateTaskInput) => {
      const response = await apiFetch(
        `${getTaskEndpoint(workspaceId)}/${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      const result = await readResponse<TaskResponse>(response);

      return mapApiTaskToTask(result.task);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getTaskKey(workspaceId) }),
  });
}

export function useUpdateTaskStatus(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: UpdateTaskStatusInput) => {
      const response = await apiFetch(
        `${getTaskEndpoint(workspaceId)}/${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const result = await readResponse<TaskResponse>(response);

      return mapApiTaskToTask(result.task);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getTaskKey(workspaceId) }),
  });
}

export function useDeleteTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: DeleteTaskInput) => {
      const response = await apiFetch(
        `${getTaskEndpoint(workspaceId)}/${taskId}`,
        { method: "DELETE" }
      );

      return readResponse<DeleteTaskResponse>(response);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getTaskKey(workspaceId) }),
  });
}
