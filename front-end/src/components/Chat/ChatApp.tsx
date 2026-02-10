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

    // Use ref to access latest currentUser in event handlers
    const currentUserRef = useRef(currentUser);
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        // Connect to socket
        const connectSocket = async () => {
            try {
                const userData = await socketService.connect();
                setCurrentUser(userData);
                setConnected(true);

                // Load initial data
                await loadRooms(userData.socketId);
                setLoading(false);
            } catch (error) {
                console.error('Failed to connect:', error);
                setLoading(false);
            }
        };

        connectSocket();

        // Set up event listeners
        socketService.onUserList((userList: User[]) => {
            console.log('User list updated:', userList);
            setUsers(userList);
        });

        socketService.onRoomCreated(async (data) => {
            console.log('Room created event received:', data);

            // Reload rooms to get the new room
            if (currentUserRef.current) {
                const userRooms = await chatAPI.getUserRooms(currentUserRef.current.socketId);

                // Load messages for each room
                const roomsWithMessages = await Promise.all(
                    userRooms.map(async (room) => {
                        const messages = await chatAPI.getMessages(room.roomId);
                        return { ...room, messages };
                    })
                );

                setRooms(roomsWithMessages);

                // Automatically open the newly created room
                const newRoom = roomsWithMessages.find(r => r.roomId === data.roomId);
                if (newRoom) {
                    console.log('Opening newly created room:', newRoom);
                    setActiveRoom(newRoom);
                }
            }
        });

        socketService.onRoomMessage((message: Message) => {
            console.log('Message received:', message);

            // Update rooms with new message
            setRooms((prevRooms) => {
                return prevRooms.map((room) => {
                    if (room.roomId === message.roomId) {
                        return {
                            ...room,
                            messages: [...room.messages, message],
                        };
                    }
                    return room;
                });
            });

            // Update active room if it's the current one
            setActiveRoom((prev) => {
                if (!prev || prev.roomId !== message.roomId) return prev;
                return {
                    ...prev,
                    messages: [...prev.messages, message],
                };
            });
        });

        socketService.onRoomDeleted((data) => {
            setRooms((prevRooms) => prevRooms.filter((r) => r.roomId !== data.roomId));
            if (activeRoom?.roomId === data.roomId) {
                setActiveRoom(null);
            }
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    const loadRooms = async (socketId: string) => {
        try {
            const userRooms = await chatAPI.getUserRooms(socketId);

            // Load messages for each room
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
        if (!currentUser) {
            console.error('No current user');
            return;
        }

        console.log('User clicked:', user);

        // Check if room already exists with this user
        const existingRoom = rooms.find((room) =>
            room.participants.some((p) => p.socketId === user.socketId)
        );

        if (existingRoom) {
            console.log('Opening existing room:', existingRoom);
            setActiveRoom(existingRoom);
            return;
        }

        // Create new room via WebSocket
        console.log('Creating new room with user:', user.socketId);
        socketService.createRoom(user.socketId);
        // The room will be added and opened via the onRoomCreated event
    };

    const handleRoomClick = async (room: Room) => {
        try {
            // Load fresh messages
            const messages = await chatAPI.getMessages(room.roomId);
            const updatedRoom = { ...room, messages };
            setActiveRoom(updatedRoom);
        } catch (error) {
            console.error('Failed to load room:', error);
        }
    };

    const handleSendMessage = (message: string) => {
        if (!activeRoom || !currentUser) {
            console.error('Cannot send message: no active room or current user');
            return;
        }

        console.log('Sending message:', message, 'to room:', activeRoom.roomId);
        // Send via WebSocket for real-time delivery
        socketService.sendMessage(activeRoom.roomId, message);
    };

    if (loading) {
        return (
            <div className="chat-app loading">
                <div className="loading-spinner">Connecting to chat...</div>
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="chat-app error">
                <div className="error-message">
                    Failed to connect to chat server. Please refresh the page.
                </div>
            </div>
        );
    }

    return (
        <div className="chat-app">
            <div className="chat-sidebar">
                <div className="chat-header-main">
                    <h1>Chat</h1>
                    <div className="user-badge">
                        {currentUser && `User ${currentUser.index}`}
                    </div>
                </div>

                <div className="sidebar-section">
                    <UserList
                        users={users}
                        currentUserId={currentUser?.socketId}
                        onUserClick={handleUserClick}
                    />
                </div>

                <div className="sidebar-section">
                    <ChatList
                        rooms={rooms}
                        currentUserId={currentUser?.socketId}
                        activeRoomId={activeRoom?.roomId}
                        onRoomClick={handleRoomClick}
                    />
                </div>
            </div>

            <div className="chat-main">
                {activeRoom ? (
                    <ChatRoom
                        roomId={activeRoom.roomId}
                        messages={activeRoom.messages}
                        participants={activeRoom.participants}
                        currentUserId={currentUser?.socketId}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="no-active-chat">
                        <div className="welcome-message">
                            <h2>Welcome to Chat!</h2>
                            <p>Click on a user to start chatting</p>
                            <p className="hint">💡 Open another browser tab to see multiple users</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatApp;
