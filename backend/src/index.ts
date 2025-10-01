import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import passport from 'passport';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { setupPassport } from './config/passport';
import authRoutes from './routes/auth.routes';
import secretsRoutes from './routes/secrets.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'nubemsecrets.sid',
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  },
  proxy: process.env.NODE_ENV === 'production',
}));

app.use(passport.initialize());
app.use(passport.session());

setupPassport();

// Simplified debug middleware - only log essential info
app.use((req, res, next) => {
  if (req.path.startsWith('/api/secrets') || req.path === '/auth/me') {
    logger.info(`${req.method} ${req.path} - Session: ${req.sessionID?.substring(0, 8)}... - Auth: ${req.isAuthenticated()}`);
  }
  next();
});

app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api/secrets', secretsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 NubemSecrets Backend running on port ${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Project ID: ${process.env.GCP_PROJECT_ID}`);
});

export default app;