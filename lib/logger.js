/*jslint node: true */

/**
 * @brief This function sets up the bunyan logger object based on the given
 *        configuration.
 *
 * @return object log utility object with following methods:
 *                - create
 *                - logRequest
 */
function initializeLogger() {
    'use strict';
    const bunyan = require('bunyan');

    // Get current configuration.
    const config = require('../config');
    const constants = require('./constants');

    // Logger object.
    let logger;

    /**
     * @brief Main function responsible for creating the logger or returning the
     *        existing logger.
     *
     * @return object bunyan logger object
     */
    function create() {
        if (logger !== undefined) {
            // Logger already created.
            return logger;
        }

        // Create bunyan logger.
        logger = bunyan.createLogger({
            name: constants.appName,
            level: config.LOG_LEVEL,
            src: true
        });

        return logger;
    }

    /**
     * @brief Middleware function to log each incoming request.
     *
     * @param req express http request object
     * @param ignore
     * @param next express next function
     *
     * @return none
     */
    function logRequest(req, ignore, next) {
        logger.info({requestBody: req.body}, "Incoming request.");

        // Runs the next middleware function.
        next();
    }

    return Object.freeze({
        create,
        logRequest
    });
}

// Call above function to export the log util object.
module.exports = initializeLogger();