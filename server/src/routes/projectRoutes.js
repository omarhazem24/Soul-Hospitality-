import { Router } from 'express';
import { createProject, deleteDestination, deleteProject, listProjectCatalog, listProjects } from '../controllers/projectController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const projectRouter = Router();

projectRouter.get('/', listProjects);
projectRouter.get('/catalog', listProjectCatalog);
projectRouter.post('/', protect, restrictTo('Admin'), createProject);
projectRouter.delete('/destination/:destination', protect, restrictTo('Admin'), deleteDestination);
projectRouter.delete('/:id', protect, restrictTo('Admin'), deleteProject);

export { projectRouter };
