import { z } from "zod";

export const ProjectValidationSchema = z.object({
  slug: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  images: z.array(z.string().trim()).min(1, "At least one image is required"),
  tags: z.array(z.string().trim()).min(1, "At least one tag is required"),
  githubFrontendUrl: z.string().trim().nullable().optional(),
  githubBackendUrl: z.string().trim().nullable().optional(),
  liveUrl: z.string().trim().min(1, "Live URL is required"),
  featured: z.boolean().default(false),
  role: z.string().trim().min(1, "Role is required"),
  timeline: z.string().trim().min(1, "Timeline is required"),
  overview: z.string().trim().min(1, "Overview is required"),
  challenges: z.string().trim().min(1, "Challenges description is required"),
  solution: z.string().trim().min(1, "Solution description is required"),
  features: z.array(z.string().trim()).min(1, "At least one feature is required"),
});

export type ProjectValidationType = z.infer<typeof ProjectValidationSchema>;
