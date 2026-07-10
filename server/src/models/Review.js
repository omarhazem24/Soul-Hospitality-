import mongoose from 'mongoose';
import Unit from './Unit.js';

const reviewSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    guestName: {
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
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
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

reviewSchema.index({ unitId: 1, createdAt: -1 });

reviewSchema.statics.syncUnitRating = async function syncUnitRating(unitId) {
  const aggregation = await this.aggregate([
    {
      $match: {
        unitId: new mongoose.Types.ObjectId(unitId),
        status: 'visible'
      }
    },
    {
      $group: {
        _id: '$unitId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const stats = aggregation[0] || { averageRating: 0, reviewCount: 0 };

  await Unit.findByIdAndUpdate(
    unitId,
    {
      averageRating: Number(stats.averageRating || 0),
      reviewCount: Number(stats.reviewCount || 0)
    },
    { new: false }
  );
};

reviewSchema.post('save', async function reviewPostSaveHook() {
  await this.constructor.syncUnitRating(this.unitId);
});

export const Review = mongoose.model('Review', reviewSchema);
