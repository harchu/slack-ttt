/*jslint node: true */

/**
 * @brief This function sets up the application development configuration.
 *
 * @return object development configuration.
 */
function initializeDevConfig() {
    'use strict';

    return Object.freeze({
        URL: "http://localhost:3000",
        // Express server port
        PORT: 3000,
        // Express server address
        IP_ADDRESS: "127.0.0.1",
        // Default log level
        LOG_LEVEL: process.env.LOG_LEVEL,
        // Database config
        db: {
            // mongodb address
            DB_ADDRESS: "mongodb://localhost:27017/" + process.env.TTT_DB_NAME
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

// Call above function to export the application dev config.
module.exports = initializeDevConfig();