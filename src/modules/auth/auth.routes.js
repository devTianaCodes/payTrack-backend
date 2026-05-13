import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import { loginUser, registerUser } from './auth.service.js';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: registerSchema }),
  asyncRoute(async (request, response) => {
    const result = await registerUser(request.body);
    setSessionCookie(response, result.token);
    response.status(201).json({ user: result.user });
  }),
);

router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  asyncRoute(async (request, response) => {
    const result = await loginUser(request.body);
    setSessionCookie(response, result.token);
    response.json({ user: result.user });
  }),
);

router.post('/logout', (_request, response) => {
  clearSessionCookie(response);
  response.status(204).send();
});

router.post('/password-reset/request', (_request, response) => {
  response.status(501).json({ message: 'Password reset request endpoint scaffolded.' });
});

router.post('/password-reset/confirm', (_request, response) => {
  response.status(501).json({ message: 'Password reset confirm endpoint scaffolded.' });
});

export default router;
