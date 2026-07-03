import Unit from '../models/Unit.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import { getRedisClient } from '../config/redis.js';
import { UNIT_PHOTO_FIELD_KEY } from '../middleware/uploadMiddleware.js';

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
  const redisClient = getRedisClient();
  const keysToDelete = [];

  for await (const key of redisClient.scanIterator({ MATCH: `*${unitId}*` })) {
    keysToDelete.push(key);
  }

  if (keysToDelete.length > 0) {
    await redisClient.del(keysToDelete);
  }
};

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const normalizeCommissionStructure = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  return value;
};

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

const buildUnitPayload = (body, photos) => {
  const name = body.name || body.title || '';
  const projectName = body.projectName || body.location || body.destination || '';
  const type = normalizeUnitType(body.type || body.unit_type);
  const bedrooms = Number(body.bedrooms ?? body.bedroom_count ?? 0);
  const bathrooms = Number(body.bathrooms ?? body.bathroom_count ?? 0);
  const area = Number(body.area ?? body.area_m2 ?? 0);
  const pricePerNight = Number(body.pricePerNight ?? body.price_per_night ?? body.price ?? 0);
  const utilitiesCostPerNight = Number(body.utilitiesCostPerNight ?? body.utilities_cost_per_night ?? 500);

  return {
    name,
    title: name,
    uniqueId: body.uniqueId,
    projectName,
    location: projectName,
    type,
    unit_type: type.toLowerCase(),
    bedrooms,
    bedroom_count: bedrooms,
    bathrooms,
    bathroom_count: bathrooms,
    area,
    area_m2: area,
    floor: body.floor,
    pricePerNight,
    price: pricePerNight,
    utilitiesCostPerNight,
    status: normalizeStatus(body.status),
    view: body.view || '',
    description: body.description,
    location_link: body.location_link,
    capacity: Number(body.capacity ?? Math.max(1, bedrooms * 2 || 1)),
    amenities: normalizeAmenities(body.amenities),
    photos,
    commissionStructure: normalizeCommissionStructure(body.commissionStructure)
  };
};

export const createUnit = asyncHandler(async (request, response) => {
  const { uniqueId, floor, location_link, description, capacity } = request.body;

  if (!uniqueId || !floor || !location_link || !description || !capacity) {
    throw new AppError('uniqueId, floor, location_link, description, and capacity are required', 400);
  }

  console.log(`👉 Multer is explicitly expecting form-data file keys to be named: '${UNIT_PHOTO_FIELD_KEY}'`);

  const photos = await uploadUnitImages(request.files || []);
  const unitPayload = buildUnitPayload(request.body, photos);

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
  const fields = ['name', 'title', 'uniqueId', 'projectName', 'location', 'destination', 'type', 'unit_type', 'floor', 'view', 'description', 'location_link'];

  fields.forEach((field) => {
    if (request.body[field] === undefined) {
      return;
    }

    if (field === 'name' || field === 'title') {
      updates.name = request.body[field];
      updates.title = request.body[field];
      return;
    }

    if (field === 'projectName' || field === 'location' || field === 'destination') {
      updates.projectName = request.body[field];
      updates.location = request.body[field];
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

  if (request.body.location_link !== undefined) {
    updates.location_link = request.body.location_link;
  }

  if (request.body.area !== undefined || request.body.area_m2 !== undefined) {
    const area = Number(request.body.area ?? request.body.area_m2);
    updates.area = area;
    updates.area_m2 = area;
  }

  if (request.body.utilitiesCostPerNight !== undefined || request.body.utilities_cost_per_night !== undefined) {
    const utilitiesCostPerNight = Number(request.body.utilitiesCostPerNight || request.body.utilities_cost_per_night);
    updates.utilitiesCostPerNight = utilitiesCostPerNight;
  }

  if (request.body.commissionStructure !== undefined) {
    updates.commissionStructure = normalizeCommissionStructure(request.body.commissionStructure);
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

  response.json({
    success: true,
    data: units
  });
});
