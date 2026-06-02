import { Router } from "express";
import authRoutes from "./auth/auth.route.js";
import projectRoutes from "./projects/project.route.js";

const router = Router();

router.use("/auth", authRoutes)
router.use("/projects", projectRoutes)

export default router;
