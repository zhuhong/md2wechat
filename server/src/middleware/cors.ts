import type { MiddlewareHandler } from 'hono';
import { config } from '../config.js';

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('origin') ?? '';
  const allowedOrigins = config.corsOrigin;

  const isAllowed =
    config.nodeEnv === 'development' ||
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes('*');

  if (isAllowed && origin) {
    c.header('Access-Control-Allow-Origin', origin);
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};
