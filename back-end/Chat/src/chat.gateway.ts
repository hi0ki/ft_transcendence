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


import { 
  MessageBody, 
  SubscribeMessage, 
  WebSocketGateway, 
  WebSocketServer,
  ConnectedSocket 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { data: string },
    @ConnectedSocket() client: Socket
  ): void {
    // Broadcast message to all connected clients
    this.server.emit('message', data);
  }
}


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