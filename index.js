/*jslint node: true */

/**
 * @brief This function is the starting point of the application.
 *
 * @return none
 */
function initialize() {
    'use strict';

    const express = require('express');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');

    // Setup express router.
    const router = require('./lib/router');
    // Get current configuration.
    const config = require('./config');
    // Setup slack api utility.
    const slackUtil = require('./lib/slackutil');
    // Setup bunyan logger
    const log = require('./lib/logger.js');
    const logger = log.create();
    // Setup locales config
    const locale = require('./locales').get(config.locale);

    /**
     * @brief This function sets up the middleware and defines the express
     *        routers before starting the application on the configured port. It
     *        is called after the slack api token is verified.
     *
     * @return none
     */
    function startApp() {

        // Connects the app to the mongodb server at the configured address.
        mongoose.connect(config.db.DB_ADDRESS);

        let app = express();

        /* Uses body-parser middleware to parse the given request and populate
         * req.body
         */
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        // Middleware to check and verify request from slack.
        app.use(slackUtil.checkPostBody);
        app.use(slackUtil.verifyCommandToken);

        app.use(log.logRequest);

        // Router middleware for the incoming POST requests.
        app.use("/", router);

        // Start the server on configured address.
        app.listen(config.PORT, config.IP_ADDRESS, function (error) {
            if (error !== undefined) {
                throw error;
            }
        });
    }

    // Authenticate the slack api token.
    slackUtil.authenticateToken(function (error, info) {
        if (error !== undefined) {
            throw error;
        }

        logger.trace(locale, "Current locale messages");
        logger.trace(info, "Authenticated by Slack!");
        // Ready to start the application.
        startApp();
    });
}

initialize();