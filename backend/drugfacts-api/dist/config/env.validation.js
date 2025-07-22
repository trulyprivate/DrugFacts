"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const common_1 = require("@nestjs/common");
function validateEnv() {
    const logger = new common_1.Logger('EnvValidation');
    const requiredEnvVars = [
        'PORT',
        'MONGODB_URL',
        'MONGODB_DB_NAME',
    ];
    const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingVars.length > 0) {
        logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
        logger.error('Please check your .env file or environment configuration');
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('For Docker environments, make sure to copy .env.docker to .env.docker.local and set the required values');
            logger.warn('Environment files are loaded in this order: .env, .env.docker, .env.docker.local, ../env, ../../.env');
        }
        return false;
    }
    const optionalEnvVars = [
        'FRONTEND_URL',
        'REDIS_URL',
        'REDIS_PASSWORD',
    ];
    const missingOptionalVars = optionalEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingOptionalVars.length > 0 && process.env.NODE_ENV === 'production') {
        logger.warn(`Missing optional environment variables: ${missingOptionalVars.join(', ')}`);
        logger.warn('These variables are not required but recommended for production environments');
    }
    if (process.env.ENABLE_AI_CLASSIFICATION === 'true' && !process.env.OPENAI_API_KEY) {
        logger.error('AI classification is enabled but OPENAI_API_KEY is missing');
        logger.error('Please provide an OpenAI API key or disable AI classification');
        return false;
    }
    return true;
}
//# sourceMappingURL=env.validation.js.map