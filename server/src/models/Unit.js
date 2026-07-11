import mongoose from 'mongoose';

const unitTypeMap = new Map([
  ['apartment', 'Apartment'],
  ['studio', 'Studio'],
  ['villa', 'Villa'],
  ['townhouse', 'Townhouse'],
  ['penthouse', 'Penthouse'],
  ['chalet', 'Chalet'],
  ['hotel room', 'Hotel Room']
]);

const destinationOptions = [
  'North Coast',
  'Ain Sokhna',
  'Down Town',
  'Zamalek',
  'El Sheikh Zayed',
  'New Cairo',
  'Alexandria',
  'Aswan',
  'Luxor'
];

const normalizeUnitType = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return unitTypeMap.get(value.trim().toLowerCase()) || value;
};

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
    trim: true
  },
  projectName: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true,
    enum: destinationOptions
  },
  type: {
    type: String,
    required: true,
    set: normalizeUnitType,
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
  floor: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  monthPrices: {
    type: Map,
    of: Number,
    default: new Map()
  },
  dateOverrides: {
    type: Map,
    of: Number,
    default: new Map()
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  beachAccessPricePerPersonPerWeek: {
    type: Number,
    default: 0
  },
  beachAccessPricePerPerson: {
    type: Number,
    default: 0
  },
  beachAccessExtraGuestPricePerPerson: {
    type: Number,
    default: 0
  },
  beachAccessDays: {
    type: Number,
    default: 7,
    min: 1
  },
  housekeepingMandatoryPrice: {
    type: Number,
    default: 0
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
  location_link: {
    type: String,
    required: true,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  photos: [{
    type: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

unitSchema.pre('validate', async function () {
  this.type = normalizeUnitType(this.type);
});

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;
