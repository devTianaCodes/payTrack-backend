import { Router } from 'express';

const router = Router();

router.get('/history', (_request, response) => {
  response.status(501).json({ message: 'Reminder history endpoint scaffolded.' });
});

export default router;
