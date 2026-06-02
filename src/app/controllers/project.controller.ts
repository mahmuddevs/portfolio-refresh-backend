import type { Request, Response } from "express";
import { Project } from "../models/project.js";
import { response } from "../utils/apiResponse.js";
import { buildQuery } from "../utils/queryBuilder.js";

export const addProject = async (req: Request, res: Response) => {
  try {
    const { slug } = req.body;

    const existingProject = await Project.findOne({ slug });
    if (existingProject) {
      return response.error(res, {
        message: "Project with this slug already exists",
        statusCode: 400,
      });
    }

    const newProject = await Project.create(req.body);

    return response.success(res, {
      message: "Project created successfully",
      data: newProject,
      statusCode: 201,
    });
  } catch (err: any) {
    return response.error(res, {
      message: err.message || "An error occurred while adding the project",
      statusCode: 500,
    });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const result = await buildQuery(Project, req.query)
      .search(["title", "description", "role", "overview", "tags"])
      .filter()
      .sort()
      .paginate()
      .execute();

    return response.success(res, {
      message: "Projects retrieved successfully",
      data: {
        projects: result.data,
        meta: result.meta,
      },
      statusCode: 200,
    });
  } catch (err: any) {
    return response.error(res, {
      message: err.message || "An error occurred while retrieving projects",
      statusCode: 500,
    });
  }
};

export const getProjectBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== "string") {
      return response.error(res, {
        message: "Invalid project slug",
        statusCode: 400,
      });
    }

    const project = await Project.findOne({ slug });

    if (!project) {
      return response.error(res, {
        message: "Project not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: "Project retrieved successfully",
      data: project,
      statusCode: 200,
    });
  } catch (err: any) {
    return response.error(res, {
      message: err.message || "An error occurred while retrieving the project",
      statusCode: 500,
    });
  }
};

export const updateProjectBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== "string") {
      return response.error(res, {
        message: "Invalid project slug",
        statusCode: 400,
      });
    }

    if (req.body.slug && req.body.slug !== slug) {
      const existingProject = await Project.findOne({ slug: req.body.slug });
      if (existingProject) {
        return response.error(res, {
          message: "A project with the new slug already exists",
          statusCode: 400,
        });
      }
    }

    const updatedProject = await Project.findOneAndUpdate(
      { slug },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return response.error(res, {
        message: "Project not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: "Project updated successfully",
      data: updatedProject,
      statusCode: 200,
    });
  } catch (err: any) {
    return response.error(res, {
      message: err.message || "An error occurred while updating the project",
      statusCode: 500,
    });
  }
};

export const deleteProjectBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (typeof slug !== "string") {
      return response.error(res, {
        message: "Invalid project slug",
        statusCode: 400,
      });
    }

    const deletedProject = await Project.findOneAndDelete({ slug });

    if (!deletedProject) {
      return response.error(res, {
        message: "Project not found",
        statusCode: 404,
      });
    }

    return response.success(res, {
      message: "Project deleted successfully",
      data: deletedProject,
      statusCode: 200,
    });
  } catch (err: any) {
    return response.error(res, {
      message: err.message || "An error occurred while deleting the project",
      statusCode: 500,
    });
  }
};
