import { Router } from 'express';

const router = Router();

router.post('/register', (_request, response) => {
  response.status(501).json({ message: 'Register endpoint scaffolded.' });
});

router.post('/login', (_request, response) => {
  response.status(501).json({ message: 'Login endpoint scaffolded.' });
});

router.post('/logout', (_request, response) => {
  response.status(501).json({ message: 'Logout endpoint scaffolded.' });
});

router.post('/password-reset/request', (_request, response) => {
  response.status(501).json({ message: 'Password reset request endpoint scaffolded.' });
});

router.post('/password-reset/confirm', (_request, response) => {
  response.status(501).json({ message: 'Password reset confirm endpoint scaffolded.' });
});

export default router;
