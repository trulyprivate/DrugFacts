import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  name: process.env.MONGODB_DB_NAME || 'drug_facts',
  options: {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  },
}));