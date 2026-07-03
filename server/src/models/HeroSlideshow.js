import mongoose from 'mongoose';

const heroSlideshowSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true,
      index: true
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      index: true
    },
    caption: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const HeroSlideshow = mongoose.model('HeroSlideshow', heroSlideshowSchema);
