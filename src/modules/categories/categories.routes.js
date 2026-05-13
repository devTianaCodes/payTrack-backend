import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.schemas.js';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './categories.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncRoute(async (request, response) => {
    const categories = await listCategories(request.user.id);
    response.json({ categories });
  }),
);

router.post(
  '/',
  validateRequest({ body: createCategorySchema }),
  asyncRoute(async (request, response) => {
    const category = await createCategory(request.user.id, request.body);
    response.status(201).json({ category });
  }),
);

router.patch(
  '/:id',
  validateRequest({ params: categoryParamsSchema, body: updateCategorySchema }),
  asyncRoute(async (request, response) => {
    const category = await updateCategory(request.user.id, request.params.id, request.body);
    response.json({ category });
  }),
);

router.delete(
  '/:id',
  validateRequest({ params: categoryParamsSchema }),
  asyncRoute(async (request, response) => {
    await deleteCategory(request.user.id, request.params.id);
    response.status(204).send();
  }),
);

export default router;
