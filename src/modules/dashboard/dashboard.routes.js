import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import { getDashboardSummary } from './dashboard.service.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  asyncRoute(async (request, response) => {
    const dashboard = await getDashboardSummary(request.user.id);
    response.json({ dashboard });
  }),
);

export default router;
