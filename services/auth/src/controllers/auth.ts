import axios from "axios";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = TryCatch(async (req, res, next) => {
  const { name, email, password, phoneNumber, role, bio } = req.body;

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, "Please fill all the details");
  }

  const existingUser =
    await sql`SELECT user_id FROM users WHERE email = ${email}`;
  if (existingUser.length > 0) {
    throw new ErrorHandler(409, "User with this email already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  let registeredUser;

  if (role === "recruiter") {
    const [user] =
      await sql`INSERT INTO users (name, email, password, phone_number, role) VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}) RETURNING user_id, name, email, phone_number, role, created_at `;

    registeredUser = user;

  } else if (role === "jobseeker") {
    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Resume file is required for jobSeeker");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer?.content) {
      throw new ErrorHandler(500, "Failed to generate buffer");
    }

    if (!process.env.UPLOAD_SERVICE) {
      throw new ErrorHandler(500, "UPLOAD_SERVICE is not configured");
    }

    let uploadData: { url: string; public_id: string };

    try {
      const { data } = await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        {
          buffer: fileBuffer.content,
          folder: "resumes",
          resource_type: "auto",
        },
      );
      uploadData = data;
    } catch (error: any) {
      const uploadErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "Resume upload failed";

      console.error("Upload service error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      throw new ErrorHandler(
        error.response?.status || 502,
        `Resume upload failed: ${uploadErrorMessage}`
      );
    }

    try {
      const [user] =
        await sql`INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id) VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio || null}, ${uploadData.url}, ${uploadData.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, created_at `;

      registeredUser = user;
    } catch (dbError: any) {
      console.error("Database user creation error:", dbError);
      throw new ErrorHandler(500, dbError.message || "Failed to register user in database");
    }
  }

  const token = jwt.sign(
    { id: registeredUser?.user_id },
    process.env.JWT_SEC as string,
    { expiresIn: "15d" },
  );

  res.json({
    message: "User Registered",
    registeredUser,
    token,
  });
});

export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler(400, "Please fill all the required fields");
  }

  const user = await sql`
    SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id 
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE u.email = ${email} GROUP BY u.user_id;
  `;

  if (user.length === 0) {
    throw new ErrorHandler(400, "Invalid Credentials");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject.password);

  if (!matchPassword) {
    throw new ErrorHandler(400, "Invalid Credentials");
  }

  userObject.skills = userObject.skills || [];

  delete userObject.password;

  const token = jwt.sign(
    { id: userObject.user_id },
    process.env.JWT_SEC as string,
    { expiresIn: "15d" },
  );

  res.json({
    message: "User Login in successfully",
    userObject,
    token,
  });
});
