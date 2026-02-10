import { Injectable } from '@nestjs/common';
import { Room, Message, User } from './chat.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class ChatService {
    private rooms = new Map<string, Room>();
    private users = new Map<string, User>();

    // User management
    addUser(socketId: string, index: number, username?: string): User {
        const user: User = { socketId, index, username };
        this.users.set(socketId, user);
        return user;
    }

    removeUser(socketId: string): void {
        this.users.delete(socketId);

        // Remove user from all rooms
        this.rooms.forEach((room) => {
            room.participants = room.participants.filter(
                (p) => p.socketId !== socketId,
            );
        });
    }

    getUser(socketId: string): User | undefined {
        return this.users.get(socketId);
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    // Room management
    createRoom(fromSocketId: string, toSocketId?: string, meta?: any): Room {
        const roomId = randomUUID();
        const fromUser = this.users.get(fromSocketId);

        const participants: User[] = fromUser ? [fromUser] : [];

        if (toSocketId) {
            const toUser = this.users.get(toSocketId);
            if (toUser) {
                participants.push(toUser);
            }
        }

        const room: Room = {
            roomId,
            participants,
            messages: [],
            createdAt: new Date(),
            createdBy: fromSocketId,
            meta,
        };

        this.rooms.set(roomId, room);
        return room;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    getAllRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    getRoomsByUser(socketId: string): Room[] {
        return Array.from(this.rooms.values()).filter((room) =>
            room.participants.some((p) => p.socketId === socketId),
        );
    }

    deleteRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    addParticipantToRoom(roomId: string, socketId: string): boolean {
        const room = this.rooms.get(roomId);
        const user = this.users.get(socketId);

        if (!room || !user) return false;

        // Check if user is already in room
        if (room.participants.some((p) => p.socketId === socketId)) {
            return false;
        }

        room.participants.push(user);
        return true;
    }

    removeParticipantFromRoom(roomId: string, socketId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) return false;

        const initialLength = room.participants.length;
        room.participants = room.participants.filter(
            (p) => p.socketId !== socketId,
        );

        return room.participants.length < initialLength;
    }

    // Message management
    addMessage(
        roomId: string,
        fromSocketId: string,
        content: string,
        type: 'text' | 'system' = 'text',
    ): Message | null {
        const room = this.rooms.get(roomId);
        const user = this.users.get(fromSocketId);

        if (!room || !user) return null;

        const message: Message = {
            id: randomUUID(),
            roomId,
            from: user,
            content,
            timestamp: new Date(),
            type,
        };

        room.messages.push(message);
        return message;
    }

    getMessages(roomId: string, limit?: number): Message[] {
        const room = this.rooms.get(roomId);
        if (!room) return [];

        const messages = room.messages;

        if (limit && limit > 0) {
            return messages.slice(-limit);
        }

        return messages;
    }

    getRoomParticipants(roomId: string): User[] {
        const room = this.rooms.get(roomId);
        return room ? room.participants : [];
    }
}
