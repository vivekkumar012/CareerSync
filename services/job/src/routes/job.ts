import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { createCompany, createJob, deleteCompany } from "../controllers/job.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob); 

export default router;