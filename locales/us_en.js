/*jslint node: true */

/**
 * @brief This function sets up the US English locale configuration.
 *
 * @return object development configuration.
 */
function initializeDevConfig() {
    'use strict';

    // Access the application constants object.
    const constants = require('../lib/constants');

    // String messages for the /ttt commands.
    let locale = {};
    locale[constants.commands.START] = {
        DB_ERROR: "Something went wrong! Please try again later.",
        CHANNEL_ERROR: "Unable to start the game!",
        CHANNEL_DETAIL_ERROR: "Please run this command from a valid "
                + "channel",
        USER_ERROR: "Unable to start the game!",
        USER_DETAIL_ERROR: "Invalid username given!! `@%s` is not a member of "
                + "<#%s|%s>",
        SAME_USER_ERROR: "You cannot play the game with yourself!",
        GAME_START_ERROR: "Game already started in this channel!",
        GAME_SYNC_ERROR: "Game being created in this channel!",
        CMD_TEXT: "New Game started in this channel!",
        CMD_DETAIL_TEXT: "%s has challenged %s to a new game."
    };
    locale[constants.commands.PLAY] = {
        DB_ERROR: "Something went wrong! Please try again later.",
        GAME_NOT_FOUND_ERROR: "No game is being played in this channel!\n"
                + "Start a game using `/ttt start @username`",
        MOVE_ERROR: "Invalid move! <index> should be a valid number.",
        USER_ERROR: "You are not allowed to make a move!",
        USER_DETAIL_ERROR: "Only players of this game (%s and %s) can play"
                + " the game!",
        TURN_ERROR: "Patience! It is %s's turn!",
        CMD_ERROR: "That is an invalid move!",
        CMD_DETAIL_ERROR: "Please make your move in one of "
                + "the available cells, using "
                + "`/ttt play <index>`",
        WIN_TEXT: "Game over! %s has won this game! :thumbsup:",
        TIE_TEXT: "Game over! We have a TIE",
        NEXT_TURN_TEXT: "Well done %s :thumbsup:\n It is now %s's turn!"

    };
    locale[constants.commands.STATUS] = {
        DB_ERROR: "Something went wrong! Please try again later.",
        GAME_NOT_FOUND_ERROR: "No game is being played in this channel!\n"
                + "Start a game using `/ttt start @username`",
        CMD_TEXT: "Game status:",
        CMD_STATUS_TEXT: "Game is currently being played between %s and %s\n"
                + "It is now %s's turn!"

    };
    locale[constants.commands.HISTORY] = {
        DB_ERROR: "Something went wrong! Please try again later.",
        GAME_NOT_FOUND_ERROR: "No game is being played in this channel!\n"
                + "Start a game using `/ttt start @username`",
        HISTORY_NOT_FOUND_ERROR: "No moves have been played yet.",
        CMD_STATUS_TEXT: "Game is currently being played between %s and %s",
        CMD_STATUS_TURN_TEXT: "It is now %s's turn!"
    };
    locale[constants.commands.END] = {
        DB_ERROR: "Something went wrong! Please try again later.",
        GAME_NOT_FOUND_ERROR: "No game is being played in this channel!\n"
                + "Start a game using `/ttt start @username`",
        CMD_ERROR: "This game cannot be ended by you!",
        CMD_DETAIL_ERROR: "Only players of this game (%s and %s) can end"
                + " the game!",
        CMD_SUCCESS: "Game between %s and %s has been ended!"
    };
    locale[constants.commands.HELP] = {
        CMD_TEXT: "Let's learn how to use the /ttt command.\n"
                + "/ttt command can be used to play TicTacToe with other users "
                + "in a channel! At a time only one game can be played in a "
                + "channel."
    };

    return Object.freeze(locale);
}

// Call above function to export the US English locale configuration.
module.exports = initializeDevConfig();