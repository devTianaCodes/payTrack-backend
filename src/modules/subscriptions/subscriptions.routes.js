import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import {
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
  subscriptionParamsSchema,
  updateSubscriptionSchema,
} from './subscriptions.schemas.js';
import {
  cancelSubscription,
  createSubscription,
  archiveSubscription,
  getSubscription,
  listSubscriptions,
  restoreSubscription,
  updateSubscription,
} from './subscriptions.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validateRequest({ query: listSubscriptionsQuerySchema }),
  asyncRoute(async (request, response) => {
    const subscriptions = await listSubscriptions(request.user.id, request.query);
    response.json({ subscriptions });
  }),
);

router.post(
  '/',
  validateRequest({ body: createSubscriptionSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await createSubscription(request.user, request.body);
    response.status(201).json({ subscription });
  }),
);

router.get(
  '/:id',
  validateRequest({ params: subscriptionParamsSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await getSubscription(request.user.id, request.params.id);
    response.json({ subscription });
  }),
);

router.patch(
  '/:id',
  validateRequest({ params: subscriptionParamsSchema, body: updateSubscriptionSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await updateSubscription(request.user, request.params.id, request.body);
    response.json({ subscription });
  }),
);

router.post(
  '/:id/cancel',
  validateRequest({ params: subscriptionParamsSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await cancelSubscription(request.user.id, request.params.id);
    response.json({ subscription });
  }),
);

router.delete(
  '/:id',
  validateRequest({ params: subscriptionParamsSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await archiveSubscription(request.user.id, request.params.id);
    response.json({ subscription });
  }),
);

router.post(
  '/:id/restore',
  validateRequest({ params: subscriptionParamsSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await restoreSubscription(request.user.id, request.params.id);
    response.json({ subscription });
  }),
);

export default router;
