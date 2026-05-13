import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'Current user endpoint scaffolded.' });
});

router.patch('/', (_request, response) => {
  response.status(501).json({ message: 'Update current user endpoint scaffolded.' });
});

export default router;
