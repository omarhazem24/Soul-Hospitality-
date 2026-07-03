import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      name: {
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
      nationality: {
        type: String,
        default: '',
        trim: true
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      alias: 'user_id',
      required: true,
      index: true
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      alias: 'unit_id',
      required: true,
      index: true
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      alias: 'unit_id',
      required: true,
      index: true
    },
    dates: {
      checkIn: {
        type: Date,
        required: true,
        index: true
      },
      checkOut: {
        type: Date,
        required: true,
        index: true
      }
    },
    startDate: {
      type: Date,
      alias: 'check_in_date',
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      alias: 'check_out_date',
      required: true,
      index: true
    },
    guest_count: {
      type: Number,
      required: true,
      min: 1
    },
    financials: {
      pricePerNight: {
        type: Number,
        required: true,
        min: 0
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0
      },
      downPaymentCollected: {
        type: Number,
        default: 0,
        min: 0
      },
      housekeepingFees: {
        type: Number,
        default: 0,
        min: 0
      },
      insurance: {
        type: Number,
        default: 0,
        min: 0
      },
      stillNeedToCollect: {
        type: Number,
        default: 0,
        min: 0
      },
      ownerCollectedPayment: {
        type: Boolean,
        default: false
      }
    },
    brokerCommission: {
      isApplicable: {
        type: Boolean,
        default: false
      },
      brokerName: {
        type: String,
        default: '',
        trim: true
      },
      brokerAmountPerNight: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    isOwnerReservation: {
      type: Boolean,
      default: false
    },
    salesPerson: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    transferProofUrl: {
      type: String,
      default: '',
      trim: true
    },
    totalPrice: {
      type: Number,
      alias: 'total_price',
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['temporary_hold', 'pending', 'approved', 'rejected', 'confirmed', 'cancelled'],
      default: 'temporary_hold',
      index: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ unit: 1, startDate: 1, endDate: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
