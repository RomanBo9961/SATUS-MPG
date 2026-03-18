import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      dbName: process.env.MONGO_DB,
      user: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD,
      port: parseInt(process.env.MONGO_PORT as string, 10),
      host: process.env.MONGO_HOST,
      connection: process.env.MONGO_CONNECTION,
    },
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    apiKeys: {
      vt: process.env.VT_API_KEY,
      ai: process.env.AI_API_KEY,
    }
  };
});
