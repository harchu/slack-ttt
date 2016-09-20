/*jslint node: true */

function run() {
    'use strict';

    const drawer = require('../lib/drawer');

    let board1 = [0, 0, 0, 1, 0, 2, 0, 0, 0];
    console.log(drawer.draw(board1));

    let board2 = [2, 0, 1, 2, 1, 0, 1, 0, 0];
    console.log(drawer.draw(board2, {status: true, diagonal: -1}));
}

run();