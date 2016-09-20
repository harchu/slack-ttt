/*jslint node: true */

/**
 * @brief This function defines the game board display utility functions.
 *
 * @return object object containing the following methods:
 *                - draw
 */
function initializeDrawer() {
    'use strict';

    // Access the application constants object.
    const constants = require('../lib/constants');

    function draw(board, win) {
        let msg = "";
        let i = 0;
        let size = Math.sqrt(board.length);

        // Get the positions on the board corresponding to the win.
        let positions = [];
        let hasWon = false;
        if (win !== undefined && win.status === true) {
            hasWon = true;
            if (win.row !== undefined && win.row >= 0 && win.row < size) {
                let c = 0;
                while (c < size) {
                    positions.push(size * win.row + c);
                    c = c + 1;
                }
            } else if (win.column !== undefined && win.column >= 0
                    && win.column < size) {
                let r = 0;
                while (r < size) {
                    positions.push(size * r + win.column);
                    r = r + 1;
                }
            } else if (win.diagonal !== undefined) {
                if (win.diagonal === 1) {
                    let fd = 0;
                    while (fd < size) {
                        positions.push(size * fd + fd);
                        fd = fd + 1;
                    }
                } else if (win.diagonal === -1) {
                    let bd = 0;
                    while (bd < size) {
                        positions.push(size * bd + (size - bd - 1));
                        bd = bd + 1;
                    }
                }
            }
        }

        let pos = 0;

        // Loop through the board and display each cell.
        while (i < size) {
            let j = 0;
            msg += "|";
            // Appending the i'th row to the result string.
            while (j < size) {
                let val = board[size * i + j];
                let symbol = constants.drawState[val];
                // If no one has won yet, display numbers marking the cells.
                if (symbol === " ") {
                    if (hasWon === true) {
                        symbol = " `" + "_" + "`";
                    } else {
                        symbol = " `" + (size * i + j) + "`";
                    }
                } else if (hasWon === true
                        && pos < positions.length
                        && size * i + j === positions[pos]) {
                    // If someone did win, mark the win positions with backticks
                    symbol = " `" + symbol + "`";
                    pos = pos + 1;
                } else {
                    symbol = " " + symbol + " ";
                }

                // Add the cell to the result string.
                msg = msg + " " + symbol + " |";
                j = j + 1;
            }

            msg = msg + "\n";

            i = i + 1;
            if (i === size) {
                break;
            }
        }

        return msg;
    }

    return Object.freeze({
        draw
    });
}

module.exports = initializeDrawer();