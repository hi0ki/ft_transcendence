import { Injectable } from '@nestjs/common';
import { User, Room, Message } from './chat.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
    private users: Map<string, User> = new Map();
    private rooms: Map<string, Room> = new Map();
    private userIndex = 0;

    // User management
    addUser(socketId: string): User {
        this.userIndex++;
        const user: User = {
            socketId,
            index: this.userIndex,
        };
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
            // Delete room if empty
            if (room.participants.length === 0) {
                this.rooms.delete(room.roomId);
            }
        });
    }

    getUser(socketId: string): User | undefined {
        return this.users.get(socketId);
    }

    getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    // Room management
    createRoom(from: string, to: string, meta?: any): Room {
        const roomId = uuidv4();
        const fromUser = this.users.get(from);
        const toUser = this.users.get(to);

        if (!fromUser || !toUser) {
            throw new Error('User not found');
        }

        const room: Room = {
            roomId,
            participants: [fromUser, toUser],
            messages: [],
            createdAt: new Date(),
            createdBy: from,
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

    getUserRooms(socketId: string): Room[] {
        return Array.from(this.rooms.values()).filter((room) =>
            room.participants.some((p) => p.socketId === socketId),
        );
    }

    deleteRoom(roomId: string): boolean {
        return this.rooms.delete(roomId);
    }

    // Message management
    addMessage(roomId: string, from: string, content: string): Message {
        const room = this.rooms.get(roomId);
        const user = this.users.get(from);

        if (!room || !user) {
            throw new Error('Room or user not found');
        }

        const message: Message = {
            id: uuidv4(),
            roomId,
            from: user,
            content,
            timestamp: new Date(),
            type: 'text',
        };

        room.messages.push(message);
        return message;
    }

    getMessages(roomId: string, limit?: number): Message[] {
        const room = this.rooms.get(roomId);
        if (!room) {
            return [];
        }

        const messages = room.messages;
        if (limit) {
            return messages.slice(-limit);
        }
        return messages;
    }
}
