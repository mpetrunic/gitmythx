const env = process.env;

/**
 * Stores all env configurations and their default values.
 */
const config = Object.freeze({
    app: {
        hostname: process.env.APP_HOSTNAME,
        githubAuthUrl: process.env.APP_HOSTNAME + "/oauth/github",
    },
    db: {
        database: process.env.DB_NAME || "nodefactory",
        define: {
            underscored: true,
        },
        dialect: process.env.DB_DIALECT || "postgres",
        host: process.env.DB_HOST || "db",
        password: process.env.DB_PASSWORD || "nodefactory",
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || "nodefactory",
    },
    github: {
        webhook: {
            secret: process.env.GITHUB_WEBHOOK_SECRET || "",
        },
        client: {
            id: process.env.GITHUB_CLIENT_ID,
            secret: process.env.GITHUB_CLIENT_SECRET,
        },
        app: {
            id: process.env.GITHUB_APP_ID,
            privateKeyLocation: process.env.GITHUB_PRIVATE_KEY_LOCATION,
        },
    },
    env: process.env.NODE_ENV || "dev",
    port: env.SERVER_PORT || 3000,
});

export default config;
