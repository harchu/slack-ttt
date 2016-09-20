/*jslint node: true */

/**
 * @brief This function defines the handler for the /ttt 'history' command.
 *
 * @return object 'history' handler object containing the following methods:
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
    const labels = locale[constants.commands.HISTORY];

    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. Since the 'history' command does not need
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
         *        is found, its history & attributes are returned in the
         *        response.
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

            let currentPlayerIndex = 0;
            if (game.players[1].name === game.currentPlayer) {
                currentPlayerIndex = 1;
            }

            // Show status of the current game.
            let status = util.format(
                labels.CMD_STATUS_TEXT,
                slackUtil.getUserDisplay(game.players[0]),
                slackUtil.getUserDisplay(game.players[1])
            );

            // Get historical moves for this game.
            let history = game.history;

            // Text representing the historical moves.
            let historyText = "";
            let i = 0;
            let index = 0;
            let symbol = constants.drawState[constants.moveState.X];
            while (i < history.length) {
                historyText = historyText + (i + 1) + ". "
                        + slackUtil.getUserDisplay(game.players[index])
                        + " placed an `" + symbol + "` at location `"
                        + history[i].move + "` at `"
                        + history[i].time.toUTCString() + "`\n";
                index = (index + 1) % 2;
                if (symbol === constants.drawState[constants.moveState.X]) {
                    symbol = constants.drawState[constants.moveState.O];
                } else {
                    symbol = constants.drawState[constants.moveState.X];
                }
                i = i + 1;
            }

            if (history.length === 0) {
                historyText = labels.HISTORY_NOT_FOUND_ERROR;
            }

            res.json(
                slackUtil.createResponse({
                    text: status,
                    response_type: "ephemeral",
                    attachments: [{
                        text: historyText + "\n"
                                + util.format(
                            labels.CMD_STATUS_TURN_TEXT,
                            slackUtil.getUserDisplay(
                                game.players[currentPlayerIndex]
                            )
                        )
                                + "\n" + drawer.draw(game.board),
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

// Call the above function to create the 'history' command handler.
module.exports = initializeCommand();