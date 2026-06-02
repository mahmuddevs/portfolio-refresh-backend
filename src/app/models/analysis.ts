import { Schema, model, Types } from "mongoose";

export interface IAnalysis {
  userId: Types.ObjectId;
  jobDescription: string;
  resumeFileName: string;
  resumeFilePath: string;
  metrics: {
    matchScore: number;
    missingKeywords: string[];
    strengths: string[];
    weaknesses: string[];
    actionableImprovements: string[];
  };
  rawAiResponse?: string;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    resumeFileName: {
      type: String,
      required: true,
    },
    resumeFilePath: {
      type: String,
      required: true,
    },
    metrics: {
      matchScore: {
        type: Number,
        required: true,
      },
      missingKeywords: {
        type: [String],
        required: true,
      },
      strengths: {
        type: [String],
        required: true,
      },
      weaknesses: {
        type: [String],
        required: true,
      },
      actionableImprovements: {
        type: [String],
        required: true,
      },
    },
    rawAiResponse: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Analysis = model<IAnalysis>("Analysis", AnalysisSchema);
