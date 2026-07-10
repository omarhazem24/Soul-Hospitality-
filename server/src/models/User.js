import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    profile_photo: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["Admin", "Sales", "Customer"],
      default: "Customer",
    },
    uniqueSalesId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    staffId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
