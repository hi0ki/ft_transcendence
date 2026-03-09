import React, { useState, useEffect, useRef } from 'react';
import { socketService } from '../../services/socketService';
import { chatAPI } from '../../services/chatApi';
import { authAPI } from '../../services/authApi';
import { friendsAPI } from '../../services/friendsApi';
import type { Friend } from '../../services/friendsApi';
import type { DBUser, DBConversation, DBMessage } from '../../services/chatApi';
import UserList from './UserList';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import './Chat.css';

interface ChatAppProps {}

const ChatApp: React.FC<ChatAppProps> = () => {
    const [connected, setConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [users, setUsers] = useState<DBUser[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [conversations, setConversations] = useState<DBConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<DBConversation | null>(null);
    const [activeMessages, setActiveMessages] = useState<DBMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

    const currentUserIdRef = useRef(currentUserId);
    const activeConversationRef = useRef(activeConversation);
    const conversationsRef = useRef(conversations);

    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
    useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
    useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

    useEffect(() => {
        const unsubscribe = socketService.subscribeOnlineUsers((ids) => {
            setOnlineUserIds(ids);
        });

        if (socketService.isConnected()) {
            socketService.emit('request_online_users');
        }

        const handleConnect = () => socketService.emit('request_online_users');
        socketService.on('connect', handleConnect);

        return () => {
            unsubscribe();
            socketService.off('connect', handleConnect);
        };
    }, []);

    useEffect(() => {
        const authUser = authAPI.getCurrentUser();
        if (!authUser) {
            setLoading(false);
            return;
        }
        setCurrentUserId(authUser.id);

        const loadData = async () => {
            try {
                const allUsers = await chatAPI.getUsers();
                setUsers(allUsers);
            } catch (error) {}

            try {
                const myFriends = await friendsAPI.getFriends();
                setFriends(myFriends);
            } catch (error) {}

            try {
                const userConversations = await chatAPI.getUserConversations(authUser.id);
                setConversations(userConversations);
                if (socketService.isConnected()) {
                    userConversations.forEach(conv => socketService.joinRoom(conv.id));
                }
            } catch (error) {}

            setLoading(false);
        };

        loadData();

        const handleConnect = () => {
            setConnected(true);
            conversationsRef.current.forEach(conv => socketService.joinRoom(conv.id));
        };
        const handleDisconnect = () => setConnected(false);

        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);

        if (socketService.isConnected()) {
            setConnected(true);
        }

        socketService.onRoomCreated(async (data: { conversationId: number; conversation: any; initiatorId?: number }) => {
            if (data.initiatorId === currentUserIdRef.current) {
                setActiveConversation(data.conversation);
                setActiveMessages([]);
                setSearchQuery('');
            } else {
                socketService.joinRoom(data.conversationId);
            }
        });

        socketService.onRoomMessage((message: DBMessage) => {
            if (activeConversationRef.current?.id === message.conversationId) {
                setActiveMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }
            setConversations(prev => {
                const exists = prev.some(c => c.id === message.conversationId);
                if (!exists) {
                    const activeConv = activeConversationRef.current;
                    if (activeConv && activeConv.id === message.conversationId) {
                        return [{ ...activeConv, lastMessage: message }, ...prev];
                    }
                    const userId = currentUserIdRef.current;
                    if (userId) {
                        chatAPI.getUserConversations(userId).then(convs => setConversations(convs));
                    }
                    return prev;
                }
                return prev.map(conv =>
                    conv.id === message.conversationId ? { ...conv, lastMessage: message } : conv
                ).sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.createdAt || a.createdAt).getTime();
                    const timeB = new Date(b.lastMessage?.createdAt || b.createdAt).getTime();
                    return timeB - timeA;
                });
            });
        });

        socketService.onMessageUpdated((message: DBMessage) => {
            if (activeConversationRef.current?.id === message.conversationId) {
                setActiveMessages(prev => prev.map(m => m.id === message.id ? message : m));
            }
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
            const userId = currentUserIdRef.current;
            setConversations(prev => {
                const conv = prev.find(c => c.id === data.conversationId);
                const wasLastMessage = conv?.lastMessage?.id === data.messageId;
                if (wasLastMessage && userId) {
                    chatAPI.getUserConversations(userId).then(fresh => setConversations(fresh));
                }
                return prev.map(c =>
                    c.id === data.conversationId && c.lastMessage?.id === data.messageId
                        ? { ...c, lastMessage: null }
                        : c
                );
            });
        });

        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
        };
    }, []);

    const cleanupEmptyConversation = async () => {
        const conv = activeConversationRef.current;
        if (!conv) return;
        try {
            const messageCount = await chatAPI.getConversationMessages(conv.id, currentUserIdRef.current || undefined);
            if (messageCount.length === 0) {
                await chatAPI.deleteConversation(conv.id);
                setConversations(prev => prev.filter(c => c.id !== conv.id));
                if (activeConversationRef.current?.id === conv.id) {
                    setActiveConversation(null);
                    setActiveMessages([]);
                }
            }
        } catch (e) {}
    };

    const handleUserClick = async (user: DBUser) => {
        if (!currentUserId) return;

        // ← Number() to avoid string/number mismatch from OAuth users
        const isCurrentActive = activeConversation && (
            Number(activeConversation.user1.id) === Number(user.id) ||
            Number(activeConversation.user2.id) === Number(user.id)
        );
        if (isCurrentActive) {
            setSearchQuery('');
            return;
        }

        await cleanupEmptyConversation();

        // ← Number() to avoid string/number mismatch from OAuth users
        const existingConv = conversations.find(conv =>
            Number(conv.user1.id) === Number(user.id) ||
            Number(conv.user2.id) === Number(user.id)
        );
        if (existingConv) {
            setActiveConversation(existingConv);
            const messages = await chatAPI.getConversationMessages(existingConv.id, currentUserId);
            setActiveMessages(messages);
            if (connected) socketService.joinRoom(existingConv.id);
            setSearchQuery('');
            setMobileView('chat');
            return;
        }

        // ← always use REST find-or-create instead of relying on socket alone
        try {
            const conv = await chatAPI.findOrCreateConversation(currentUserId, Number(user.id));
            setActiveConversation(conv);
            setSearchQuery('');
            const messages = await chatAPI.getConversationMessages(conv.id, currentUserId);
            setActiveMessages(messages);
            setConversations(prev => {
                const exists = prev.some(c => c.id === conv.id);
                if (!exists) return [conv, ...prev];
                return prev;
            });
            if (connected) socketService.joinRoom(conv.id);
            setMobileView('chat');
        } catch (error) {}
    };

    const handleConversationClick = async (conversation: DBConversation) => {
        if (activeConversation && activeConversation.id !== conversation.id) {
            await cleanupEmptyConversation();
        }
        setActiveConversation(conversation);
        setSearchQuery('');
        const messages = await chatAPI.getConversationMessages(conversation.id, currentUserId || undefined);
        setActiveMessages(messages);
        if (connected) socketService.joinRoom(conversation.id);
        setMobileView('chat');
    };

    const handleSendMessage = async (message: string, type?: string, fileUrl?: string) => {
        if (!activeConversation || !currentUserId) return;
        if (connected) {
            socketService.sendMessage(activeConversation.id, message, type, fileUrl);
        } else {
            try {
                const savedMsg = await chatAPI.sendMessage(activeConversation.id, currentUserId, message, type || 'TEXT', fileUrl);
                setActiveMessages(prev => [...prev, savedMsg]);
                setConversations(prev => {
                    const exists = prev.some(c => c.id === activeConversation.id);
                    if (!exists) {
                        return [{ ...activeConversation, lastMessage: savedMsg }, ...prev];
                    }
                    return prev.map(c =>
                        c.id === activeConversation.id ? { ...c, lastMessage: savedMsg } : c
                    );
                });
            } catch (error) {}
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
            } catch (error) {}
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
            } catch (error) {}
        }
    };

    const friendIds = new Set(friends.map(f => f.id));
    const filteredUsers = users.filter(u =>
        u.id !== currentUserId &&
        friendIds.has(u.id) &&
        (u.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredConversations = conversations.filter(conv => {
        if (!conv.lastMessage) return false;
        const other = Number(conv.user1.id) === Number(currentUserId) ? conv.user2 : conv.user1;
        const name = (other.profile?.username || other.email).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
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
                <h1>Conversations</h1>
                <p>Connect with your study partners</p>
            </div>

            <div className="chat-app-container">
                <div className={`chat-card chat-card--left ${mobileView === 'chat' ? 'chat-panel-hidden-mobile' : ''}`}>
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

                <div className={`chat-card chat-card--right ${mobileView === 'list' ? 'chat-panel-hidden-mobile' : ''}`}>
                    <button
                        className="chat-mobile-back"
                        onClick={() => setMobileView('list')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>

                    {activeConversation ? (
                        <ChatRoom
                            conversation={activeConversation}
                            messages={activeMessages}
                            currentUserId={currentUserId}
                            onlineUserIds={onlineUserIds}
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