/*jslint node: true */

/**
 * @brief This function sets up the application configuration based on the
 *        current process environment.
 *
 * @return object configuration object.
 */
function initialize() {
    'use strict';

    const dotenv = require('dotenv');

    // Return the appropriate config based on the current Node.js environment.
    const env = process.env.NODE_ENV || "development";
    // Load the process environment with values from the .env file.
    dotenv.config("../.env");

    // Get the development and production configs.
    const dev = require('./development');
    const prod = require('./production');

    if (env === "development") {
        return dev;
    }
    return prod;
}

// Call above function to export the app config object.
module.exports = initialize();