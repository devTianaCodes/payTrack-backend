import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { asyncRoute } from '../../utils/asyncRoute.js';
import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';
import {
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from './auth.schemas.js';
import { confirmPasswordReset, loginUser, registerUser, requestPasswordReset } from './auth.service.js';

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

router.post(
  '/password-reset/request',
  validateRequest({ body: passwordResetRequestSchema }),
  asyncRoute(async (request, response) => {
    const result = await requestPasswordReset(request.body);
    response.json(result);
  }),
);

router.post(
  '/password-reset/confirm',
  validateRequest({ body: passwordResetConfirmSchema }),
  asyncRoute(async (request, response) => {
    const result = await confirmPasswordReset(request.body);
    setSessionCookie(response, result.token);
    response.json({ user: result.user });
  }),
);

export default router;
