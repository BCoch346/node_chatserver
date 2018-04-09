// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var PORT = process.env.PORT || 5000;

var client = require('socket.io-client');
var reactSocket = client.connect('http://localhost:3000', { reconnect: true });//connection to server B

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));



// Chatroom
var numUsers = 0;

io.on('connection', function(socket) {
    var addedUser = false;
    console.log('Client connected');

    // when the client emits 'new message', this listens and executes
    socket.on('message', function(message, user) {
        parsedUser = JSON.parse(user);
        console.log('message received: ' + message );
        // we tell the client to execute 'new message'
        console.log('user: ' + parsedUser);
        author = parsedUser.first_name + " " + parsedUser.last_name;
        console.log('author: ' + author);        
        response = JSON.stringify({message: message, user: user, author: author}, null, 3);
        console.log('response: ' + response);        
        console.log('connected clients: ' + io.sockets.clients());
        io.emit('server message', response);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('login', function(username) {
        console.log('login called');
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        //socket.emit('login', {
        //    numUsers: numUsers,
        //    username: socket.username,
        //    message: "login successful"
        //});
        // echo globally (all clients) that a person has connected
        console.log('emiting success: ' + socket.username);

        socket.broadcast.emit('login', {
            username: socket.username,
            numUsers: numUsers, 
            message: ''
        });
    });

    // when the client emits 'typing', we broadcast it to others
    console.log("broadcasting login");
    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('logout', function() {
        console.log("broadcasting logout");
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('logout', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});