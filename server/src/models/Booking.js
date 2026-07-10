import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    assignedSalesPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    depositCollected: {
      type: Number,
      default: 0,
      min: 0
    },
    transferEvidencePhoto: {
      type: String,
      default: '',
      trim: true
    },
    commissionPercentage: {
      type: Number,
      default: 0,
      min: 0
    },
    commissionAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    systemCommissionPercentage: {
      type: Number,
      default: 0,
      min: 0
    },
    systemCommissionAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    isAdminCreated: {
      type: Boolean,
      default: false
    },
    isSalesCreated: {
      type: Boolean,
      default: false
    },
    idPhotos: {
      type: [String],
      default: []
    },
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
        index: true,
        alias: 'checkIn'
      },
      checkOut: {
        type: Date,
        required: true,
        index: true,
        alias: 'checkOut'
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
      subtotalPrice: {
        type: Number,
        default: 0,
        min: 0
      },
      promoDiscountPercentage: {
        type: Number,
        default: 0,
        min: 0
      },
      promoDiscountAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      taxableSubtotal: {
        type: Number,
        default: 0,
        min: 0
      },
      taxRate: {
        type: Number,
        default: 0.14,
        min: 0
      },
      taxAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      finalPrice: {
        type: Number,
        default: 0,
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
      beachAccessPricePerPersonPerWeek: {
        type: Number,
        default: 0,
        min: 0
      },
      beachAccessPricePerPerson: {
        type: Number,
        default: 0,
        min: 0
      },
      beachAccessExtraGuestPricePerPerson: {
        type: Number,
        default: 0,
        min: 0
      },
      beachAccessDays: {
        type: Number,
        default: 7,
        min: 1
      },
      beachPassHeadcount: {
        type: Number,
        default: 0,
        min: 0
      },
      stayWeeks: {
        type: Number,
        default: 0,
        min: 0
      },
      beachAccessPeriods: {
        type: Number,
        default: 0,
        min: 0
      },
      beachAccessAmount: {
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
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
      index: true
    },
    acceptedAt: {
      type: Date,
      default: null,
      index: true
    },
    holdExpiresAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ unit: 1, startDate: 1, endDate: 1 });

const normalizeBookingStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) {
    return value;
  }

  if (['pending', 'temporary_hold', 'approved', 'confirmed'].includes(normalized)) {
    return 'Pending';
  }

  if (normalized === 'accepted') {
    return 'Accepted';
  }

  if (['rejected', 'cancelled', 'canceled'].includes(normalized)) {
    return 'Rejected';
  }

  return value;
};

bookingSchema.pre(['find', 'findOne', 'countDocuments', 'distinct'], function(next) {
  const query = this.getQuery();
  if (query && query.status) {
    if (typeof query.status === 'string') {
      query.status = normalizeBookingStatus(query.status);
    } else if (query.status.$ne) {
      query.status.$ne = normalizeBookingStatus(query.status.$ne);
    } else if (Array.isArray(query.status.$in)) {
      query.status.$in = query.status.$in.map((status) => normalizeBookingStatus(status));
    } else if (Array.isArray(query.status.$nin)) {
      query.status.$nin = query.status.$nin.map((status) => normalizeBookingStatus(status));
    }
  }
  next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
