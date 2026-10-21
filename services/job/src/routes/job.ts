import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { createCompany } from "../controllers/job.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);

export default router;