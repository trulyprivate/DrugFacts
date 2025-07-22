/**
 * Environment variable validation for Next.js frontend
 */

export function validateEnv(): { valid: boolean; messages: string[] } {
  const messages: string[] = [];
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingVars.length > 0) {
    messages.push(`Missing required environment variables: ${missingVars.join(', ')}`);
    messages.push('Please check your .env file or environment configuration');
    
    // In development, provide more helpful information
    if (process.env.NODE_ENV !== 'production') {
      messages.push('For Docker environments, make sure to copy .env.docker to .env.docker.local and set the required values');
      messages.push('Environment files are loaded in this order: .env.local, .env.docker.local, .env.docker, .env');
    }
    
    return { valid: false, messages };
  }

  // Optional environment variables with warnings
  const optionalEnvVars = [
    'MONGODB_URL',
    'MONGODB_DB_NAME',
  ];

  const missingOptionalVars = optionalEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingOptionalVars.length > 0 && process.env.NODE_ENV === 'production') {
    messages.push(`Missing optional environment variables: ${missingOptionalVars.join(', ')}`);
    messages.push('These variables are not required but recommended for production environments');
  }

  return { valid: true, messages };
}

/**
 * Log environment validation results
 */
export function logEnvValidation(): void {
  const { valid, messages } = validateEnv();
  
  if (!valid) {
    console.error('❌ Environment validation failed:');
    messages.forEach(msg => console.error(`  - ${msg}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Application may not function correctly without required environment variables');
    }
  } else if (messages.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    messages.forEach(msg => console.warn(`  - ${msg}`));
  } else {
    console.log('✅ Environment validation passed');
  }
}

// Run validation in non-browser environments (SSR)
if (typeof window === 'undefined') {
  logEnvValidation();
}