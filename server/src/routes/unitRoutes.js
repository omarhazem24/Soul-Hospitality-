import { Router } from 'express';
import { listAvailableUnits } from '../controllers/unitController.js';

const unitRouter = Router();

unitRouter.get('/', listAvailableUnits);

export { unitRouter };
