import Unit from '../models/Unit.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { UNIT_PHOTO_FIELD_KEY } from '../middleware/uploadMiddleware.js';
import { ACTIVE_BOOKING_STATUSES } from '../services/bookingService.js';

const uploadUnitImages = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const uploads = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, {
      folder: 'units',
      resourceType: 'image'
    }))
  );

  return uploads.map((item) => item.secure_url).filter(Boolean);
};

const clearUnitCacheStates = async (unitId) => {
  // No-op in Mongo-only mode.
  return unitId;
};

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
};

const normalizeFacilities = (value) => normalizeAmenities(value);

const normalizeLocationLink = (value) => String(value || '').trim();

const normalizeUnitType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  const lookup = {
    apartment: 'Apartment',
    studio: 'Studio',
    villa: 'Villa',
    townhouse: 'Townhouse',
    penthouse: 'Penthouse',
    chalet: 'Chalet',
    'hotel room': 'Hotel Room'
  };

  return lookup[normalized] || 'Apartment';
};

const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'occupied') {
    return 'Occupied';
  }

  if (normalized === 'maintenance' || normalized === 'active') {
    return 'Maintenance';
  }

  return 'Available';
};

const normalizeDestination = (value) => String(value || '').trim();

const isReservationLiveNow = (booking, now) => {
  const checkIn = booking?.dates?.checkIn || booking?.startDate;
  const checkOut = booking?.dates?.checkOut || booking?.endDate;

  if (!checkIn || !checkOut) {
    return false;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return start <= now && end >= now;
};

const applyDynamicStatus = async (units) => {
  const now = new Date();
  const unitIds = units.map((unit) => unit?._id).filter(Boolean);

  if (!unitIds.length) {
    return units;
  }

  const liveReservations = await Booking.find({
    unitId: { $in: unitIds },
    status: { $in: ACTIVE_BOOKING_STATUSES }
  }).select('unitId dates startDate endDate status');

  const occupiedUnitIds = new Set(
    liveReservations
      .filter((booking) => isReservationLiveNow(booking, now))
      .map((booking) => String(booking.unitId))
  );

  return units.map((unit) => (
    occupiedUnitIds.has(String(unit._id))
      ? { ...unit, status: 'Occupied' }
      : unit
  ));
};

const buildUnitPayload = (body, photos) => {
  const name = body.name || body.title || '';
  const destination = normalizeDestination(body.destination || body.location || body.projectName || '');
  const projectName = normalizeDestination(body.projectName || body.location || body.destination || '');
  const type = normalizeUnitType(body.type || body.unit_type);
  const bedrooms = Number(body.bedrooms ?? body.bedroom_count ?? 0);
  const bathrooms = Number(body.bathrooms ?? body.bathroom_count ?? 0);
  const pricePerNight = Number(body.pricePerNight ?? body.price_per_night ?? body.price ?? 0);
  const beachAccessPricePerPersonPerWeek = Number(
    body.beachAccessPricePerPersonPerWeek ??
    body.beachAccessPricePerPerson ??
    body.beach_access_price_per_person_per_week ??
    body.beach_access_price_per_person ??
    body.beachAccessPrice ??
    0
  );
  const beachAccessExtraGuestPricePerPerson = Number(
    body.beachAccessExtraGuestPricePerPerson ??
    body.beach_access_extra_guest_price_per_person ??
    body.beachAccessExtraGuestPrice ??
    0
  );
  const beachAccessDays = Number(body.beachAccessDays ?? body.beach_access_days ?? 7);
  const locationLink = normalizeLocationLink(
    body.location_link || body.locationUrl || body.location_url || body.locationLink
  );

  return {
    name,
    title: name,
    uniqueId: String(body.uniqueId || body.unitId || '').trim(),
    projectName,
    destination,
    location: projectName,
    type,
    unit_type: type.toLowerCase(),
    bedrooms,
    bedroom_count: bedrooms,
    bathrooms,
    bathroom_count: bathrooms,
    floor: body.floor,
    pricePerNight,
    price: pricePerNight,
    beachAccessPricePerPersonPerWeek,
    beachAccessPricePerPerson: beachAccessPricePerPersonPerWeek,
    beachAccessExtraGuestPricePerPerson,
    beachAccessDays: Number.isFinite(beachAccessDays) && beachAccessDays > 0 ? beachAccessDays : 7,
    status: normalizeStatus(body.status),
    view: body.view || '',
    description: body.description,
    location_link: locationLink,
    capacity: Number(body.capacity ?? Math.max(1, bedrooms * 2 || 1)),
    amenities: normalizeAmenities(body.amenities),
    facilities: normalizeFacilities(body.facilities),
    photos
  };
};

export const createUnit = asyncHandler(async (request, response) => {
  const { floor, description, capacity, destination, projectName } = request.body;
  const locationLink = normalizeLocationLink(
    request.body.location_link || request.body.locationUrl || request.body.location_url || request.body.locationLink
  );

  if (!floor || !locationLink || !description || !capacity || !destination || !projectName || (!request.body.uniqueId && !request.body.unitId)) {
    throw new AppError('unitId, floor, location_link, description, capacity, destination, and projectName are required', 400);
  }

  console.log(`👉 Multer is explicitly expecting form-data file keys to be named: '${UNIT_PHOTO_FIELD_KEY}'`);

  const photos = await uploadUnitImages(request.files || []);
  const unitPayload = buildUnitPayload(request.body, photos);
  unitPayload.location_link = locationLink;

  const unit = await Unit.create(unitPayload);

  response.status(201).json({
    success: true,
    data: unit
  });
});

export const updateUnit = asyncHandler(async (request, response) => {
  const unit = await Unit.findById(request.params.id);

  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  const updates = {};
  const fields = ['name', 'title', 'uniqueId', 'unitId', 'projectName', 'location', 'destination', 'type', 'unit_type', 'floor', 'view', 'description', 'location_link'];

  fields.forEach((field) => {
    if (request.body[field] === undefined) {
      return;
    }

    if (field === 'name' || field === 'title') {
      updates.name = request.body[field];
      updates.title = request.body[field];
      return;
    }

    if (field === 'destination') {
      const nextDestination = normalizeDestination(request.body.destination);
      updates.destination = nextDestination;
      return;
    }

    if (field === 'unitId') {
      updates.uniqueId = String(request.body.unitId || '').trim();
      return;
    }

    if (field === 'projectName' || field === 'location') {
      const nextProjectName = normalizeDestination(request.body[field]);
      updates.projectName = nextProjectName;
      updates.location = nextProjectName;
      return;
    }

    if (field === 'type' || field === 'unit_type') {
      const normalizedType = normalizeUnitType(request.body[field]);
      updates.type = normalizedType;
      updates.unit_type = normalizedType.toLowerCase();
      return;
    }

    updates[field] = request.body[field];
  });

  if (request.body.price !== undefined || request.body.price_per_night !== undefined || request.body.pricePerNight !== undefined) {
    const pricePerNight = Number(request.body.pricePerNight || request.body.price_per_night || request.body.price);
    updates.pricePerNight = pricePerNight;
    updates.price = pricePerNight;
  }

  if (request.body.capacity !== undefined) {
    updates.capacity = Number(request.body.capacity);
  }

  if (request.body.bedroom_count !== undefined || request.body.bedrooms !== undefined) {
    const bedrooms = Number(request.body.bedrooms ?? request.body.bedroom_count);
    updates.bedrooms = bedrooms;
    updates.bedroom_count = bedrooms;
  }

  if (request.body.bathroom_count !== undefined || request.body.bathrooms !== undefined) {
    const bathrooms = Number(request.body.bathrooms ?? request.body.bathroom_count);
    updates.bathrooms = bathrooms;
    updates.bathroom_count = bathrooms;
  }

  if (request.body.amenities !== undefined) {
    updates.amenities = normalizeAmenities(request.body.amenities);
  }

  if (request.body.facilities !== undefined) {
    updates.facilities = normalizeFacilities(request.body.facilities);
  }

  if (request.body.location_link !== undefined) {
    updates.location_link = normalizeLocationLink(request.body.location_link);
  } else if (request.body.locationUrl !== undefined || request.body.location_url !== undefined || request.body.locationLink !== undefined) {
    updates.location_link = normalizeLocationLink(
      request.body.locationUrl || request.body.location_url || request.body.locationLink
    );
  }

  if (
    request.body.beachAccessPricePerPersonPerWeek !== undefined ||
    request.body.beachAccessPricePerPerson !== undefined ||
    request.body.beach_access_price_per_person_per_week !== undefined ||
    request.body.beach_access_price_per_person !== undefined ||
    request.body.beachAccessPrice !== undefined
  ) {
    const beachAccessPricePerPerson = Number(
      request.body.beachAccessPricePerPersonPerWeek ??
      request.body.beachAccessPricePerPerson ??
      request.body.beach_access_price_per_person_per_week ??
      request.body.beach_access_price_per_person ??
      request.body.beachAccessPrice
    );
    updates.beachAccessPricePerPersonPerWeek = beachAccessPricePerPerson;
    updates.beachAccessPricePerPerson = beachAccessPricePerPerson;
  }

  if (
    request.body.beachAccessExtraGuestPricePerPerson !== undefined ||
    request.body.beach_access_extra_guest_price_per_person !== undefined ||
    request.body.beachAccessExtraGuestPrice !== undefined
  ) {
    updates.beachAccessExtraGuestPricePerPerson = Number(
      request.body.beachAccessExtraGuestPricePerPerson ??
      request.body.beach_access_extra_guest_price_per_person ??
      request.body.beachAccessExtraGuestPrice
    );
  }

  if (request.body.beachAccessDays !== undefined || request.body.beach_access_days !== undefined) {
    updates.beachAccessDays = Number(request.body.beachAccessDays ?? request.body.beach_access_days);
  }

  if (request.body.status !== undefined) {
    updates.status = normalizeStatus(request.body.status);
  }

  if ((request.files || []).length) {
    const newImages = await uploadUnitImages(request.files);
    updates.photos = [...(unit.photos || []), ...newImages];
  }

  const updatedUnit = await Unit.findByIdAndUpdate(request.params.id, updates, {
    new: true,
    runValidators: true
  });

  response.json({
    success: true,
    data: updatedUnit
  });
});

export const deleteUnit = asyncHandler(async (request, response) => {
  const hardDelete = String(request.query.hard || '').toLowerCase() === 'true';
  const unit = await Unit.findById(request.params.id);

  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  if (hardDelete) {
    await Unit.deleteOne({ _id: unit._id });
  } else {
    unit.status = 'maintenance';
    await unit.save();
  }

  await clearUnitCacheStates(unit._id.toString());

  response.json({
    success: true,
    message: hardDelete ? 'Unit deleted' : 'Unit moved to maintenance'
  });
});

export const listUnits = asyncHandler(async (request, response) => {
  const units = await Unit.find().sort({ createdAt: -1 }).lean();
  const unitsWithOccupancy = await applyDynamicStatus(units);

  response.json({
    success: true,
    data: unitsWithOccupancy
  });
});

export const quickEditUnit = asyncHandler(async (request, response) => {
  const aliasFieldMap = {
    beach_access_price_per_person_per_week: 'beachAccessPricePerPersonPerWeek',
    beach_access_price_per_person: 'beachAccessPricePerPerson',
    beach_access_extra_guest_price_per_person: 'beachAccessExtraGuestPricePerPerson',
    beachAccessPrice: 'beachAccessPricePerPersonPerWeek',
    beachAccessPricePerPerson: 'beachAccessPricePerPerson',
    beachAccessExtraGuestPrice: 'beachAccessExtraGuestPricePerPerson',
    beach_access_days: 'beachAccessDays'
  };
  const normalizedBody = Object.entries(request.body || {}).reduce((acc, [key, value]) => {
    const normalizedKey = aliasFieldMap[key] || key;
    acc[normalizedKey] = value;
    return acc;
  }, {});

  const allowedFields = ['pricePerNight', 'beachAccessPricePerPersonPerWeek', 'beachAccessPricePerPerson', 'beachAccessExtraGuestPricePerPerson', 'beachAccessDays', 'status'];
  const incomingFields = Object.keys(normalizedBody || {});

  const unit = await Unit.findById(request.params.id);

  if (!unit) {
    throw new AppError('Unit not found', 404);
  }

  const updates = {};

  if (normalizedBody.pricePerNight !== undefined) {
    updates.pricePerNight = Number(normalizedBody.pricePerNight);
  }

  if (normalizedBody.beachAccessPricePerPersonPerWeek !== undefined) {
    updates.beachAccessPricePerPersonPerWeek = Number(normalizedBody.beachAccessPricePerPersonPerWeek);
  }

  if (normalizedBody.beachAccessPricePerPerson !== undefined) {
    updates.beachAccessPricePerPerson = Number(normalizedBody.beachAccessPricePerPerson);
    updates.beachAccessPricePerPersonPerWeek = updates.beachAccessPricePerPerson;
  }

  if (normalizedBody.beachAccessExtraGuestPricePerPerson !== undefined) {
    updates.beachAccessExtraGuestPricePerPerson = Number(normalizedBody.beachAccessExtraGuestPricePerPerson);
  }

  if (normalizedBody.beachAccessDays !== undefined) {
    updates.beachAccessDays = Number(normalizedBody.beachAccessDays);
  }

  if (normalizedBody.status !== undefined) {
    updates.status = normalizeStatus(normalizedBody.status);
  }

  const updatedUnit = await Unit.findByIdAndUpdate(request.params.id, updates, {
    new: true,
    runValidators: true
  });

  response.json({
    success: true,
    data: updatedUnit
  });
});
