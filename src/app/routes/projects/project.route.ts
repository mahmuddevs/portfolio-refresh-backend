import { Router } from "express";

import { addProject, getProjects, getProjectBySlug, updateProjectBySlug, deleteProjectBySlug } from "../../controllers/project.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ProjectValidationSchema } from "../../schemas/project.schema.js";
import verifyAuth from "../../middlewares/verify-auth.middleware.js";
import { upload } from "../../config/multer.js";
import { uploadToCloudinary } from "../../middlewares/upload-cloudinary.middleware.js";

const projectRoutes = Router();

projectRoutes.get("/", getProjects);
projectRoutes.get("/:slug", getProjectBySlug);
projectRoutes.post("/add", verifyAuth, upload.array("images", 10), uploadToCloudinary, validate(ProjectValidationSchema), addProject);
projectRoutes.patch("/:slug", verifyAuth, upload.array("images", 10), uploadToCloudinary, validate(ProjectValidationSchema.partial()), updateProjectBySlug);
projectRoutes.delete("/:slug", verifyAuth, deleteProjectBySlug);

export default projectRoutes;