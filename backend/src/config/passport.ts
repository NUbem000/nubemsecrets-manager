import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'nubemsystems.es';
        if (!email.endsWith(`@${allowedDomain}`)) {
          logger.warn(`Unauthorized login attempt: ${email}`);
          return done(new Error(`Only ${allowedDomain} emails are allowed`), undefined);
        }

        const user: User = {
          id: profile.id,
          email: email,
          name: profile.displayName || email,
          picture: profile.photos?.[0]?.value,
        };

        logger.info(`User authenticated: ${user.email}`);
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
}