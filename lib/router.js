/*jslint node: true */

/**
 * @brief This function sets up the express router to handle POST requests.
 *
 * @return object express router.
 */
function initializeRouter() {
    'use strict';
    const express = require('express');
    const router = express.Router();

    // Access application constants.
    const constants = require('../lib/constants');
    // Setup map containing command handlers.
    const funcMap = require('../commands');
    // Access bunyan logger.
    const logger = require('./logger.js').create();


    /**
     * @brief Middeware function to handle express http POST requests. This
     *        function checks the arguments to the /ttt command and calls
     *        the appropriate handler function.
     *
     * @param req express http request object
     * @param res express http response object
     *
     * @return none
     */
    function postHandler(req, res) {
        // Check /ttt command arguments available in the 'text' field.
        let text = req.body.text;
        let args = text.trim().split(" ");
        let command;
        if (args.length === 0) {
            // Since no arguments given, defualt to 'help'
            command = constants.commands.HELP;
        } else {
            // First argument represnts the ttt command to be handled.
            command = args[0];
        }

        // Get the appropriate handler.
        let handler = funcMap.get(command);

        if (handler === undefined) {
            // Since no arguments given, defualt to 'help'
            command = constants.commands.HELP;
            handler = funcMap.get(command);
            req.body.errorMessage = "You have entered an invalid command!";
        }

        /* The handler first validates the request body to check if it has all
         * the required data and then proceeds to handle the request.
         */
        if (handler.parseArgs(req) === false) {
            // Since the request is invalid, execute the 'help' routine.
            handler = funcMap.get(constants.commands.HELP);
        }

        logger.trace({requestBody: req.body}, "POST body checking done.");

        // Call the 'handle' function to generate the response.
        handler.handle(req, res);

    }

    /* GET handler returning an HTTP 200 response to respond to periodic
     * requests from Slack to verify the certificate.
     */
    router.get('/', function (req, res) {
        logger.info({req}, "GET request received");
        return res.status(200).end("OK");
    });

    /* Setup router middleware to handle POST requests */
    router.post('/', postHandler);

    return router;
}

// Call above function to export the express router.
module.exports = initializeRouter();