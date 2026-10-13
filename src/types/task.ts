export type TaskStatus = "todo" | "in-progress" | "review" | "done";  // discreminated union

export type TaskAssignee = {
  _id: string;
  username?: string;
  email?: string;
  avatar?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  workspaceId?: string;
assignedTo?: string | TaskAssignee | null;
};

export type ApiTask = {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  workspaceId?: string;
assignedTo?: string | TaskAssignee | null;
};

export type GetTasksResponse = {
  success: boolean;
  message: string;
  tasks: ApiTask[];
};

export type TaskResponse = {
  success: boolean;
  message: string;
  task: ApiTask;
};

export const mapApiTaskToTask = (task: ApiTask): Task => ({
  id: task._id,
  title: task.title,
  description: task.description,
  status: task.status,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  workspaceId: task.workspaceId,
  assignedTo: task.assignedTo,
});
