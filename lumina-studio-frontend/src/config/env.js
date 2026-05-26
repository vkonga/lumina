/**
 * @file env.js
 * @description Reads Vite environment variables and app.config.json to expose
 * a single ENV object consumed throughout the application.
 *
 * Priority: VITE_* env vars override app.config.json values.
 */
import appConfig from './app.config.json';

/** Detect current environment from Vite's MODE. */
const resolveEnv = () => {
    const mode = import.meta.env.MODE || 'localhost';
    const envMap = {
        development: 'localhost',
        test: 'development',
        staging: 'staging',
        production: 'production',
    };
    return envMap[mode] || 'localhost';
};

const envKey = resolveEnv();
const configForEnv = appConfig.environments[envKey] || appConfig.environments.localhost;

/**
 * Centralized environment configuration object.
 * @type {{
 *   API_BASE_URL: string,
 *   TIMEOUT_MS: number,
 *   RETRY_COUNT: number,
 *   ENV: string,
 *   IS_PRODUCTION: boolean,
 * }}
 */
const ENV = {
    API_BASE_URL: import.meta.env.VITE_API_URL || configForEnv.API_BASE_URL,
    TIMEOUT_MS: Number(import.meta.env.VITE_TIMEOUT_MS) || configForEnv.TIMEOUT_MS,
    RETRY_COUNT: Number(import.meta.env.VITE_RETRY_COUNT) || configForEnv.RETRY_COUNT,
    ENV: envKey,
    IS_PRODUCTION: envKey === 'production',
};

export default ENV;
