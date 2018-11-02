"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
/*
Connect server main class
*/
var ChatServer = /** @class */ (function () {
    function ChatServer() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    //setter instance
    ChatServer.prototype.createApp = function () {
        this.app = express();
    };
    ChatServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    //setter of port to use
    ChatServer.prototype.config = function () {
        this.port = process.env.PORT || ChatServer.PORT;
    };
    //setter comunication
    ChatServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    //listen activities in the server events
    ChatServer.prototype.listen = function () {
        var _this = this;
        //when the server is ON and listening
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        //client connect to a specific room/ handle specific connections
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            // once a client has connected, 
            //we expect to get a ping from them saying what room they want to join
            socket.on('created', function (room) {
                socket.join(room);
                this.room = room;
                console.log('Room created', this.room);
            });
            //message send management
            socket.on('room', function (m) {
                //put message object into json object and send it
                console.log('[server](message): %s', JSON.stringify(m));
                //send message to specific room 
                //       this.io.emit('message', m);
                socket.in(_this.room).emit('message', m);
            });
            //****** */notify   ***     the tech client is waiting
            socket.on('notify', function (data) {
                console.log('(notify):%s', JSON.stringify(data));
                //    this.io.emit('notify', data);
                socket.in(_this.room).emit('notify', data);
            });
            socket.on('disconnect', function () {
                console.log('Client disconnected');
            });
        });
    };
    //get the entiti
    ChatServer.prototype.getApp = function () {
        return this.app;
    };
    //port that the chat will handle
    ChatServer.PORT = 8080;
    return ChatServer;
}());
exports.ChatServer = ChatServer;
