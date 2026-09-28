import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskStatus } from "../../types/task";

type TasksState = {
  tasks: Task[];
};

const initialState: TasksState = {
  tasks: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,

  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },

    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(
        (task) => task.id !== action.payload
      );
    },

    updateTaskStatus: (
      state,
      action: PayloadAction<{
        taskId: string;
        status: TaskStatus;
      }>
    ) => {
      const task = state.tasks.find(
        (task) => task.id === action.payload.taskId
      );

      if (task) {
        task.status = action.payload.status;
      }
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  setTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;