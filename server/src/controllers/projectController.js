import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import Project from '../models/Project.js';

const normalizeText = (value) => String(value || '').trim();

const mergeValues = (values = []) => {
  const merged = new Map();

  values.forEach((item) => {
    const nextValue = normalizeText(item);
    if (!nextValue) {
      return;
    }

    const key = nextValue.toLowerCase();
    if (!merged.has(key)) {
      merged.set(key, nextValue);
    }
  });

  return Array.from(merged.values()).sort((left, right) => left.localeCompare(right));
};

const buildCatalog = (projects = []) => {
  const grouped = new Map();

  projects.forEach((item) => {
    const destination = normalizeText(item.destination);
    const projectName = normalizeText(item.name || item.projectName);

    if (!destination || !projectName) {
      return;
    }

    const key = destination.toLowerCase();
    if (!grouped.has(key)) {
      grouped.set(key, {
        destination,
        projects: new Set()
      });
    }

    grouped.get(key).projects.add(projectName);
  });

  const destinations = Array.from(grouped.values())
    .map((entry) => entry.destination)
    .sort((left, right) => left.localeCompare(right));

  const projectsByDestination = destinations.reduce((acc, destination) => {
    const entry = grouped.get(destination.toLowerCase());
    acc[destination] = Array.from(entry?.projects || []).sort((left, right) => left.localeCompare(right));
    return acc;
  }, {});

  return { destinations, projectsByDestination };
};

export const listProjects = asyncHandler(async (request, response) => {
  const manualDestinations = await Project.distinct('destination');
  const destinationOptions = mergeValues(manualDestinations);

  response.json({
    success: true,
    data: destinationOptions
  });
});

export const listProjectCatalog = asyncHandler(async (request, response) => {
  const manualProjects = await Project.find().select('destination name').lean();
  const catalog = buildCatalog(manualProjects);

  response.json({
    success: true,
    data: catalog
  });
});

export const createProject = asyncHandler(async (request, response) => {
  const destination = normalizeText(request.body?.destination || request.body?.city);
  const name = normalizeText(request.body?.name || request.body?.projectName);

  if (!name) {
    throw new AppError('Project name is required', 400);
  }

  if (!destination) {
    throw new AppError('Destination is required', 400);
  }

  const normalizedDestination = destination.toLowerCase();
  const normalizedName = name.toLowerCase();
  const existingProject = await Project.findOne({ normalizedDestination, normalizedName }).lean();

  if (existingProject) {
    throw new AppError('Project name already exists in this destination', 409);
  }

  await Project.create({ destination, name, normalizedDestination, normalizedName });

  const manualProjects = await Project.find().select('destination name').lean();
  const catalog = buildCatalog(manualProjects);

  response.status(201).json({
    success: true,
    data: catalog
  });
});

export const deleteProject = asyncHandler(async (request, response) => {
  const project = await Project.findById(request.params.id);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await Project.deleteOne({ _id: project._id });

  response.json({ success: true, message: 'Project deleted' });
});

export const deleteDestination = asyncHandler(async (request, response) => {
  const destination = normalizeText(request.params.destination);

  if (!destination) {
    throw new AppError('Destination is required', 400);
  }

  await Project.deleteMany({ destination: new RegExp(`^${destination}$`, 'i') });

  response.json({ success: true, message: 'Destination deleted' });
});
