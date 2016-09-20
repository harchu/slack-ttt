/*jslint node: true */

/**
 * @brief This function defines the handler for the /ttt 'start' command.
 *
 * @return object 'start' handler object containing the following methods:
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
    const labels = locale[constants.commands.START];

    let startMap = {};

    /**
     * @brief This function generates a random whole number in the given range.
     *
     * @param min min random number
     * @param max max random number
     *
     * @return integer random integer in the range [min, max]
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    /**
     * @brief This function updates the Game model object with values for a new
     *        game.
     *
     * @param game the game model object,
     * @param properties game properties object including,
     *                   teamId,
     *                   channelId,
     *                   startPlayer,
     *                   player1,
     *                   player2
     *
     * @return none
     */
    function updateGame(game, properties) {
        game.teamId = properties.teamId;
        game.channelId = properties.channelId;
        game.startPlayer = properties.startPlayer.name;
        game.players = [properties.player1, properties.player2];
        game.currentPlayer = properties.player1.name;

        // Setup the game board.
        let i = 0;
        game.board = [];
        while (i < (constants.boardSize * constants.boardSize)) {
            game.board.push(constants.moveState.EMPTY);
            i = i + 1;
        }
        game.markModified("board");
        // Game has now started.
        game.state = constants.gameState.STARTED;
        game.history = [];
    }


    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. The 'start' command needs a username to be
     *        able to execute.
     *
     * @return boolean indicating the request validity
     */
    function parseArgs(req) {
        // Parse the 'text' field to get the /ttt arguments.
        let text = req.body.text;
        let args = text.trim().split(" ");
        // Username should be the 2nd argument.
        if (args.length < 2 || args[1].startsWith("@") === false) {
            return false;
        }

        req.body.tttUserName = args[1].substr(1);

        if (req.body.user_name === req.body.tttUserName) {
            req.body.errorMessage = labels.SAME_USER_ERROR;
            return false;
        }

        return true;
    }


    /**
     * @brief This function handles the /ttt 'start' command. If the user being
     *        challenged is a user in the current channel, then a new game can
     *        be started between the two players. The player making the first
     *        move is picked at random and the game state is updated in the
     *        database. If a game is already going on the channel, then an error
     *        is returned to the user.
     *
     * @param req express http request object
     * @param res express http response object
     *
     * @return none
     */
    function handle(req, res) {

        let player1 = {
            id: req.body.user_id,
            name: req.body.user_name
        };
        let player2 = {
            name: req.body.tttUserName
        };
        let channelId = req.body.channel_id;
        let channelName = req.body.channel_name;
        let teamId = req.body.team_id;

        // Check if the given user is a valid member of this channel.
        slackUtil.isValidUser(player2.name, channelId, function (error, userId) {
            logger.error(error);
            if (error !== undefined) {
                // This error is due to an error calling the channels.info API.
                if (error.ok !== true) {
                    return res.json(
                        slackUtil.createResponse({
                            text: labels.CHANNEL_ERROR,
                            response_type: "ephemeral",
                            attachments: [{
                                text: labels.CHANNEL_DETAIL_ERROR,
                                color: "#ff0000",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
                        })
                    );
                }

                // This error is due to an error getting the list of errors.
                return res.json(
                    slackUtil.createResponse({
                        text: labels.DB_ERROR,
                        response_type: "ephemeral"
                    })
                );
            }

            // Unable to get the user id of this user from Slack.
            if (userId === undefined) {
                return res.json(
                    slackUtil.createResponse({
                        text: labels.USER_ERROR,
                        response_type: "ephemeral",
                        attachments: [{
                            text: util.format(
                                labels.USER_DETAIL_ERROR,
                                player2.name,
                                channelId,
                                channelName
                            ),
                            color: "#ff0000",
                            mrkdwn_in: [
                                "text"
                            ]
                        }]
                    })
                );
            }

            player2.id = userId;


            /**
             * @brief This function is invoked when the database lookup
             *        operation to find the channel's ongoing game is complete.
             *        If a valid game is found, an error is returned. Otherwise,
             *        a new game is initialized and saved to the db.
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

                if (game !== undefined && game !== null) {
                    logger.info(game, "Game already started in this channel!");
                    return res.json(
                        slackUtil.createResponse({
                            text: labels.USER_ERROR,
                            response_type: "ephemeral",
                            attachments: [{
                                text: labels.GAME_START_ERROR,
                                color: "#ff0000",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
                        })
                    );
                }

                if (startMap[channelId] === undefined) {
                    startMap[channelId] = player1;
                } else {
                    return res.json(
                        slackUtil.createResponse({
                            text: labels.USER_ERROR,
                            response_type: "ephemeral",
                            attachments: [{
                                text: labels.GAME_SYNC_ERROR,
                                color: "#ff0000",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
                        })
                    );
                }

                // Create a new game.
                game = new Game();

                // Pick a player at random to make the first move.
                let index = getRandomInt(1, 2);
                if (index === 1) {
                    updateGame(game, {
                        teamId,
                        channelId,
                        startPlayer: player1,
                        player1,
                        player2
                    });
                } else {
                    updateGame(game, {
                        teamId,
                        channelId,
                        startPlayer: player1,
                        player1: player2,
                        player2: player1
                    });
                }

                // Save the new game to the database.
                db.insert(game, function (saveError) {
                    startMap[channelId] = undefined;
                    if (saveError) {
                        return res.send(saveError);
                    }

                    res.json(
                        slackUtil.createResponse({
                            text: labels.CMD_TEXT,
                            attachments: [{
                                text: util.format(
                                    labels.CMD_DETAIL_TEXT,
                                    slackUtil.getUserDisplay(player1),
                                    slackUtil.getUserDisplay(player2)
                                ) + "\n"
                                        + "`X` -> "
                                        + slackUtil.getUserDisplay(
                                    game.players[0]
                                ) + "\n"
                                        + "`O` -> "
                                        + slackUtil.getUserDisplay(
                                    game.players[1]
                                ) + "\n"
                                        + "First move by: "
                                        + slackUtil.getUserDisplay(
                                    game.players[0]
                                ) + "\n"
                                        + drawer.draw(game.board),
                                color: "#36a64f",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
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
        });
    }

    return Object.freeze({
        parseArgs,
        handle
    });
}

// Call the above function to create the 'start' command handler.
module.exports = initializeCommand();