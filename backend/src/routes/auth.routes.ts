import { Router } from 'express';
import passport from 'passport';
import { logger } from '../utils/logger';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    const user = req.user as any;
    logger.info(`Successful Google login - User: ${user?.email}, Session ID: ${req.sessionID}`);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    logger.info(`Redirecting to: ${frontendUrl}/dashboard`);
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({
    error: 'Authentication failed',
    message: 'Unable to authenticate with Google',
  });
});

router.get('/me', (req, res) => {
  const user = req.user as any;
  logger.info(`GET /auth/me - User: ${user?.email}, Session ID: ${req.sessionID}, Authenticated: ${req.isAuthenticated()}`);
  logger.info(`Session data: ${JSON.stringify(req.session)}`);
  logger.info(`Cookie received: ${req.headers.cookie}`);

  if (req.isAuthenticated() && req.user) {
    res.json(req.user);
  } else {
    logger.warn('User not authenticated in /auth/me endpoint');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Debug endpoint to check session status
router.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasPassport: !!req.session?.passport,
    hasUser: !!req.user,
    isAuthenticated: req.isAuthenticated(),
    sessionData: req.session,
    cookieHeader: req.headers.cookie,
  });
});

router.post('/logout', (req, res) => {
  const user = req.user as any;
  if (user) {
    logger.info(`User logged out: ${user.email}`);
  }

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    return res.json({ message: 'Logged out successfully' });
  });
});

export default router;