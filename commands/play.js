/*jslint node: true */

/**
 * @brief This function defines the handler for the /ttt 'play' command.
 *
 * @return object 'play' handler object containing the following methods:
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
    const labels = locale[constants.commands.PLAY];


    /**
     * @brief This function checks if the last 'move' caused the player to win
     *        the game. It checks the row, column and the diagonals if
     *        applicable.
     *
     * @param board game board array with all the moves
     * @param move location on the board corresponding to the last move
     *
     * @return object indicating if the player won ('status') and the 'row',
     *                'column' or 'diagonal' which has the winning symbols
     */
    function hasWon(board, move) {
        let size = Math.sqrt(board.length);
        let row = Math.floor(move / size);
        let col = move % size;

        let val = board[move];

        /**
         * @brief This function checks if the last 'move' caused the player to
         *        win the game in the move's row.
         *
         * @return object indicating if the player won ('status') and the 'row',
         *                of the winning symbol
         */
        function hasWonRow() {
            let i = 0;
            while (i < size) {
                if (board[size * row + i] !== val) {
                    return {status: false};
                }
                i = i + 1;
            }

            return {
                status: true,
                row: row
            };
        }

        /**
         * @brief This function checks if the last 'move' caused the player to
         *        win the game in the move's column.
         *
         * @return object indicating if the player won ('status') and the
         *                'column' of the winning symbol
         */
        function hasWonCol() {
            let i = 0;
            while (i < size) {
                if (board[size * i + col] !== val) {
                    return {status: false};
                }
                i = i + 1;
            }

            return {
                status: true,
                column: col
            };
        }

        /**
         * @brief This function checks if the last 'move' caused the player to
         *        win the game in the fwd diagonal.
         *
         * @return object indicating if the player won ('status') and the
         *                'diagonal' of the winning symbol
         */
        function hasWonFwdDiagonal() {
            let i = 0;
            while (i < size) {
                if (board[size * i + i] !== val) {
                    return {status: false};
                }
                i = i + 1;
            }

            return {
                status: true,
                diaognal: 1
            };
        }

        /**
         * @brief This function checks if the last 'move' caused the player to
         *        win the game in the backward diagonal.
         *
         * @return object indicating if the player won ('status') and the
         *                'diagonal' of the winning symbol
         */
        function hasWonBwdDiagonal() {
            let i = 0;
            while (i < size) {
                if (board[size * i + (size - i - 1)] !== val) {
                    return {status: false};
                }
                i = i + 1;
            }

            return {
                status: true,
                diagonal: -1
            };
        }

        let win = hasWonRow();
        if (win.status === true) {
            return win;
        }

        win = hasWonCol();
        if (win.status === true) {
            return win;
        }

        if (row === col) {
            win = hasWonFwdDiagonal();
            if (win.status === true) {
                return win;
            }
        }

        if (row === size - col - 1) {
            win = hasWonBwdDiagonal();
            if (win.status === true) {
                return win;
            }
        }

        // The last move did not cause the player to win the game.
        return {status: false};
    }


    function getMoveState(index) {
        if (index === 0) {
            return constants.moveState.X;
        }

        return constants.moveState.O;
    }


    /**
     * @brief This function checks the request body to see if all the valid
     *        parameters are present. The 'play' command needs a board index to
     *        be able to execute.
     *
     * @return boolean indicating the request validity
     */
    function parseArgs(req) {
        // Parse the 'text' field to get the /ttt arguments.
        let text = req.body.text;
        let args = text.trim().split(" ");
        if (args.length < 2) {
            return false;
        }

        // 2nd argument should be a valid number.
        let num = Number(args[1]);

        req.body.tttMove = num;
        return true;
    }


    function handle(req, res) {

        let channelId = req.body.channel_id;
        let teamId = req.body.team_id;
        let move = req.body.tttMove;
        let player = req.body.user_name;

        if (Number.isNaN(move) === true) {
            return res.json(
                slackUtil.createResponse({
                    text: labels.MOVE_ERROR,
                    response_type: "ephemeral",
                    attachments: [constants.help.commandUsageSlackAttachment]
                })
            );
        }

        /**
         * @brief This function is invoked when the database lookup
         *        operation to find the channel's ongoing game is complete.
         *        If a valid game is found, and the current user is allowed to
         *        make a move, then the game board is updated. After every move,
         *        the function checks if this move caused the current player to
         *        win or if the game ended in a tie. The game is updated in the
         *        database accordingly.
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

            let currentPlayer = game.currentPlayer;
            let players = game.players;

            // Check if the user running this command is the current player.
            if (players[0].name !== player && players[1].name !== player) {
                return res.json(
                    slackUtil.createResponse({
                        text: labels.USER_ERROR,
                        response_type: "ephemeral",
                        attachments: [{
                            text: util.format(
                                labels.USER_DETAIL_ERROR,
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

            let index = 0;
            if (players[1].name === currentPlayer) {
                index = 1;
            }

            if (currentPlayer !== player) {
                return res.json(
                    slackUtil.createResponse({
                        text: labels.USER_ERROR,
                        response_type: "ephemeral",
                        attachments: [{
                            text: util.format(
                                labels.TURN_ERROR,
                                slackUtil.getUserDisplay(players[index])
                            ),
                            color: "#ff0000",
                            mrkdwn_in: [
                                "text"
                            ]
                        }]
                    })
                );
            }

            // Check if the given index is available to make a move.
            if (move >= game.board.length
                    || game.board[move] !== 0) {

                return res.json(
                    slackUtil.createResponse({
                        text: labels.CMD_ERROR,
                        response_type: "ephemeral",
                        attachments: [{
                            text: labels.CMD_DETAIL_ERROR,
                            color: "#ff0000",
                            mrkdwn_in: [
                                "text"
                            ]
                        }]
                    })
                );
            }

            let winner;

            // Make the move by marking the board.
            game.board[move] = getMoveState(index);

            // Update the history of moves.
            game.history.push({
                player: currentPlayer,
                move
            });
            game.markModified("board");
            game.markModified("history");

            // Check if we have a result.
            let winStatus = hasWon(game.board, move);
            if (winStatus.status === true) {
                /* This move resulted in the current player winning. Update the
                 * game state and winner.
                 */
                game.state = constants.gameState.WIN;
                game.winner = currentPlayer;
                winner = players[index];
            } else if (game.board.indexOf(constants.moveState.EMPTY) === -1) {
                // The board is now full, causing a Tie. Update the game state.
                game.state = constants.gameState.TIE;
            } else {
                // No result yet. Update the currentPlayer.
                game.currentPlayer = players[(index + 1) % 2].name;
            }

            // Save the updated game to the database.
            db.update(game, function (error) {
                if (error) {
                    logger.error(error);
                    return res.send(error);
                }

                // Check if we have a winner and return appropriate message.
                if (winner !== undefined) {
                    return res.json(
                        slackUtil.createResponse({
                            text: util.format(
                                labels.WIN_TEXT,
                                slackUtil.getUserDisplay(winner)
                            ),
                            attachments: [{
                                text: drawer.draw(game.board, winStatus),
                                color: "#36a64f",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
                        })
                    );
                }

                // Check if we have a tie and return appropriate message.
                if (game.state === constants.gameState.TIE) {
                    return res.json(
                        slackUtil.createResponse({
                            text: labels.TIE_TEXT,
                            attachments: [{
                                text: drawer.draw(game.board, winStatus),
                                color: "#36a64f",
                                mrkdwn_in: [
                                    "text"
                                ]
                            }]
                        })
                    );
                }

                // Indicate whose turn it is next and draw the current board.
                res.json(
                    slackUtil.createResponse({
                        text: util.format(
                            labels.NEXT_TURN_TEXT,
                            slackUtil.getUserDisplay(players[index]),
                            slackUtil.getUserDisplay(players[(index + 1) % 2])
                        ),
                        attachments: [{
                            text: drawer.draw(game.board),
                            color: "#36a64f",
                            mrkdwn_in: [
                                "text"
                            ]
                        }]
                    })
                );
            });
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

// Call the above function to create the 'play' command handler.
module.exports = initializeCommand();