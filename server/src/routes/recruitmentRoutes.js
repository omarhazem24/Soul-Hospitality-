import { Router } from "express";
import {
  listJobs,
  submitApplication,
  updateApplicationStatus,
  getRecruitmentSummary,
} from "../controllers/recruitmentController.js";
import { uploadCv } from "../middleware/uploadMiddleware.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const recruitmentRouter = Router();

recruitmentRouter.get("/jobs", listJobs);
recruitmentRouter.get(
  "/summary",
  protect,
  restrictTo("primary_admin", "secondary_admin", "hr"),
  getRecruitmentSummary,
);
recruitmentRouter.post("/apply", uploadCv.single("cv"), submitApplication);
recruitmentRouter.patch(
  "/applications/:id/status",
  protect,
  restrictTo("primary_admin", "secondary_admin", "hr"),
  updateApplicationStatus,
);

export { recruitmentRouter };
