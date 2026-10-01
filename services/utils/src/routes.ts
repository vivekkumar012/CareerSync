import express from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id, folder = "resumes", resource_type = "auto" } = req.body;

    if (!buffer) {
      return res.status(400).json({ message: "No buffer provided" });
    }

    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });
        await cloudinary.uploader.destroy(public_id, { resource_type: "image" });
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
            if (!result) return reject(new Error("No result received from Cloudinary"));
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    }

    return res.json({ url: cloud.secure_url || cloud.url, public_id: cloud.public_id });
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

export default router;
