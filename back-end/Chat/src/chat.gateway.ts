import { WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway(80, {namespace: 'chat'})

export class ChatGateway{

}