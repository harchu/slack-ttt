/*jslint node: true */

function run() {
    'use strict';

    const slackutil = require('../lib/slackutil');

    slackutil.authenticateToken(function (error, info) {
        console.log(error);
        console.log(info);
    });

    slackutil.isValidUser("harchu", "C2AUJ75C0", function (error, info) {
        console.log("done");
        console.log(error);
        console.log(info);
    });
}

run();