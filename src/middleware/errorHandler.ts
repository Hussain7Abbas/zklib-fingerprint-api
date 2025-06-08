import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: Error | ZodError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err.stack);

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Zod validation error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = `Validation Error: ${err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')}`;
  }
  // Custom error with status code
  else if ('statusCode' in err && err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Default error
  else {
    message = err.message || 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    },
  });
};
