/*jslint node: true */

/**
 * @brief This function sets up ttt command handlers.
 *
 * @return object Map containing the mapping between the ttt commands and its
 *                handlers.
 */
function initializeCommands() {
    'use strict';

    // Access constants file
    const constants = require('../lib/constants');

    // Command handler map
    let funcMap = new Map();

    // Populating handler map with appropriate handlers.
    funcMap.set(constants.commands.START, require("./start"));
    funcMap.set(constants.commands.PLAY, require("./play"));
    funcMap.set(constants.commands.STATUS, require("./status"));
    funcMap.set(constants.commands.HISTORY, require("./history"));
    funcMap.set(constants.commands.END, require("./end"));
    funcMap.set(constants.commands.HELP, require("./help"));

    return funcMap;
}

// Call above function to export the ttt command handler map.
module.exports = initializeCommands();