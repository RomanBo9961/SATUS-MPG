declare const _default: (() => {
    database: {
        dbName: string;
        user: string;
        password: string;
        port: number;
        host: string;
        connection: string;
    };
    jwtSecret: string;
    jwtExpiresIn: string;
    apiKeys: {
        vt: string;
        ai: string;
        aiUrl: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    database: {
        dbName: string;
        user: string;
        password: string;
        port: number;
        host: string;
        connection: string;
    };
    jwtSecret: string;
    jwtExpiresIn: string;
    apiKeys: {
        vt: string;
        ai: string;
        aiUrl: string;
    };
}>;
export default _default;
