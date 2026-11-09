import express from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const {
      buffer,
      public_id,
      folder = "resumes",
      resource_type = "auto",
    } = req.body;

    if (!buffer) {
      return res.status(400).json({ message: "No buffer provided" });
    }

    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });
        await cloudinary.uploader.destroy(public_id, {
          resource_type: "image",
        });
      } catch (destroyErr) {
        console.warn("Could not delete old asset from Cloudinary:", destroyErr);
      }
    }

    let cloud: UploadApiResponse;

    if (typeof buffer === "string" && buffer.startsWith("data:")) {
      cloud = await cloudinary.uploader.upload(buffer, {
        folder,
        resource_type,
      });
    } else {
      const base64 =
        typeof buffer === "string" && buffer.includes(",")
          ? buffer.split(",")[1]
          : buffer;
      const fileBuffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(base64, "base64");

      cloud = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type },
          (error, result) => {
            if (error) return reject(error);
            if (!result)
              return reject(new Error("No result received from Cloudinary"));
            resolve(result);
          },
        );
        stream.end(fileBuffer);
      });
    }

    return res.json({
      url: cloud.secure_url || cloud.url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    console.error("CLOUDINARY ERROR:", error);
    let detailedMessage =
      error?.error?.message || error?.message || "Upload failed";
    const statusCode = error?.http_code || 500;

    if (statusCode === 403 || detailedMessage.includes("403")) {
      detailedMessage =
        "Cloudinary error 403: Request forbidden due to missing permissions (actions=['create']). Please ensure your Cloudinary API key has 'Create' permissions enabled in Cloudinary Console (Settings > Access Keys), or verify your credentials.";
    }

    return res.status(statusCode).json({ message: detailedMessage });
  }
});

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

router.post("/career", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({
        message: "Skills required",
      });
    }

    const prompt = `
        Based on the following skills: ${skills}.
        Please act as a career advisor and generate a career path suggestion.
        Your entire response must be in a valid JSON format. Do not include any text or markdown
        formatting outside of the JSON structure.
        The JSON object should have the following structure:
        {
        "summary": "A brief, encouraging summary of the user's skill set and their general job
        title.",
        "jobOptions": [
        {
        "title": "The name of the job role.",
        "responsibilities": "A description of what the user would do in this role.",
        "why": "An explanation of why this role is a good fit for their skills."
        }
        ],
        "skillsToLearn": [
        {
        "category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
        Mastery', 'DevOps & Cloud').",
        "skills": [
        {
        "title": "The name of the skill to learn.",
        "why": "Why learning this skill is important.",
        "how": "Specific examples of how to learn or apply this skill."
        }
        ]
        }
        ],
        "learningApproach": {
        "title": "How to Approach Learning",
        "points": ["A bullet point list of actionable advice for learning."]
        }
        }
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      if (!rawText) {
        throw new Error("AI didn't return a valid text response.");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid JSON",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/resume-analyser", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({
        message: "Pdf data is required",
      });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance
Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.
The JSON object should have the following structure:

{
"atsScore": 85,
"scoreBreakdown": {
"formatting": {
"score": 90,
"feedback": "Brief feedback on formatting"
},
"keywords": {
"score": 80,
"feedback": "Brief feedback on keyword usage"
},
"structure": {
"score": 85,
"feedback": "Brief feedback on resume structure"
},
"readability": {
"score": 88,
"feedback": "Brief feedback on readability"
}
},
"suggestions": [
{
"category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
'Structure')",
"issue": "Description of the issue found",
"recommendation": "Specific actionable recommendation to fix it",
"priority": "high/medium/low"
}
],
"strengths": [
"List of things the resume does well for ATS"
],
"summary": "A brief 2-3 sentence summary of the overall ATS performance"
}
Focus on:
- File format and structure compatibility
- Proper use of standard section headings
- Keyword optimization
- Formatting issues (tables, columns, graphics, special characters)
- Contact information placement
- Date formatting
- Use of action verbs and quantifiable achievements
- Section organization and flow
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf; base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    let jsonResponse;

    try {
      const rawText = response.text
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      if (!rawText) {
        throw new Error("AI didn't return a valid text response.");
      }

      jsonResponse = JSON.parse(rawText);
    } catch (error) {
      return res.status(500).json({
        message: "Ai returned response that was not valid JSON",
        rawResponse: response.text,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});
export default router;
