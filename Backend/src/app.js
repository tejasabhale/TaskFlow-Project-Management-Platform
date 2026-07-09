import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import workspaceRouter from "./routes/workspace.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import profileRouter from "./routes/profile.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import commentRouter from "./routes/comment.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workspace", workspaceRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/comments", commentRouter);

app.use(errorHandler);

export { app };
