/*jslint node: true */

/**
 * @brief This function defines the handler functions for the /ttt help command.
 *
 * @return object 'help' handler object containing the following methods:
 *                - parseArgs
 *                - handle
 */
function initializeCommand() {
    'use strict';

    // Access Slack utility object to format the message response.
    const slackUtil = require('../lib/slackutil');
    // Access application constants.
    const constants = require('../lib/constants');
    // Get current configuration.
    const config = require('../config');
    // Setup locales config
    const locale = require('../locales').get(config.locale);
    const labels = locale[constants.commands.HELP];

    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. Since the 'help' command does not need
     *        data, it does not need to validate the request body.
     *
     * @return boolean indicating the request validity
     */
    function parseArgs() {
        return true;
    }


    /**
     * @brief This function handles the /ttt 'help' command. It creates a Slack
     *        JSON message explaining the command's usage.
     *
     * @param req express http request object
     * @param res express http response object
     *
     * @return none
     */
    function handle(req, res) {

        // Get help text and attachments.
        let text = labels.CMD_TEXT;

        // If an error message is present in req use the appropriate attachment.
        let attachment = constants.help.helpUsageSlackAttachment;
        if (req.body.errorMessage !== undefined) {
            text = req.body.errorMessage;
            attachment = constants.help.commandUsageSlackAttachment;
        }

        // Send Slack JSON message as the response.
        res.json(
            slackUtil.createResponse({
                text,
                response_type: "ephemeral",
                attachments: [attachment]
            })
        );

    }

    return Object.freeze({
        parseArgs,
        handle
    });
}

// Call the above function to create the 'help' command handler.
module.exports = initializeCommand();