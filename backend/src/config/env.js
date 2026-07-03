import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || null,
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  db: {
    path: process.env.DB_PATH || './database.sqlite',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  email: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
};
