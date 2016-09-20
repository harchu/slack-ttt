/*jslint node: true */

/**
 * @brief This function defines the handler for the /ttt 'status' command.
 *
 * @return object 'status' handler object containing the following methods:
 *                - parseArgs
 *                - handle
 */
function initializeCommand() {
    'use strict';

    const util = require('util');

    // Access the 'Game' model.
    const Game = require('../models/game');
    // Acces mongodb utility.
    const db = require('../lib/db');

    const drawer = require('../lib/drawer');
    // Access the application constants object.
    const constants = require('../lib/constants');
    // Access Slack utility object to format the message response.
    const slackUtil = require('../lib/slackutil');
    // Access bunyan logger.
    const logger = require('../lib/logger.js').create();
    // Get current configuration.
    const config = require('../config');
    // Setup locales config
    const locale = require('../locales').get(config.locale);
    const labels = locale[constants.commands.STATUS];

    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. Since the 'status' command does not need
     *        data, it does not need to validate the request body.
     *
     * @return boolean indicating the request validity
     */
    function parseArgs() {
        return true;
    }

    function handle(req, res) {
        console.log(req.body);

        let channelId = req.body.channel_id;
        let teamId = req.body.team_id;

        /**
         * @brief This function is invoked when the database lookup operation to
         *        find the channel's ongoing game is complete. If a valid game
         *        is found, its attributes are returned in the response.
         *
         * @param error db lookup error
         * @param game valid game from the db
         *
         * @return none
         */
        function dbLookupCallback(error, game) {

            if (error !== undefined && error !== null) {
                // No ongling game found in this channel.
                logger.error(error);
                return res.json(
                    slackUtil.createResponse({
                        text: labels.DB_ERROR,
                        response_type: "ephemeral"
                    })
                );
            }

            if (game === undefined || game === null) {
                // No ongling game found in this channel.
                return res.json(
                    slackUtil.createResponse({
                        text: labels.GAME_NOT_FOUND_ERROR,
                        response_type: "ephemeral"
                    })
                );
            }

            let index = 0;
            if (game.players[1].name === game.currentPlayer) {
                index = 1;
            }

            let status = util.format(
                labels.CMD_STATUS_TEXT,
                slackUtil.getUserDisplay(game.players[0]),
                slackUtil.getUserDisplay(game.players[1]),
                slackUtil.getUserDisplay(game.players[index])
            );

            res.json(
                slackUtil.createResponse({
                    text: labels.CMD_TEXT,
                    response_type: "ephemeral",
                    attachments: [{
                        text: status + "\n"
                                + drawer.draw(game.board),
                        color: "#36a64f",
                        mrkdwn_in: [
                            "text"
                        ]
                    }]
                })
            );
        }

        // Find a valid game being played in this channel.
        db.lookup(
            Game,
            {
                teamId,
                channelId,
                state: constants.gameState.STARTED
            },
            dbLookupCallback
        );
    }

    return Object.freeze({
        parseArgs,
        handle
    });
}

// Call the above function to create the 'status' command handler.
module.exports = initializeCommand();