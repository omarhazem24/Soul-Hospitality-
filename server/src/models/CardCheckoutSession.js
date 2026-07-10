import mongoose from 'mongoose';

const cardCheckoutSessionSchema = new mongoose.Schema(
  {
    merchantOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['kashier_card'],
      default: 'kashier_card',
      required: true
    },
    callbackUrl: {
      type: String,
      default: '',
      trim: true
    },
    paymentUrl: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['initiated', 'gateway_requested', 'processing', 'processed', 'failed'],
      default: 'initiated',
      index: true
    },
    paymentStatus: {
      type: String,
      default: ''
    },
    transactionReference: {
      type: String,
      default: '',
      trim: true
    },
    processedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    pricingSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    lastError: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  },
  {
    timestamps: true
  }
);

cardCheckoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CardCheckoutSession = mongoose.model('CardCheckoutSession', cardCheckoutSessionSchema);
