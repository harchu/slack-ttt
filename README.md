Slack Tic-Tac-Toe
=================

This web server responds to HTTP POST requests for the Slack slash command /ttt to play tic-tac-toe within a channel!

Requirements
============

- node.js + express
- mongodb

Getting Started
===============

From your project directory, run (see below for requirements):

```
$ npm install
```

The project supports different configurations for "development" (development.js) and "production" (production.js) based on the NODE_ENV environment variable. Create a .env file to define the environment variables. A sample .env file is available in the repo. This file should be in the application root directory. Also change config/development.js file if necessary to change mongodb url etc. Currently the project is configured with the default mongodb url.

To start the web server:

```
$ npm start
```

Send POST requests to http://localhost:3000 to test.

Usage
=====

Run the below commands in a slack channel.

**Starting a new game**

To start a new game, run the following command:

```
$ /ttt start @username
```

Users can create a new game in an Slack channel by challenging another user (using their @username). At a time, only one game can be played in a channel.

**Playing the game**

To make a move in a game in the current channel, run the following command:

```
$ /ttt play index
```

where index is a number uniquely identifying a tic-tac-toe grid cell.

Only the user whose turn it is can make the next move.

**Getting status of a game**

To get the status of a game in the current channel, run the following command:

```
$ /ttt status
```

Anyone in the channel can run a command to display the current board and list whose turn it is.

**Getting history of moves in a game**

To get the history of an ongoing game in the current channel, run the following command:

```
$ /ttt history
```

Anyone in the channel can run a command to display the history, current board and list whose turn it is.

**End the game**

To end a game in the current channel, run the following command:

```
$ /ttt end
```

Any of the two players involved can end an ongoing game at any time.

**Help!!!**

To learn how to use this command, run the following command:

```
$ /ttt help
```

This command will display usage of the /ttt command.

License
=======

MIT License

Copyright (c) 2016 Rohit Harchandani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.