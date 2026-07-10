import { Router } from 'express';
import { getFilteredUnits, getUnitByIdentifier } from '../controllers/unitController.js';

const unitRouter = Router();

unitRouter.get('/', getFilteredUnits);
unitRouter.get('/:id', getUnitByIdentifier);

export { unitRouter };
