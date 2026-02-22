import { io, Socket } from 'socket.io-client';
import type { DBMessage } from './chatApi';

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect(): Promise<{ socketId: string; userId: number; email: string; username?: string }> {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                reject(new Error('No auth token found'));
                return;
            }

            // Timeout: resolve even if welcome isn't received
            const timeout = setTimeout(() => {
                console.warn('Socket: welcome event timed out, but socket may still be connected');
                if (this.socket?.connected) {
                    resolve({ socketId: this.socket.id || '', userId: 0, email: '', username: '' });
                } else {
                    reject(new Error('Socket connection timed out'));
                }
            }, 5000);

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
                auth: { token },
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('welcome', (data: { socketId: string; userId: number; email: string; username?: string }) => {
                clearTimeout(timeout);
                console.log('Welcome received:', data);
                resolve(data);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('error', (error: any) => {
                console.error('Socket error:', error);
                clearTimeout(timeout);
                reject(error);
            });

            this.socket.on('connect_error', (error: any) => {
                console.error('Socket connect_error:', error.message);
                clearTimeout(timeout);
                reject(error);
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
            if (index > -1) listeners.splice(index, 1);
        } else {
            this.listeners.delete(event);
        }
        if (this.socket) this.socket.off(event);
    }

    emit(event: string, data?: any) {
        if (this.socket) this.socket.emit(event, data);
    }

    createRoom(targetUserId: number) {
        this.emit('create_room', { targetUserId });
    }

    joinRoom(conversationId: number) {
        this.emit('join_room', { conversationId });
    }

    leaveRoom(conversationId: number) {
        this.emit('leave_room', { conversationId });
    }

    sendMessage(conversationId: number, message: string) {
        this.emit('room_message', { conversationId, message });
    }

    updateMessage(conversationId: number, messageId: number, content: string) {
        this.emit('update_message', { conversationId, messageId, content });
    }

    deleteMessage(conversationId: number, messageId: number, deleteType: string = 'FOR_ALL') {
        this.emit('delete_message', { conversationId, messageId, deleteType });
    }

    onOnlineUsers(callback: (userIds: number[]) => void) {
        this.on('online_users', callback);
    }

    onRoomCreated(callback: (data: { conversationId: number; conversation: any }) => void) {
        this.on('room_created', callback);
    }

    onRoomMessage(callback: (message: DBMessage) => void) {
        this.on('room_message', callback);
    }

    onMessageUpdated(callback: (message: DBMessage) => void) {
        this.on('message_updated', callback);
    }

    onMessageDeleted(callback: (data: { messageId: number; conversationId: number; deleteType: string }) => void) {
        this.on('message_deleted', callback);
    }

    onJoinedRoom(callback: (data: { conversationId: number }) => void) {
        this.on('joined_room', callback);
    }

    onLeftRoom(callback: (data: { conversationId: number }) => void) {
        this.on('left_room', callback);
    }
}

export const socketService = new SocketService();
