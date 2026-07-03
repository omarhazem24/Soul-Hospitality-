import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    phone_number: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
      default: null
    },
    password_hash: {
      type: String,
      required: true
    },
    profile_photo: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['customer', 'secondary_admin', 'primary_admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);
