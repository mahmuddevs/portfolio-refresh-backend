import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { Analysis } from "../models/analysis.js";
import type { Types } from "mongoose";
import { env } from "../config/env.js";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    matchScore: {
      type: SchemaType.INTEGER,
      description: "Candidate's match score against the job description out of 100",
    },
    missingKeywords: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Keywords or skills missing in the candidate's resume compared to the job description",
    },
    strengths: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Strengths of the candidate relative to the job description",
    },
    weaknesses: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Weaknesses of the candidate relative to the job description",
    },
    actionableImprovements: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Actionable recommendations or improvements to make the resume a better fit",
    },
  },
  required: ["matchScore", "missingKeywords", "strengths", "weaknesses", "actionableImprovements"],
};

export const AnalyzeService = {
  // Parse raw text from PDF resume using in-memory buffer via PDFParse
  parsePdfText: async (filePath: string): Promise<string> => {
    let parser: PDFParse | null = null;
    try {
      const pdfBuffer = await fs.readFile(filePath);
      parser = new PDFParse({ data: pdfBuffer });
      const textResult = await parser.getText();
      return textResult.text;
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch { }
      }
    }
  },

  // Calls Gemini API with structured instructions and explicit schema constraints
  getGeminiAnalysis: async (jobDescription: string, resumeText: string) => {
    const systemInstruction = `
          You are an expert ATS (Applicant Tracking System) resume evaluator and job matching engine.

          Your task is to analyze a candidate's resume against a provided Job Description (JD) and produce a strict ATS-style evaluation.

          OBJECTIVES:

          1. Calculate an ATS match score between 0 and 100.
          2. Extract the MOST IMPORTANT keywords, qualifications, skills, tools, certifications, responsibilities, and requirements from the Job Description.
          3. Identify which important keywords are missing from the resume.
          4. Identify the candidate's strongest matching qualifications.
          5. Detect major resume weaknesses.
          6. Generate actionable and measurable resume improvement suggestions tailored to the specific role.

          ANALYSIS RULES:

          * Use deterministic and objective reasoning.
          * Prioritize exact keyword and qualification matching from the Job Description.
          * Focus on the most role-relevant qualifications such as:

            * hard skills
            * tools/platforms/software
            * certifications/licenses
            * industry terminology
            * responsibilities
            * years of experience
            * leadership requirements
            * technical or domain-specific expertise
            * measurable achievements
          * Soft skills should only be included if strongly emphasized in the JD.
          * Do NOT hallucinate qualifications, skills, experience, certifications, or achievements.
          * Do NOT infer experience unless explicitly stated in the resume.
          * Be ATS-oriented, strict, and concise.
          * Prefer measurable and achievement-oriented improvement suggestions.

          SCORING RULES:

          * Skills & Qualifications Match = 45%
          * Experience Relevance = 30%
          * Keyword Alignment = 15%
          * Education/Certifications = 10%

          OUTPUT RULES:

          * Return ONLY valid raw JSON.
          * Do NOT return markdown.
          * Do NOT wrap output in code blocks.
          * Do NOT include explanations outside JSON.
          * Ensure arrays contain unique values only.
          * Keep output concise and deterministic.
          * All fields must always exist.

          OUTPUT FORMAT:
          {
          "matchScore": 0,
          "missingKeywords": [],
          "strengths": [],
          "weaknesses": [],
          "actionableImprovements": []
          }
          `;


    const model = ai.getGenerativeModel({
      model: env.geminiModel,
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Job Description:\n${jobDescription}\n\nCandidate Resume Text:\n${resumeText}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0,
        topP: 0,
        topK: 1,
        candidateCount: 1,
        maxOutputTokens: 8192,
      },
    });

    const textResponse = result.response.text();
    if (!textResponse) {
      throw new Error("No response received from Gemini API.");
    }

    let sanitizedText = textResponse.trim();
    if (sanitizedText.startsWith("```")) {
      sanitizedText = sanitizedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    return {
      parsedMetrics: JSON.parse(sanitizedText),
      rawAiResponse: textResponse,
    };
  },

  // Save finalized ATS analysis report permanently to MongoDB
  saveAnalysis: async (params: {
    userId: Types.ObjectId;
    jobDescription: string;
    resumeFileName: string;
    resumeFilePath: string;
    metrics: any;
    rawAiResponse: string;
  }) => {
    const newAnalysis = new Analysis(params);
    return await newAnalysis.save();
  },
};
