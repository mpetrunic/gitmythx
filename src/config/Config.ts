const env = process.env;

/**
 * Stores all env configurations and their default values.
 */
const config = Object.freeze({
    port: env.SERVER_PORT || 3000,
});

export default config;
