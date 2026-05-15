import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import {
  createSubscriptionPaymentSchema,
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
  subscriptionParamsSchema,
  updateReminderPreferencesSchema,
  updateSubscriptionSchema,
} from './subscriptions.schemas.js';
import {
  cancelSubscription,
  createSubscription,
  archiveSubscription,
  getSubscription,
  listSubscriptionPayments,
  listSubscriptions,
  recordSubscriptionPayment,
  restoreSubscription,
  updateReminderPreferences,
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

router.get(
  '/:id/payments',
  validateRequest({ params: subscriptionParamsSchema }),
  asyncRoute(async (request, response) => {
    const payments = await listSubscriptionPayments(request.user.id, request.params.id);
    response.json({ payments });
  }),
);

router.post(
  '/:id/payments',
  validateRequest({ params: subscriptionParamsSchema, body: createSubscriptionPaymentSchema }),
  asyncRoute(async (request, response) => {
    const result = await recordSubscriptionPayment(request.user, request.params.id, request.body);
    response.status(201).json(result);
  }),
);

router.patch(
  '/:id/reminder-preferences',
  validateRequest({ params: subscriptionParamsSchema, body: updateReminderPreferencesSchema }),
  asyncRoute(async (request, response) => {
    const subscription = await updateReminderPreferences(request.user.id, request.params.id, request.body);
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
