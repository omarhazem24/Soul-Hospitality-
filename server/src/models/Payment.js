import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true
    },
    payment_method: {
      type: String,
      enum: ['kashier_card', 'instapay', 'cash'],
      required: true,
      index: true
    },
    transaction_reference: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
      index: true
    },
    paid_at: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);
