import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Message } from './models/message.model';
import { Notify } from './models/notify.model';

/*
Connect server main class
*/
export class ChatServer {

    //port that the chat will handle
    public static readonly PORT:number = 8080;
    
    //represent the whole app
    private app: express.Application;
   
    //represent the entity
    private server: Server;
  
    //comunication that will send events
    private io: SocketIO.Server;

    //room
    private room:string;

    //the port to use
    private port: string | number;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    //setter instance
    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    //setter of port to use
    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }
    
    //setter comunication
    private sockets(): void {
        this.io = socketIo(this.server);
    }

    //listen activities in the server events
    private listen(): void {

        //when the server is ON and listening
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        //client connect to a specific room/ handle specific connections
        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            
            // once a client has connected, 
            //we expect to get a ping from them saying what room they want to join
            socket.on('created', function(room) {
                
                socket.join(room);
                this.room = room;

                console.log('Room created', this.room);
            });



            //message send management
            socket.on('room', (m: Message) => {
                //put message object into json object and send it
                console.log('[server](message): %s', JSON.stringify(m));
                //send message to specific room 
         //       this.io.emit('message', m);
                socket.in(this.room).emit('message', m);
            });


            //****** */notify   ***     the tech client is waiting
            socket.on('notify', (data:Notify)=>{
                console.log('(notify):%s', JSON.stringify(data));
            //    this.io.emit('notify', data);
            socket.in(this.room).emit('notify', data);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
                
            });
        });
    }

    //get the entiti
    public getApp(): express.Application {
        return this.app;
    }
}