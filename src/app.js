import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createCorsOriginHandler } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import paymentMethodRoutes from './modules/paymentMethods/paymentMethods.routes.js';
import reminderRoutes from './modules/reminders/reminders.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscriptions.routes.js';
import userRoutes from './modules/users/users.routes.js';

const app = express();

app.use(
  cors({
    origin: createCorsOriginHandler(env.frontendUrls),
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser(env.cookieSecret));

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'paytrack-backend',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/me', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reminders', reminderRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
