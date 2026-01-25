import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';
@WebSocketGateway(80, {namespace: 'chat'})

export class ChatGateway{
    @WebSocketServer()
    server: Server;
    @SubscribeMessage('message')//mot message liee au handleSubmitNewMessage in chat-socket.js n src_client
    handleMessage(@MessageBody() message: string): void{
        this.server.emit('message', message);
    }

}