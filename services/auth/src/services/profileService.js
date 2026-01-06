const axios = require('axios');
const appConfig = require('../config/app');

/**
 * Profile Service Client
 * Handles communication with profile microservice
 */
class ProfileService {
    constructor() {
        this.baseUrl = appConfig.profileServiceUrl;
    }

    /**
     * Initialize user profile in profile service
     */
    async initializeProfile(userData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/user-profile/internal/init`,
                {
                    id: userData.id,  // Profile service expects 'id'
                    username: userData.username,
                    email: userData.email,
                },
                {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(`[PROFILE] Profile created for user ${userData.id}`);
            return response.data;
        } catch (error) {
            console.error('[PROFILE ERROR] Failed to create profile:', error.message);
            throw error;
        }
    }
}

module.exports = new ProfileService();
