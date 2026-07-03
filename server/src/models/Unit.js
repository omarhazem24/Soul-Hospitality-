import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{2}$/, 'Please use the format XXX-XXX-XX']
  },
  projectName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Apartment', 'Studio', 'Villa', 'Townhouse', 'Penthouse', 'Chalet', 'Hotel Room']
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  utilitiesCostPerNight: {
    type: Number,
    default: 500
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  view: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  photos: [{
    type: String
  }],
  commissionStructure: {
    mode: {
      type: String,
      required: true,
      enum: ['Mode A', 'Mode B', 'Mode C']
    },
    modeAValue: { type: Number },
    modeBValues: {
      ownerRate: { type: Number },
      tenantRate: { type: Number }
    },
    modeCValues: {
      bookingSourceRates: { type: Map, of: Number },
      tenantFee: { type: Number }
    }
  }
}, {
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;
