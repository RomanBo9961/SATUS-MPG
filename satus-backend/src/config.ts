import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      dbName: process.env.MONGO_NAME,
      user: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD,
      port: process.env.MONGO_CONNECTION?.includes('+srv')
        ? null
        : (parseInt(process.env.MONGO_PORT, 10) || 27017),
      host: process.env.MONGO_HOST,
      connection: process.env.MONGO_CONNECTION,
    },
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    apiKeys: {
      vt: process.env.VT_API_KEY,
      ai: process.env.AI_API_KEY,
      aiUrl: process.env.AI_API_URL,
    }
  };
});
