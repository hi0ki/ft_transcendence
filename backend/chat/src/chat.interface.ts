export interface User {
    socketId: string;
    index: number;
    username?: string;
}

export interface Message {
    id: string;
    roomId: string;
    from: User;
    content: string;
    timestamp: Date;
    type: 'text' | 'system';
}

export interface Room {
    roomId: string;
    participants: User[];
    messages: Message[];
    createdAt: Date;
    createdBy: string;
    meta?: any;
}

export interface CreateRoomDto {
    to: string;
    meta?: any;
}

export interface SendMessageDto {
    roomId: string;
    message: string;
}
