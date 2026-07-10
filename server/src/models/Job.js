import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    id: false
  }
);

export const Job = mongoose.model('Job', jobSchema);
