import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'List subscriptions endpoint scaffolded.' });
});

router.post('/', (_request, response) => {
  response.status(501).json({ message: 'Create subscription endpoint scaffolded.' });
});

router.get('/:id', (_request, response) => {
  response.status(501).json({ message: 'Get subscription endpoint scaffolded.' });
});

router.patch('/:id', (_request, response) => {
  response.status(501).json({ message: 'Update subscription endpoint scaffolded.' });
});

router.post('/:id/cancel', (_request, response) => {
  response.status(501).json({ message: 'Cancel subscription endpoint scaffolded.' });
});

router.delete('/:id', (_request, response) => {
  response.status(501).json({ message: 'Delete subscription endpoint scaffolded.' });
});

export default router;
