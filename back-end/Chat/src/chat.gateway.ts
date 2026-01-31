// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { Server } from 'socket.io';
// @WebSocketGateway(80, {namespace: 'chat'})

// export class ChatGateway{
//     @WebSocketServer()
//     server: Server;
//     @SubscribeMessage('message')//mot message liee au handleSubmitNewMessage in chat-socket.js n src_client
//     handleMessage(@MessageBody() message: string): void{
//         this.server.emit('message', message);
//     }  
// }

/////####################################### global chat gateway with CORS configuration ########################################
// import { 
//   MessageBody, 
//   SubscribeMessage, 
//   WebSocketGateway, 
//   WebSocketServer,
//   ConnectedSocket 
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:3001',
//     credentials: true,
//   },
// })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('message')
//   handleMessage(
//     @MessageBody() data: { data: string },
//     @ConnectedSocket() client: Socket
//   ): void {
//     // Broadcast message to all connected clients
//     this.server.emit('message', data);
//   }
// }






// import { 
//   MessageBody, 
//   SubscribeMessage, 
//   WebSocketGateway, 
//   WebSocketServer,
//   ConnectedSocket 
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:5173',
//     credentials: true
//   }
// })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('message')
//   handleMessage(
//     @MessageBody() data: { data: string },
//     @ConnectedSocket() client: Socket
//   ): void {
//     // Émettre à tous les clients
//     this.server.emit('message', data);
//   }
// }

// import { 
//   MessageBody, 
//   SubscribeMessage, 
//   WebSocketGateway, 
//   WebSocketServer,
//   ConnectedSocket 
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:5173',
//     credentials: true
//   }
// })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('message')
//   handleMessage(
//     @MessageBody() data: { data: string },
//     @ConnectedSocket() client: Socket
//   ): void {
//     // Broadcast to all clients
//     this.server.emit('message', data);
//   }
// }



////// ###################################### single chat room gateway without CORS configuration ########################################


import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private nextIndex = 1; // assign simple incrementing index
  private users = new Map<string, number>(); // socketId -> index

  handleConnection(client: Socket) {
    const index = this.nextIndex++;
    this.users.set(client.id, index);
    client.emit('welcome', { socketId: client.id, index });
    this.broadcastUserList();
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.broadcastUserList();
  }

  private broadcastUserList() {
    const list = Array.from(this.users.entries()).map(([socketId, index]) => ({ socketId, index }));
    this.server.emit('user_list', list);
  }

  // Create a server-generated room and join both participants (if online)
  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @MessageBody() payload: { to: string; meta?: any },
    @ConnectedSocket() client: Socket
  ) {
    const roomId = randomUUID();
    await client.join(roomId);

    const participants = [{ socketId: client.id, index: this.users.get(client.id) }];

    const target = this.server.sockets.sockets.get(payload.to);
    if (target) {
      await target.join(roomId);
      participants.push({ socketId: target.id, index: this.users.get(target.id) });
      target.emit('room_created', { roomId, participants, createdBy: client.id, meta: payload.meta });
    }

    client.emit('room_created', { roomId, participants, createdBy: client.id, meta: payload.meta });
  }

  // Optionally let a client join an existing room by room id
  @SubscribeMessage('join_room')
  async handleJoinRoom(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    await client.join(payload.roomId);
    client.emit('joined_room', { roomId: payload.roomId });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(@MessageBody() payload: { roomId: string }, @ConnectedSocket() client: Socket) {
    await client.leave(payload.roomId);
    client.emit('left_room', { roomId: payload.roomId });
  }

  // Send message to a room (only sockets that joined that room receive it)
  @SubscribeMessage('room_message')
  handleRoomMessage(
    @MessageBody() payload: { roomId: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    const fromIndex = this.users.get(client.id);
    this.server
      .to(payload.roomId)
      .emit('room_message', { roomId: payload.roomId, from: { socketId: client.id, index: fromIndex }, message: payload.message });
  }
}