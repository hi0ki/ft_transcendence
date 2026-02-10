import { io, Socket } from 'socket.io-client';
import type { Message, User } from './chatApi';

// Use environment variable if set, otherwise use window.location.origin for production
// This ensures the frontend connects through nginx reverse proxy
const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect(): Promise<{ socketId: string; index: number }> {
        return new Promise((resolve) => {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('welcome', (data: { socketId: string; index: number }) => {
                console.log('Welcome received:', data);
                resolve(data);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('error', (error: any) => {
                console.error('Socket error:', error);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocketId(): string | undefined {
        return this.socket?.id;
    }

    // Event listeners
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);

        if (this.socket) {
            this.socket.on(event, (...args: any[]) => callback(...args));
        }
    }

    off(event: string, callback?: Function) {
        if (callback) {
            const listeners = this.listeners.get(event) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        } else {
            this.listeners.delete(event);
        }

        if (this.socket) {
            this.socket.off(event);
        }
    }

    // Emit events
    emit(event: string, data?: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    // Room operations
    createRoom(to: string, meta?: any) {
        this.emit('create_room', { to, meta });
    }

    joinRoom(roomId: string) {
        this.emit('join_room', { roomId });
    }

    leaveRoom(roomId: string) {
        this.emit('leave_room', { roomId });
    }

    sendMessage(roomId: string, message: string) {
        this.emit('room_message', { roomId, message });
    }

    // Listeners for specific events
    onUserList(callback: (users: User[]) => void) {
        this.on('user_list', callback);
    }

    onRoomCreated(callback: (data: { roomId: string; participants: User[]; createdBy: string; meta?: any }) => void) {
        this.on('room_created', callback);
    }

    onRoomMessage(callback: (message: Message) => void) {
        this.on('room_message', callback);
    }

    onJoinedRoom(callback: (data: { roomId: string }) => void) {
        this.on('joined_room', callback);
    }

    onLeftRoom(callback: (data: { roomId: string }) => void) {
        this.on('left_room', callback);
    }

    onUserJoined(callback: (data: { roomId: string; user: User }) => void) {
        this.on('user_joined', callback);
    }

    onUserLeft(callback: (data: { roomId: string; user: User }) => void) {
        this.on('user_left', callback);
    }

    onRoomDeleted(callback: (data: { roomId: string }) => void) {
        this.on('room_deleted', callback);
    }
}

export const socketService = new SocketService();
