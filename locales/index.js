/*jslint node: true */

/**
 * @brief This function sets up the application locales configuration
 *        based on the current process environment.
 *
 * @return object configuration object.
 */
function initialize() {
    'use strict';

    const config = require('../config');

    let localeMap = new Map();
    localeMap.set(config.locales.US_EN, require('./us_en'));

    return localeMap;
}

// Call above function to export the app locales object.
module.exports = initialize();