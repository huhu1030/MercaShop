import { Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidateError) {
    res.status(422).json({
      message: 'Validation failed',
      details: err.fields,
    });
    return;
  }

  if (err instanceof Error) {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
}
