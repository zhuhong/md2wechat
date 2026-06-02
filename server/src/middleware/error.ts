import type { MiddlewareHandler } from 'hono';
import type { ApiError } from '../types/index.js';

export const errorMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error('[Error]', err);

    const status = err instanceof Error && 'status' in err ? (err as { status: number }).status : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';

    const body: ApiError = {
      success: false,
      error: message,
      code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
    };

    c.status(status as 500);
    return c.json(body);
  }
};
