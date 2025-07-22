import { Logger } from '@nestjs/common';

export function validateEnv(): boolean {
  const logger = new Logger('EnvValidation');
  const requiredEnvVars = [
    'PORT',
    'MONGODB_URL',
    'MONGODB_DB_NAME',
  ];
  
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please check your .env file or environment configuration');
    
    // In development, provide more helpful information
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('For Docker environments, make sure to copy .env.docker to .env.docker.local and set the required values');
      logger.warn('Environment files are loaded in this order: .env, .env.docker, .env.docker.local, ../env, ../../.env');
    }
    
    return false;
  }

  // Optional environment variables with warnings
  const optionalEnvVars = [
    'FRONTEND_URL',
    'REDIS_URL',
    'REDIS_PASSWORD',
  ];

  const missingOptionalVars = optionalEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingOptionalVars.length > 0 && process.env.NODE_ENV === 'production') {
    logger.warn(`Missing optional environment variables: ${missingOptionalVars.join(', ')}`);
    logger.warn('These variables are not required but recommended for production environments');
  }

  // AI-specific variables check
  if (process.env.ENABLE_AI_CLASSIFICATION === 'true' && !process.env.OPENAI_API_KEY) {
    logger.error('AI classification is enabled but OPENAI_API_KEY is missing');
    logger.error('Please provide an OpenAI API key or disable AI classification');
    return false;
  }

  return true;
}