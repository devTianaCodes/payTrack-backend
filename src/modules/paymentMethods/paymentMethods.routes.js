import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'List payment methods endpoint scaffolded.' });
});

router.post('/', (_request, response) => {
  response.status(501).json({ message: 'Create payment method endpoint scaffolded.' });
});

router.patch('/:id', (_request, response) => {
  response.status(501).json({ message: 'Update payment method endpoint scaffolded.' });
});

router.delete('/:id', (_request, response) => {
  response.status(501).json({ message: 'Delete payment method endpoint scaffolded.' });
});

export default router;
