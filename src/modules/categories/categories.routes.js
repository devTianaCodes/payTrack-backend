import { Router } from 'express';

const router = Router();

router.get('/', (_request, response) => {
  response.status(501).json({ message: 'List categories endpoint scaffolded.' });
});

router.post('/', (_request, response) => {
  response.status(501).json({ message: 'Create category endpoint scaffolded.' });
});

router.patch('/:id', (_request, response) => {
  response.status(501).json({ message: 'Update category endpoint scaffolded.' });
});

router.delete('/:id', (_request, response) => {
  response.status(501).json({ message: 'Delete category endpoint scaffolded.' });
});

export default router;
