/*jslint node: true */

/**
 * @brief This function sets up the mongodb 'Game' model schema.
 *
 * @return object mongoose 'Game' model
 */
function initializeGame() {
    'use strict';

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    // Creating new mongodb schema to create Game model.
    let GameSchema = new Schema({
        // Slack team id
        teamId: {type: String, index: true},
        // Slack channel id
        channelId: {type: String, index: true},
        // Name of user initiating the game
        startPlayer: String,
        /* Array of players, where player at index 0 begins the game with an 'X'
         * and player at index 1 plays next with an 'O'
         */
        players: [{
            // User id of the player
            id: String,
            // User name of the player
            name: String
        }],
        // Name of current player
        currentPlayer: String,
        // Name of winner of the game
        winner: String,
        /* tic-tac-toe board represented as a single dimensional array. So a
         * 3*3 board will be represented as an array of length = 9
         */
        board: [Number],
        // Current state of the game
        state: {type: String, index: true},
        // History of all moves
        history: [{
            // Name of player making the move
            player: String,
            // Location of the move on the board
            move: Number,
            // Time at which the move was made
            time: {type: Date, default: Date.now}
        }]
    }, {
        strict: true,
        timestamps: true // adds 'createdAt' and 'updatedAt' timestamps
    });

    return mongoose.model("Game", GameSchema);
}

// Call above function to export the mongoose 'Game' model.
module.exports = initializeGame();