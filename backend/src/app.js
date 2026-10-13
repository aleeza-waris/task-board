import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";

const app = express()

// global middlewares
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://task-board-delta-amber.vercel.app"
  ],
  credentials: true
}));

app.use(express.json())

app.use(cookieParser());

// routes
// for registering new users
app.use("/api/auth", authRoutes);
// workspace Routes
app.use("/api/workspaces", workspaceRouter);
// centeralized error handling middleware
app.use(errorHandler);

export default app
