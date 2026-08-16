import type { NextFunction, Request, Response } from 'express';

const ALLOWED_ORIGIN = 'http://localhost:3000';
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 600;
const TIMEOUT_DELAY_MS = 10_000;

export function cors(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Simulate-Error');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

/** Every endpoint answers with a bit of delay so loading states are visible. */
export function latency(_req: Request, _res: Response, next: NextFunction): void {
  const delay = MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
  setTimeout(next, delay);
}

export function simulateError(req: Request, res: Response, next: NextFunction): void {
  const mode = req.get('X-Simulate-Error');
  if (!mode) {
    next();
    return;
  }

  if (mode === '500') {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
    return;
  }
  if (mode === '422') {
    res.status(422).json({ error: 'VALIDATION_ERROR', fields: { simulated: 'Simulated validation failure' } });
    return;
  }
  if (mode === 'timeout') {
    setTimeout(() => {
      res.status(504).json({ error: 'TIMEOUT' });
    }, TIMEOUT_DELAY_MS);
    return;
  }

  next();
}
