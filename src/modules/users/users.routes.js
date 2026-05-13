import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { prisma } from '../../prisma/client.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import { updateMeSchema } from './users.schemas.js';
import { publicUserSelect } from '../auth/auth.service.js';

const router = Router();

router.get('/', requireAuth, (request, response) => {
  response.json({ user: request.user });
});

router.patch(
  '/',
  requireAuth,
  validateRequest({ body: updateMeSchema }),
  asyncRoute(async (request, response) => {
    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: request.body,
      select: publicUserSelect,
    });

    response.json({ user });
  }),
);

export default router;
