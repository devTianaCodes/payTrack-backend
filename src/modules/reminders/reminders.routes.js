import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { prisma } from '../../prisma/client.js';
import { asyncRoute } from '../../utils/asyncRoute.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/history',
  asyncRoute(async (request, response) => {
    const reminders = await prisma.reminderLog.findMany({
      where: { userId: request.user.id },
      include: {
        subscription: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            nextRenewalDate: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    response.json({ reminders });
  }),
);

export default router;
