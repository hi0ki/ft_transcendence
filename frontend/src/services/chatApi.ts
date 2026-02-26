// Use environment variable if set, otherwise use window.location.origin for production
// This ensures the frontend connects through nginx reverse proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

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

class ChatAPI {
    // Get all online users
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/chat/users`);
        return response.json();
    }

    // Get all rooms
    async getAllRooms(): Promise<Room[]> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms`);
        return response.json();
    }

    // Get rooms for a specific user
    async getUserRooms(socketId: string): Promise<Room[]> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/user/${socketId}`);
        return response.json();
    }

    // Get specific room
    async getRoom(roomId: string): Promise<Room> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`);
        return response.json();
    }

    // Get room participants
    async getRoomParticipants(roomId: string): Promise<User[]> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/participants`);
        return response.json();
    }

    // Get messages for a room
    async getMessages(roomId: string, limit?: number): Promise<Message[]> {
        const url = limit
            ? `${API_BASE_URL}/chat/messages/${roomId}?limit=${limit}`
            : `${API_BASE_URL}/chat/messages/${roomId}`;
        const response = await fetch(url);
        return response.json();
    }

    // Create a new room
    async createRoom(from: string, to?: string, meta?: any): Promise<Room> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to, meta }),
        });
        return response.json();
    }

    // Send a message via REST
    async sendMessage(roomId: string, message: string): Promise<Message> {
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId, message }),
        });
        return response.json();
    }

    // Delete a room
    async deleteRoom(roomId: string): Promise<{ success: boolean; roomId: string }> {
        const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
            method: 'DELETE',
        });
        return response.json();
    }
}

export const chatAPI = new ChatAPI();
