import { Schema, model } from "mongoose";

export interface IProject {
  slug: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  githubFrontendUrl?: string | null;
  githubBackendUrl?: string | null;
  liveUrl: string;
  featured: boolean;
  role: string;
  timeline: string;
  overview: string;
  challenges: string;
  solution: string;
  features: string[];
}

const ProjectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    images: [{ type: String, required: true }],
    tags: [{ type: String, required: true }],
    githubFrontendUrl: { type: String, default: null, trim: true },
    githubBackendUrl: { type: String, default: null, trim: true },
    liveUrl: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    role: { type: String, required: true, trim: true },
    timeline: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    challenges: { type: String, required: true, trim: true },
    solution: { type: String, required: true, trim: true },
    features: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", ProjectSchema);
