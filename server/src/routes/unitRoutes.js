import { Router } from 'express';
import { getFilteredUnits, getUnitByIdentifier, updateUnitPricing } from '../controllers/unitController.js';

const unitRouter = Router();

unitRouter.get('/', getFilteredUnits);
unitRouter.get('/:id', getUnitByIdentifier);
unitRouter.put('/:id/pricing', updateUnitPricing);

export { unitRouter };
