import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socketService';
import { chatAPI } from '../../services/chatApi';
import type { User, Room, Message } from '../../services/chatApi';
import UserList from './UserList';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import './Chat.css';

const ChatApp: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ socketId: string; index: number } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const currentUserRef = useRef(currentUser);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    useEffect(() => {
        const connectSocket = async () => {
            try {
                const userData = await socketService.connect();
                setCurrentUser(userData);
                setConnected(true);
                await loadRooms(userData.socketId);
                setLoading(false);
            } catch (error) {
                console.error('Failed to connect:', error);
                setLoading(false);
            }
        };

        connectSocket();

        socketService.onUserList((userList: User[]) => setUsers(userList));

        socketService.onRoomCreated(async (data) => {
            if (currentUserRef.current) {
                const userRooms = await chatAPI.getUserRooms(currentUserRef.current.socketId);
                const roomsWithMessages = await Promise.all(
                    userRooms.map(async (room) => {
                        const messages = await chatAPI.getMessages(room.roomId);
                        return { ...room, messages };
                    })
                );
                setRooms(roomsWithMessages);
                const newRoom = roomsWithMessages.find((r) => r.roomId === data.roomId);
                if (newRoom) setActiveRoom(newRoom);
            }
        });

        socketService.onRoomMessage((message: Message) => {
            setRooms((prevRooms) => prevRooms.map((room) =>
                room.roomId === message.roomId
                    ? { ...room, messages: [...room.messages, message] }
                    : room
            ));
            setActiveRoom((prev) => {
                if (!prev || prev.roomId !== message.roomId) return prev;
                return { ...prev, messages: [...prev.messages, message] };
            });
        });

        socketService.onRoomDeleted((data) => {
            setRooms((prev) => prev.filter((r) => r.roomId !== data.roomId));
            setActiveRoom((prev) => prev?.roomId === data.roomId ? null : prev);
        });

        return () => { socketService.disconnect(); };
    }, []);

    const loadRooms = async (socketId: string) => {
        try {
            const userRooms = await chatAPI.getUserRooms(socketId);
            const roomsWithMessages = await Promise.all(
                userRooms.map(async (room) => {
                    const messages = await chatAPI.getMessages(room.roomId);
                    return { ...room, messages };
                })
            );
            setRooms(roomsWithMessages);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        }
    };

    const handleUserClick = async (user: User) => {
        if (!currentUser) return;
        const existingRoom = rooms.find((room) =>
            room.participants.some((p) => p.socketId === user.socketId)
        );
        if (existingRoom) { setActiveRoom(existingRoom); return; }
        socketService.createRoom(user.socketId);
    };

    const handleRoomClick = async (room: Room) => {
        try {
            const messages = await chatAPI.getMessages(room.roomId);
            setActiveRoom({ ...room, messages });
        } catch (error) {
            console.error('Failed to load room:', error);
        }
    };

    const handleSendMessage = (message: string) => {
        if (!activeRoom || !currentUser) return;
        socketService.sendMessage(activeRoom.roomId, message);
    };

    if (loading) {
        return (
            <div className="chat-app chat-app--loading">
                <div className="chat-loading">
                    <div className="chat-loading-spinner"></div>
                    <span>Connecting to chat...</span>
                </div>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="chat-app chat-app--error">
                <div className="chat-error-box">
                    Failed to connect to chat server. Please refresh.
                </div>
            </div>
        );
    }

    return (
        <div className="chat-layout-wrapper">
            <header className="chat-global-header">
                <h1>Messages</h1>
                <p>Chat with your peers</p>
            </header>

            <div className="chat-app-container">
                {/* Left Card — Conversations */}
                <div className="chat-card chat-card--left">
                    <div className="chat-search">
                        <svg className="chat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="chat-conversations">
                        <ChatList
                            rooms={rooms}
                            currentUserId={currentUser?.socketId}
                            activeRoomId={activeRoom?.roomId}
                            onRoomClick={handleRoomClick}
                            searchQuery={searchQuery}
                        />
                        <UserList
                            users={users}
                            currentUserId={currentUser?.socketId}
                            onUserClick={handleUserClick}
                        />
                    </div>
                </div>

                {/* Right Card — Chat Area */}
                <div className="chat-card chat-card--right">
                    {activeRoom ? (
                        <ChatRoom
                            roomId={activeRoom.roomId}
                            messages={activeRoom.messages}
                            participants={activeRoom.participants}
                            currentUserId={currentUser?.socketId}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <div className="chat-empty">
                            <div className="chat-empty-content">
                                <div className="chat-empty-icon">💬</div>
                                <h2>Welcome to Messages</h2>
                                <p>Select a conversation or click on online user to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatApp;
