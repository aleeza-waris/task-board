export type TaskStatus = "todo" | "in-progress" | "review" | "done";  // discreminated union

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
};