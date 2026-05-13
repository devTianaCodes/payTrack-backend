import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'Dashboard summary endpoint scaffolded.' });
});

export default router;
