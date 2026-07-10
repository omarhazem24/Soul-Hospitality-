import { randomInt } from 'node:crypto';
import { Job } from "../models/Job.js";
import Application from "../models/Application.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadBufferToCloudinary } from "../services/cloudinaryService.js";

const APPLICATION_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateApplicationId = () => Array.from({ length: 4 }, () => APPLICATION_ID_CHARS[randomInt(APPLICATION_ID_CHARS.length)]).join('');

const createUniqueApplicationId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const applicationId = generateApplicationId();
    const existingApplication = await Application.exists({ applicationId });

    if (!existingApplication) {
      return applicationId;
    }
  }

  throw new AppError('Unable to generate a unique application ID', 500);
};

export const listJobs = asyncHandler(async (request, response) => {
  const jobs = await Job.find().sort({ createdAt: -1 });

  response.json({
    success: true,
    data: jobs,
  });
});

export const createJob = asyncHandler(async (request, response) => {
  const { title, description } = request.body;

  if (!title || !description) {
    throw new AppError("title and description are required", 400);
  }

  const job = await Job.create({ title, description });

  response.status(201).json({
    success: true,
    data: job,
  });
});

export const deleteJob = asyncHandler(async (request, response) => {
  const job = await Job.findById(request.params.id);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  await job.deleteOne();

  response.json({
    success: true,
    message: "Job deleted",
  });
});

export const submitApplication = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new AppError("CV file is required", 400);
  }

  const { jobId, fullName, email, phone } = request.body;

  if (!jobId || !fullName || !email || !phone) {
    throw new AppError("jobId, fullName, email, and phone are required", 400);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const cvUpload = await uploadBufferToCloudinary(request.file.buffer, {
    folder: "recruitment/cvs",
    resourceType: "raw",
  });

  const downloadUrl = cvUpload.secure_url.replace('/upload/', '/upload/fl_attachment/');

  const applicationId = await createUniqueApplicationId();

  const application = await Application.create({
    applicationId,
    jobId,
    fullName,
    email,
    phone,
    cvUrl: downloadUrl,
  });

  response.status(201).json({
    success: true,
    data: application,
  });
});

export const listApplications = asyncHandler(async (request, response) => {
  const applications = await Application.find()
    .populate("jobId", "title")
    .sort({ createdAt: 1 });

  response.json({
    success: true,
    data: applications,
  });
});

export const getRecruitmentSummary = asyncHandler(async (request, response) => {
  const [activeVacancies, totalApplicants, recentApplications] = await Promise.all([
    Job.countDocuments({}),
    Application.countDocuments({}),
    Application.find()
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  response.json({
    success: true,
    data: {
      activeVacancies,
      totalApplicants,
      recentApplications
    }
  });
});

export const deleteApplication = asyncHandler(async (request, response) => {
  const application = await Application.findById(request.params.id);

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  await application.deleteOne();

  response.json({
    success: true,
    message: 'Application deleted'
  });
});

export const updateApplicationStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError('status must be Pending, Reviewed, Shortlisted, or Rejected', 400);
  }

  const application = await Application.findById(request.params.id).populate('jobId', 'title');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  application.status = status;
  await application.save();

  response.json({
    success: true,
    data: application
  });
});
