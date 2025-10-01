import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only log detailed info for debugging specific issues
  if (req.path === '/debug') {
    logger.info(`Auth check for ${req.path}`);
    logger.info(`Session ID: ${req.sessionID}`);
    logger.info(`Has session.passport: ${!!req.session?.passport}`);
    logger.info(`Has user: ${!!req.user}`);
    logger.info(`Is authenticated: ${req.isAuthenticated()}`);
  }

  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;
    logger.info(`Authenticated request from ${user.email} to ${req.path}`);
    return next();
  }

  logger.warn(`Unauthorized access attempt to ${req.path} - Session ID: ${req.sessionID}`);
  res.status(401).json({
    error: 'Unauthorized',
    message: 'You must be logged in to access this resource',
  });
}