import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    active: {
      type: Boolean,
      default: true
    },
    usedByUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const PromoCode = mongoose.model('PromoCode', promoCodeSchema);