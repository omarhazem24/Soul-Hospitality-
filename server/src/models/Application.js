import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    resumeUrl: {
      type: String,
      required: true
    },
    coverLetter: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected'],
      default: 'pending',
      index: true
    },
  },
  {
    timestamps: true
  }
);

export const Application = mongoose.model('Application', applicationSchema);
