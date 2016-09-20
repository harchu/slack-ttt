/*jslint node: true */

/**
 * @brief This function sets up the application development configuration.
 *
 * @return object development configuration.
 */
function initializeProdConfig() {
    'use strict';

    return Object.freeze({
        URL: "https://" + process.env.OPENSHIFT_APP_DNS,
        // Express server port
        PORT: process.env.OPENSHIFT_NODEJS_PORT,
        // Express server address
        IP_ADDRESS: process.env.OPENSHIFT_NODEJS_IP,
        // Default log level
        LOG_LEVEL: process.env.LOG_LEVEL,
        // Database config
        db: {
            // mongodb address
            DB_ADDRESS: process.env.OPENSHIFT_MONGODB_DB_URL
                    + process.env.TTT_DB_NAME
        },
        // Slack related config
        slack: {
            // API token
            SLACK_API_TOKEN: process.env.SLACK_API_TOKEN,
            // /ttt command token
            TTT_COMMAND_TOKEN: process.env.TTT_COMMAND_TOKEN
        },
        locales: {
            US_EN: "US_EN"
        },
        locale: "US_EN"
    });
}

// Call above function to export the application prod config.
module.exports = initializeProdConfig();