/*jslint node: true */

/**
 * @brief This function defines the handler for the /ttt 'end' command.
 *
 * @return object 'end' handler object containing the following methods:
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
    // Access Slack utility object to format the message response.
    const slackUtil = require('../lib/slackutil');
    // Access the application constants object.
    const constants = require('../lib/constants');
    // Access bunyan logger.
    const logger = require('../lib/logger.js').create();
    // Get current configuration.
    const config = require('../config');
    // Setup locales config
    const locale = require('../locales').get(config.locale);
    const labels = locale[constants.commands.END];

    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. Since the 'end' command does not need
     *        data, it does not need to validate the request body.
     *
     * @return boolean indicating the request validity
     */
    function parseArgs() {
        return true;
    }


    /**
     * @brief This function handles the /ttt 'end' command. If a valid game is
     *        found in the channel, then its state is updated in the database.
     *
     * @param req express http request object
     * @param res express http response object
     *
     * @return none
     */
    function handle(req, res) {

        // Get the channel, team and name of the user from the request body.
        let channelId = req.body.channel_id;
        let teamId = req.body.team_id;
        let player = req.body.user_name;

        /**
         * @brief This function is invoked when the database lookup operation to
         *        find the channel's ongoing game is complete. If a valid game
         *        is found, its state in the database is updated.
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

            // Check if the user running this command is one of the 2 players.
            let players = game.players;
            if (players[0].name !== player && players[1].name !== player) {
                return res.json(
                    slackUtil.createResponse({
                        text: labels.CMD_ERROR,
                        response_type: "ephemeral",
                        attachments: [{
                            text: util.format(
                                labels.CMD_DETAIL_ERROR,
                                slackUtil.getUserDisplay(players[0]),
                                slackUtil.getUserDisplay(players[1])
                            ),
                            color: "#ff0000",
                            mrkdwn_in: [
                                "text"
                            ]
                        }]
                    })
                );
            }

            // End the game by updating the game state.
            game.state = constants.gameState.NORESULT;

            // Save the upated record to the database
            db.update(game, function (error) {
                if (error) {
                    return res.send(error);
                }

                res.json(
                    slackUtil.createResponse({
                        text: util.format(
                            labels.CMD_SUCCESS,
                            slackUtil.getUserDisplay(players[0]),
                            slackUtil.getUserDisplay(players[1])
                        )
                    })
                );
            });
        }

        // Find the ongoing game in the channel.
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

// Call the above function to create the 'end' command handler.
module.exports = initializeCommand();