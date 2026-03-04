import { io, Socket } from 'socket.io-client';
import type { DBMessage } from './chatApi';

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

type OnlineUsersCallback = (userIds: number[]) => void;

class SocketService {
    private socket: Socket | null = null;

    // ── Online users: stored directly in the service ──────────────────────
    // Any component can subscribe; when server broadcasts, ALL subscribers
    // are notified in one shot — no React prop-drilling needed.
    private onlineUserIds: number[] = [];
    private onlineUsersSubscribers: Set<OnlineUsersCallback> = new Set();

    // ── Other event listener wrappers (unchanged) ─────────────────────────
    private listenerWrappers: Map<string, Map<Function, (...args: any[]) => void>> = new Map();

    // ── Public: subscribe to online users list updates ────────────────────
    subscribeOnlineUsers(cb: OnlineUsersCallback): () => void {
        this.onlineUsersSubscribers.add(cb);
        // Immediately deliver the current list so the component doesn't
        // have to wait for the next broadcast.
        cb(this.onlineUserIds);
        return () => this.onlineUsersSubscribers.delete(cb);
    }

    private notifyOnlineUsers(userIds: number[]) {
        this.onlineUserIds = userIds;
        this.onlineUsersSubscribers.forEach(cb => cb(userIds));
    }

    // ── Connection ────────────────────────────────────────────────────────
    connect(): Promise<{ socketId: string; userId: number; email: string; username?: string }> {
        if (this.socket?.connected) {
            return Promise.resolve({
                socketId: this.socket.id || '',
                userId: 0,
                email: '',
                username: '',
            });
        }

        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                reject(new Error('No auth token found'));
                return;
            }

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
                auth: { token },
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
            });

            // Replay stored app-level listeners onto new socket
            this.listenerWrappers.forEach((callbackMap, event) => {
                callbackMap.forEach((wrapper) => {
                    this.socket!.on(event, wrapper);
                });
            });

            // ── online_users is handled DIRECTLY by the service ──────────
            this.socket.on('online_users', (userIds: number[]) => {
                const numericIds = userIds.map(Number);
                this.notifyOnlineUsers(numericIds);
            });

            // Resolve the promise as soon as the TCP connection is confirmed.
            // This is deterministic — 'connect' always fires before 'welcome'.
            // Also immediately request the online list so components get fresh
            // data as early as possible.
            this.socket.on('connect', () => {
                this.socket?.emit('request_online_users');
                resolve({ socketId: this.socket?.id || '', userId: 0, email: '', username: '' });
            });

            // 'welcome' carries user info — keep logging it but don't gate on it
            this.socket.on('welcome', () => {
                // Connection successful
            });

            this.socket.on('disconnect', (reason) => {
                // Socket disconnected
            });

            this.socket.on('error', (error: any) => {
                // Socket error occurred
            });

            this.socket.on('connect_error', (error: any) => {
                reject(error);
            });

            // Safety fallback: if connect_error is never fired but we never connect
            setTimeout(() => {
                if (!this.socket?.connected) {
                    reject(new Error('Socket connection timed out'));
                }
            }, 8000);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        // Do NOT clear onlineUserIds here — keeping the last known list avoids
        // a flash of "Offline" during reconnects and brief network interruptions.
        // The list will be refreshed by the next 'online_users' broadcast.
        // Only reset on an actual logout (where the user navigates away from chat).
        this.onlineUserIds = [];
        this.onlineUsersSubscribers.forEach(cb => cb([]));
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocketId(): string | undefined {
        return this.socket?.id;
    }

    // ── Generic listener management ───────────────────────────────────────
    on(event: string, callback: Function) {
        if (!this.listenerWrappers.has(event)) {
            this.listenerWrappers.set(event, new Map());
        }
        if (this.listenerWrappers.get(event)!.has(callback)) {
            return;
        }
        const wrapper = (...args: any[]) => callback(...args);
        this.listenerWrappers.get(event)!.set(callback, wrapper);
        if (this.socket) {
            this.socket.on(event, wrapper);
        }
    }

    off(event: string, callback?: Function) {
        if (!this.listenerWrappers.has(event)) return;
        if (callback) {
            const wrapper = this.listenerWrappers.get(event)?.get(callback);
            if (wrapper) {
                this.socket?.off(event, wrapper);
                this.listenerWrappers.get(event)!.delete(callback);
            }
        } else {
            const callbackMap = this.listenerWrappers.get(event);
            callbackMap?.forEach((wrapper) => this.socket?.off(event, wrapper));
            this.listenerWrappers.delete(event);
        }
    }

    emit(event: string, data?: any) {
        if (this.socket) this.socket.emit(event, data);
    }

    heartbeat() { this.emit('heartbeat'); }
    createRoom(targetUserId: number) { this.emit('create_room', { targetUserId }); }
    joinRoom(conversationId: number) { this.emit('join_room', { conversationId }); }
    leaveRoom(conversationId: number) { this.emit('leave_room', { conversationId }); }

    sendMessage(conversationId: number, message: string, type?: string, fileUrl?: string) {
        this.emit('room_message', { conversationId, message, type: type || 'TEXT', fileUrl: fileUrl || null });
    }
    updateMessage(conversationId: number, messageId: number, content: string) {
        this.emit('update_message', { conversationId, messageId, content });
    }
    deleteMessage(conversationId: number, messageId: number, deleteType: string = 'FOR_ALL') {
        this.emit('delete_message', { conversationId, messageId, deleteType });
    }

    onRoomCreated(callback: (data: { conversationId: number; conversation: any; initiatorId?: number }) => void) {
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
