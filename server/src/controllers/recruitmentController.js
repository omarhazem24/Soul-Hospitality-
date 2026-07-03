import { Application } from '../models/Application.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

export const submitApplication = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new AppError('Resume PDF is required', 400);
  }

  const { fullName, email, phone, position, coverLetter } = request.body;

  if (!fullName || !email || !phone || !position) {
    throw new AppError('fullName, email, phone, and position are required', 400);
  }

  const resumeUpload = await uploadBufferToCloudinary(request.file.buffer, {
    folder: 'applications/resumes',
    resourceType: 'raw'
  });

  const application = await Application.create({
    fullName,
    email,
    phone,
    position,
    resumeUrl: resumeUpload.secure_url,
    coverLetter: coverLetter || ''
  });

  response.status(201).json({
    success: true,
    data: application
  });
});

export const listApplications = asyncHandler(async (request, response) => {
  const applications = await Application.find().sort({ createdAt: -1 });

  response.json({
    success: true,
    data: applications
  });
});

export const updateApplicationStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = ['pending', 'reviewed', 'rejected'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError('Invalid application status', 400);
  }

  const application = await Application.findByIdAndUpdate(
    request.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  response.json({
    success: true,
    data: application
  });
});
