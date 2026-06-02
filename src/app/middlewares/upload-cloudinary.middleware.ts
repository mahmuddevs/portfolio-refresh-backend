import type { Request, Response, NextFunction } from "express";
import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary-config.js";

export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hasImagesInBody = "images" in req.body;
    const hasFiles = req.files && Array.isArray(req.files) && req.files.length > 0;

    // 1. Process files and existing image URLs if provided
    if (hasImagesInBody || hasFiles) {
      let existingImages: string[] = [];
      if (req.body.images) {
        if (typeof req.body.images === "string") {
          try {
            existingImages = JSON.parse(req.body.images);
          } catch {
            existingImages = req.body.images
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        } else if (Array.isArray(req.body.images)) {
          existingImages = req.body.images;
        }
      }

      if (hasFiles) {
        const uploadedUrls: string[] = [];
        const filesArray = req.files as Express.Multer.File[];

        for (const file of filesArray) {
          const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "projects",
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );

            Readable.from(file.buffer).pipe(uploadStream);
          });

          uploadedUrls.push(uploadResult.secure_url);
        }
        req.body.images = [...existingImages, ...uploadedUrls];
      } else {
        req.body.images = existingImages;
      }
    }

    // 2. Parse other stringified array fields from multipart/form-data
    const arrayFields = ["tags", "features"];
    for (const field of arrayFields) {
      if (typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch {
          req.body[field] = req.body[field]
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      }
    }

    // 3. Parse boolean fields
    if (typeof req.body.featured === "string") {
      req.body.featured = req.body.featured === "true";
    }

    next();
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed: " + error.message,
    });
  }
};
