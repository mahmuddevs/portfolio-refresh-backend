import express from "express";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./app/utils/logger.js";
import { response } from "./app/utils/apiResponse.js";
import router from "./app/routes/routes.js";
import * as helmetModule from "helmet";

import { env } from "./app/config/env.js";

const app = express();

// -----------------------------
// Middleware
// -----------------------------
// CORS setup
app.use(
  cors({
    origin: [env.clientUrl, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Parse JSON bodies
app.use(helmetModule.default());
app.use(express.json());
// Parse cookies
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Morgan logging
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: morganStream }));
}

// -----------------------------
// Routes
// -----------------------------
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Running");
});
app.use("/api", router);

// -----------------------------
// Global error handler
// -----------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  response.error(res, { message: err.message || "Internal Server Error" });
});

export default app;
