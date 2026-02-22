import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socketService';
import { chatAPI } from '../../services/chatApi';
import { authAPI } from '../../services/authApi';
import type { DBUser, DBConversation, DBMessage } from '../../services/chatApi';
import UserList from './UserList';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import './Chat.css';

const ChatApp: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [users, setUsers] = useState<DBUser[]>([]);
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
    const [conversations, setConversations] = useState<DBConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<DBConversation | null>(null);
    const [activeMessages, setActiveMessages] = useState<DBMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const currentUserIdRef = useRef(currentUserId);
    const activeConversationRef = useRef(activeConversation);

    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
    useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);

    useEffect(() => {
        const authUser = authAPI.getCurrentUser();
        if (!authUser) {
            console.error('No auth user found - not logged in');
            setLoading(false);
            return;
        }
        setCurrentUserId(authUser.id);

        const loadData = async () => {
            try {
                const allUsers = await chatAPI.getUsers();
                setUsers(allUsers);
            } catch (error) {
                console.error('Failed to load users:', error);
            }

            try {
                const userConversations = await chatAPI.getUserConversations(authUser.id);
                setConversations(userConversations);
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }

            setLoading(false);
        };

        loadData();

        const connectSocket = async () => {
            try {
                const socketData = await socketService.connect();
                setConnected(true);
                console.log('Socket connected as:', socketData);
            } catch (error) {
                console.warn('Socket connection failed, using REST fallback:', error);
            }
        };

        connectSocket();

        socketService.onOnlineUsers((userIds: number[]) => {
            setOnlineUserIds(userIds);
        });

        socketService.onRoomCreated(async (data) => {
            const userId = currentUserIdRef.current;
            if (userId) {
                const updatedConversations = await chatAPI.getUserConversations(userId);
                setConversations(updatedConversations);
                const newConv = updatedConversations.find(c => c.id === data.conversationId);
                if (newConv) {
                    setActiveConversation(newConv);
                    const messages = await chatAPI.getConversationMessages(newConv.id);
                    setActiveMessages(messages);
                    socketService.joinRoom(newConv.id);
                }
            }
        });

        socketService.onRoomMessage((message: DBMessage) => {
            if (activeConversationRef.current?.id === message.conversationId) {
                setActiveMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }
            // Update conversation list with the new last message
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === message.conversationId ? { ...conv, lastMessage: message } : conv
                ).sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.createdAt || a.createdAt).getTime();
                    const timeB = new Date(b.lastMessage?.createdAt || b.createdAt).getTime();
                    return timeB - timeA;
                })
            );
        });

        socketService.onMessageUpdated((message: DBMessage) => {
            if (activeConversationRef.current?.id === message.conversationId) {
                setActiveMessages(prev => prev.map(m => m.id === message.id ? message : m));
            }
            // Update last message in sidebar if needed
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === message.conversationId && conv.lastMessage?.id === message.id
                        ? { ...conv, lastMessage: message }
                        : conv
                )
            );
        });

        socketService.onMessageDeleted((data: { messageId: number; conversationId: number; deleteType: string }) => {
            if (activeConversationRef.current?.id === data.conversationId) {
                setActiveMessages(prev => prev.filter(m => m.id !== data.messageId));
            }
            // Update sidebar (clear last message if it was the deleted one)
            if (data.deleteType === 'FOR_ALL') {
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === data.conversationId && conv.lastMessage?.id === data.messageId
                            ? { ...conv, lastMessage: null }
                            : conv
                    )
                );
            }
        });

        return () => { socketService.disconnect(); };
    }, []);

    const handleUserClick = async (user: DBUser) => {
        if (!currentUserId) return;
        const existingConv = conversations.find(conv =>
            conv.user1.id === user.id || conv.user2.id === user.id
        );
        if (existingConv) {
            setActiveConversation(existingConv);
            const messages = await chatAPI.getConversationMessages(existingConv.id, currentUserId);
            setActiveMessages(messages);
            if (connected) socketService.joinRoom(existingConv.id);
            return;
        }

        if (connected) {
            socketService.createRoom(user.id);
        } else {
            try {
                const conv = await chatAPI.findOrCreateConversation(currentUserId, user.id);
                setConversations(prev => {
                    const exists = prev.some(c => c.id === conv.id);
                    if (exists) return prev;
                    return [conv, ...prev];
                });
                setActiveConversation(conv);
                const messages = await chatAPI.getConversationMessages(conv.id, currentUserId);
                setActiveMessages(messages);
            } catch (error) {
                console.error('Failed to create conversation via REST:', error);
            }
        }
    };

    const handleConversationClick = async (conversation: DBConversation) => {
        setActiveConversation(conversation);
        const messages = await chatAPI.getConversationMessages(conversation.id, currentUserId || undefined);
        setActiveMessages(messages);
        if (connected) socketService.joinRoom(conversation.id);
    };

    const handleSendMessage = async (message: string) => {
        if (!activeConversation || !currentUserId) return;
        if (connected) {
            socketService.sendMessage(activeConversation.id, message);
        } else {
            try {
                const savedMsg = await chatAPI.sendMessage(activeConversation.id, currentUserId, message);
                setActiveMessages(prev => [...prev, savedMsg]);
                setConversations(prev => prev.map(c =>
                    c.id === activeConversation.id ? { ...c, lastMessage: savedMsg } : c
                ));
            } catch (error) {
                console.error('Failed to send message via REST:', error);
            }
        }
    };

    const handleUpdateMessage = async (messageId: number, content: string) => {
        if (!activeConversation) return;
        if (connected) {
            socketService.updateMessage(activeConversation.id, messageId, content);
        } else {
            try {
                const updatedMsg = await chatAPI.updateMessage(messageId, currentUserId!, content);
                setActiveMessages(prev => prev.map(m => m.id === messageId ? updatedMsg : m));
            } catch (error) {
                console.error('Failed to update message via REST:', error);
            }
        }
    };

    const handleDeleteMessage = async (messageId: number, deleteType: 'FOR_ME' | 'FOR_ALL' = 'FOR_ALL') => {
        if (!activeConversation) return;
        if (connected) {
            socketService.deleteMessage(activeConversation.id, messageId, deleteType);
        } else {
            try {
                await chatAPI.deleteMessage(messageId, currentUserId!, deleteType);
                setActiveMessages(prev => prev.filter(m => m.id !== messageId));
            } catch (error) {
                console.error('Failed to delete message via REST:', error);
            }
        }
    };

    // Filtered lists
    const filteredUsers = users.filter(u =>
        u.id !== currentUserId &&
        (u.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredConversations = conversations.filter(conv => {
        const other = conv.user1.id === currentUserId ? conv.user2 : conv.user1;
        const name = other.profile?.username || other.email;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="chat-layout-wrapper">
                <div className="chat-global-header">
                    <h1>Messages</h1>
                    <p>Loading your chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-layout-wrapper">
            <div className="chat-global-header">
                <h1>Messages</h1>
                <p>Chat with your peers</p>
            </div>

            <div className="chat-app-container">
                <div className="chat-card chat-card--left">
                    <div className="chat-search">
                        <span className="chat-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="chat-conversations">
                        {/* 
                            Show search results for both users and conversations.
                            If not searching, prioritize conversations.
                        */}
                        {searchQuery && filteredUsers.length > 0 && (
                            <UserList
                                users={filteredUsers}
                                currentUserId={currentUserId}
                                onlineUserIds={onlineUserIds}
                                onUserClick={handleUserClick}
                            />
                        )}

                        <ChatList
                            conversations={filteredConversations}
                            currentUserId={currentUserId}
                            onlineUserIds={onlineUserIds}
                            activeConversationId={activeConversation?.id}
                            onConversationClick={handleConversationClick}
                        />
                    </div>
                </div>

                <div className="chat-card chat-card--right">
                    {activeConversation ? (
                        <ChatRoom
                            conversation={activeConversation}
                            messages={activeMessages}
                            currentUserId={currentUserId}
                            onSendMessage={handleSendMessage}
                            onUpdateMessage={handleUpdateMessage}
                            onDeleteMessage={handleDeleteMessage}
                        />
                    ) : (
                        <div className="chat-empty">
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Select a conversation</p>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>or click on a user to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatApp;
