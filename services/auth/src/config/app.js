/**
 * Application Configuration
 */
const appConfig = {
    port: process.env.PORT || 8081,
    nodeEnv: process.env.NODE_ENV || 'development',
    profileServiceUrl: process.env.PROFILE_SERVICE_URL || 'http://profile-service:8086',
};

module.exports = appConfig;
