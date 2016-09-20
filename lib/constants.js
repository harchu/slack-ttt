/*jslint node: true */

function initialize() {
    'use strict';

    return Object.freeze({
        // Name of the current application
        appName: "ttt",

        // Name of the Slack slash command
        comandName: "ttt",

        // Defines the states of the game
        gameState: {
            // Game has started and moves can be made
            STARTED: "STARTED",
            // Game has ended with one of the players winning
            WIN: "WIN",
            // Game has ended in a tie
            TIE: "TIE",
            // Game has ended abruptly without a result
            NORESULT: "NORESULT"
        },

        // Defines the possible states of the cells on the game board
        moveState: {
            // Empty cell
            EMPTY: 0,
            // Cell containing 'X' (move by player 1)
            X: 1,
            // Cell containing 'O' (move by player 2)
            O: 2
        },

        // Defines the drawn symbols on the game board
        drawState: [
            " ",
            "X",
            "O"
        ],

        // Default Board size
        boardSize: 3,

        // ttt commands
        commands: {
            // Command to start a new game
            START: "start",
            // Command to make a move
            PLAY: "play",
            // Command to get status of current game
            STATUS: "status",
            // Command to end the game
            END: "end",
            // Command to get help with the commands
            HELP: "help",
            // Command to get history of current game
            HISTORY: "history"
        },

        help: {
            commandUsageSlackAttachment: {
                title: "Command Usage:",
                color: "#ff0000",
                text: "1. Start a game with another user using `/ttt start "
                        + "@username`. This will randomly pick a player to "
                        + "make the first move.\n"
                        + "2. To make a move at board cell 'index' in the "
                        + "ongoing game, enter `/ttt play <index>`\n"
                        + "3. Want to get the status of the game? Enter `/ttt "
                        + "status`\n"
                        + "4. Who played what? When? Enter `/ttt history`\n"
                        + "5. End the game using `/ttt end`\n6. Stuck? Need "
                        + "help? Enter `/ttt help`",
                mrkdwn_in: [
                    "text"
                ]
            },
            helpUsageSlackAttachment: {
                title: "Command Usage:",
                color: "#ff9900",
                text: "1. Start a game with another user using `/ttt start "
                        + "@username`. This will randomly pick a player to "
                        + "make the first move.\n"
                        + "2. To make a move at board cell 'index' in the "
                        + "ongoing game, enter `/ttt play <index>`\n"
                        + "3. Want to get the status of the game? Enter `/ttt "
                        + "status`\n"
                        + "4. Who played what? When? Enter `/ttt history`\n"
                        + "5. End the game using `/ttt end`\n6. Stuck? Need "
                        + "help? Enter `/ttt help`",
                mrkdwn_in: [
                    "text"
                ]
            }
        }
    });
}

// Call above function to export the constants object.
module.exports = initialize();
