/*jslint node: true */

/**
 * @brief This function sets up the Slack related utility functions.
 *
 * @return object Slack utility object containing the following methods:
 *                - checkPostBody
 *                - createResponse
 *                - verifyCommandToken,
 *                - authenticateToken,
 *                - isValidUser
 */
function initializeSlackUtil() {
    'use strict';

    const WebClient = require('@slack/client').WebClient;

    // Access application config.
    const config = require('../config');
    // Access application constants.
    const constants = require('../lib/constants');
    // Access bunyan logger.
    const logger = require('./logger.js').create();

    // Create a Slack web client using the API token
    let webClient = new WebClient(config.slack.SLACK_API_TOKEN);

    /**
     * @brief Middeware function to validate the POST request body. This
     *        function checks if Slack is sending all the required properties
     *        for the /ttt slash command. An error is sent if it is invalid.
     *
     * @param req express http request object
     * @param res express http response object
     * @param next express middleware next function
     *
     * @return none
     */
    function checkPostBody(req, res, next) {
        if (req.method !== "POST") {
            next();
        }

        let body = req.body;

        logger.trace({requestBody: req.body}, "Checking POST body.");

        // Check if body is available.
        if (body === undefined || body === null) {
            return res.status(400).end("Incorrect Post Body!");
        }

        // Check if the body properties are available.
        if (
            body.channel_id === undefined
                || body.channel_name === undefined
                || body.team_id === undefined
                || body.user_name === undefined
                || body.user_id === undefined
                || body.text === undefined
                || body.token === undefined
                || body.command === undefined
                || body.command !== "/" + constants.comandName
        ) {
            return res.status(400).end("Incorrect Post Body!");
        }

        next();
    }


    /**
     * @brief
     *
     * @param response
     *
     * @return object
     */
    function createResponse(response) {
        if (response.response_type === undefined) {
            response.response_type = "in_channel";
        }

        return response;
    }


    /**
     * @brief Middeware function to verify the /ttt command token. This
     *        function checks if Slack is sending the correct token for the
     *        /ttt slash command. An error is sent if it is invalid.
     *
     * @param req express http request object
     * @param res express http response object
     * @param next express middleware next function
     *
     * @return none
     */
    function verifyCommandToken(req, res, next) {
        if (req.method !== "POST") {
            next();
        }
        let token = req.body.token;
        if (token !== config.slack.TTT_COMMAND_TOKEN) {
            return res.status(400).end("Incorrect Token!");
        }

        next();
    }


    /**
     * @brief This function authenticates the Slack API token using the
     *        web auth.test function. This is done only once when the
     *        application starts up.
     *
     * @param callback function invoked when authentication is complete:
     *                 function cb(error, authInfo)
     *
     * @return none
     */
    function authenticateToken(callback) {
        // Use the Slack web client to invoke the auth.test method.
        webClient.auth.test(function (authError, info) {
            if (authError !== undefined && authError !== null) {
                // auth.test API error
                return callback(authError);
            }

            if (info === undefined || info === null || info.ok !== true) {
                // auth.test failed to authenticate the API token.
                return callback(
                    new Error("Error processing token auth request:"),
                    info
                );
            }

            // auth.test succeeded with ok = "true".
            return callback(undefined, info);
        });
    }


    /**
     * @brief This function checks if the given user is valid with respect to
     *        the current team and channel.
     *
     * @param userName name of the user to be validated
     * @param channel id of the channel for which the user has to be validated
     * @param callback function invoked when validation is complete:
     *                 function cb(error, userId)
     *
     * @return none
     */
    function isValidUser(userName, channel, callback) {
        // Get list of users in the current team.
        webClient.users.list(function (userListError, userListInfo) {

            if (userListError !== undefined && userListError !== null) {
                // users.list API error.
                return callback(userListError);
            }

            if (
                userListInfo === undefined
                    || userListInfo === null
                    || userListInfo.ok !== true
            ) {
                // users.list response object unavailable.
                return callback(
                    new Error("Error processing token auth request:")
                );
            }

            if (userListInfo.members === undefined) {
                // No members in the current team.
                return callback();
            }

            let foundUser = false;

            // Find the user to be validated in the list using the user name.
            userListInfo.members.every(function (member) {

                if (member.name === userName) {
                    // User found in the user list.
                    foundUser = true;

                    // Get list of users in the current channel.
                    webClient.channels.info(
                        channel,
                        function (channelInfoError, channelInfo) {

                            if (channelInfoError !== undefined
                                    && channelInfoError !== null) {
                                // channels.info API error.
                                return callback(channelInfoError);
                            }

                            if (channelInfo === undefined
                                    || channelInfo === null) {
                                return callback(
                                    new Error("Error processing channels.info")
                                );
                            }
                            
                            if (channelInfo.ok !== true) {
                                // channel info response unavailable.
                                return callback(
                                    new Error(channelInfo)
                                );
                            }

                            if (
                                channelInfo.channel === undefined
                                    || channelInfo.channel === null
                                    || channelInfo.channel.members
                                    === undefined
                                    || channelInfo.channel.members
                                    === null
                            ) {
                                // No members in the current channel.
                                return callback();
                            }

                            let members = channelInfo.channel.members;
                            if (members.indexOf(member.id) >= 0) {
                                /* User id of user to be validated is in
                                 * the channel's list of users.
                                 */
                                return callback(undefined, member.id);
                            }

                            // User is invalid.
                            return callback();
                        }
                    );

                    return false;
                }

                return true;
            });

            if (foundUser === false) {
                return callback();
            }
        });
    }


    /**
     * @brief This function returns the user in a format to allow the user to
     *        be displayed with a link.
     *
     * @param user object containing user id and name
     *
     * @return none
     */
    function getUserDisplay(user) {
        return "<@" + user.id + "|" + user.name + ">";
    }

    return Object.freeze({
        checkPostBody,
        createResponse,
        verifyCommandToken,
        authenticateToken,
        isValidUser,
        getUserDisplay
    });
}

// Call above function to export the Slack util object.
module.exports = initializeSlackUtil();