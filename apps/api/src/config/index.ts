
import dotenv from 'dotenv';

dotenv.config();

// Configuration values for the application
const env = process.env.NODE_ENV || 'development'

export const config = {
  env,
  isDev: env === 'development',
  isProd: env === 'production',
  
  server: {
    port: Number(process.env.PORT) || 3010,
    host: process.env.HOST || '0.0.0.0'
  },
  
  logger: true
}
  