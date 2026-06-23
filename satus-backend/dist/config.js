"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('config', () => {
    return {
        database: {
            dbName: process.env.MONGO_NAME,
            user: process.env.MONGO_INITDB_ROOT_USERNAME,
            password: process.env.MONGO_INITDB_ROOT_PASSWORD,
            port: parseInt(process.env.MONGO_PORT, 10),
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
//# sourceMappingURL=config.js.map