import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    photos: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
      index: true
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ unit: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
