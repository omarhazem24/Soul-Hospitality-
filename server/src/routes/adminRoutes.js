import { Router } from "express";
import multer from "multer";
import { protect, requireStaffPasswordChange, restrictTo } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";
import {
  listSlideshows,
  createSlideshow,
  deleteSlideshow,
} from "../controllers/slideshowController.js";
import {
  createAdminBooking,
  deleteBookingRequest,
  listBookingRequests,
  updateBookingRequestStatus,
} from "../controllers/bookingAdminController.js";
import {
  listJobs,
  createJob,
  deleteJob,
  listApplications,
  deleteApplication,
} from "../controllers/recruitmentController.js";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  listUnits,
} from "../controllers/unitAdminController.js";
import { listAllReviews, hideReview } from "../controllers/reviewController.js";
import { getAdminCommissionsSummary, getDashboardSummary } from "../controllers/dashboardController.js";
import { createStaffProfile, deleteStaffAccount, listStaffAccounts } from "../controllers/staffAdminController.js";

const adminRouter = Router();
const vanillaMulter = multer({ storage: multer.memoryStorage() });

const unitUploadDiagnostic = (request, response, next) => {
  console.log("--- Multer Diagnostic Audit ---");
  console.log("Incoming Headers:", request.headers["content-type"]);
  console.log("Body fields parsed before Multer:", request.body);
  console.log("Readable Stream State:", {
    readable: request.readable,
    readableEnded: request.readableEnded,
    complete: request.complete,
    aborted: request.aborted,
  });
  next();
};

adminRouter.get("/slideshow", listSlideshows);
adminRouter.use(protect);
adminRouter.use(requireStaffPasswordChange);

const staffOnly = restrictTo('Admin');
const recruitmentAccess = restrictTo('Admin');

adminRouter.post(
  "/slideshow",
  staffOnly,
  uploadSingleImage.single("image"),
  createSlideshow,
);
adminRouter.delete("/slideshow/:id", staffOnly, deleteSlideshow);

adminRouter.get("/bookings/requests", staffOnly, listBookingRequests);
adminRouter.post("/bookings", staffOnly, createAdminBooking);
adminRouter.patch(
  "/bookings/:id/status",
  restrictTo('Sales'),
  updateBookingRequestStatus,
);
adminRouter.delete('/bookings/:id', staffOnly, deleteBookingRequest);

adminRouter.get("/recruitment/jobs", recruitmentAccess, listJobs);
adminRouter.post("/recruitment/jobs", recruitmentAccess, createJob);
adminRouter.delete("/recruitment/jobs/:id", recruitmentAccess, deleteJob);
adminRouter.get(
  "/recruitment/applications",
  recruitmentAccess,
  listApplications,
);
adminRouter.delete(
  "/recruitment/applications/:id",
  recruitmentAccess,
  deleteApplication,
);

adminRouter.get("/units", staffOnly, listUnits);
adminRouter.post(
  "/units",
  staffOnly,
  vanillaMulter.array("photos", 15),
  unitUploadDiagnostic,
  createUnit,
);
adminRouter.put(
  "/units/:id",
  staffOnly,
  vanillaMulter.array("photos", 15),
  updateUnit,
);
adminRouter.delete("/units/:id", staffOnly, deleteUnit);

adminRouter.get("/reviews", staffOnly, listAllReviews);
adminRouter.delete("/reviews/:id", staffOnly, hideReview);

adminRouter.get("/dashboard/summary", staffOnly, getDashboardSummary);
adminRouter.get('/dashboard/commissions', staffOnly, getAdminCommissionsSummary);

adminRouter.post(
  "/create-staff",
  staffOnly,
  createStaffProfile,
);
adminRouter.get('/staff', staffOnly, listStaffAccounts);
adminRouter.delete('/staff/:id', staffOnly, deleteStaffAccount);

export { adminRouter };
