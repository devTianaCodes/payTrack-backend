import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import {
  createPaymentMethodSchema,
  paymentMethodParamsSchema,
  updatePaymentMethodSchema,
} from './paymentMethods.schemas.js';
import {
  createPaymentMethod,
  deletePaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
} from './paymentMethods.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncRoute(async (request, response) => {
    const paymentMethods = await listPaymentMethods(request.user.id);
    response.json({ paymentMethods });
  }),
);

router.post(
  '/',
  validateRequest({ body: createPaymentMethodSchema }),
  asyncRoute(async (request, response) => {
    const paymentMethod = await createPaymentMethod(request.user.id, request.body);
    response.status(201).json({ paymentMethod });
  }),
);

router.patch(
  '/:id',
  validateRequest({ params: paymentMethodParamsSchema, body: updatePaymentMethodSchema }),
  asyncRoute(async (request, response) => {
    const paymentMethod = await updatePaymentMethod(request.user.id, request.params.id, request.body);
    response.json({ paymentMethod });
  }),
);

router.delete(
  '/:id',
  validateRequest({ params: paymentMethodParamsSchema }),
  asyncRoute(async (request, response) => {
    await deletePaymentMethod(request.user.id, request.params.id);
    response.status(204).send();
  }),
);

export default router;
