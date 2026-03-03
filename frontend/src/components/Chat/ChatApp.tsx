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

interface ChatAppProps {
    // onlineUserIds are now handled via subscription
}

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

    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
    useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);

    useEffect(() => {
        // Subscribe to online status updates
        const unsubscribe = socketService.subscribeOnlineUsers((ids) => {
            setOnlineUserIds(ids);
        });

        // If the socket is already connected when this component mounts,
        // request the fresh list immediately — the last broadcast may have
        // happened before we subscribed (e.g. right after login).
        if (socketService.isConnected()) {
            socketService.emit('request_online_users');
        }

        // Also listen for (re)connect so we always get a fresh list after
        // a disconnect/reconnect while the chat page is open.
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
                const myFriends = await friendsAPI.getFriends();
                setFriends(myFriends);
            } catch (error) {
                console.error('Failed to load friends:', error);
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

        // Socket is managed globally by App.tsx
        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);

        if (socketService.isConnected()) {
            setConnected(true);
        }

        // Do NOT set onlineUserIds here — managed globally by App.tsx via prop

        socketService.onRoomCreated(async (data: { conversationId: number; conversation: any; initiatorId?: number }) => {
            if (data.initiatorId === currentUserIdRef.current) {
                // Initiator (us): set as active chat window
                setActiveConversation(data.conversation);
                setActiveMessages([]);
                setSearchQuery(''); // Clear search on selection
            } else {
                // Recipient: silently join the room so real-time messages work,
                // but do NOT interrupt the conversation they're currently in.
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
            // Add conversation to sidebar if not already there (first message triggers visibility)
            setConversations(prev => {
                const exists = prev.some(c => c.id === message.conversationId);
                if (!exists) {
                    // Conversation not in sidebar yet — fetch it and add
                    const activeConv = activeConversationRef.current;
                    if (activeConv && activeConv.id === message.conversationId) {
                        return [{ ...activeConv, lastMessage: message }, ...prev];
                    }
                    // If it's from another user creating a room with us, reload conversations
                    const userId = currentUserIdRef.current;
                    if (userId) {
                        chatAPI.getUserConversations(userId).then(convs => setConversations(convs));
                    }
                    return prev;
                }
                // Update existing conversation with new last message
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
            // Remove from active chat window
            if (activeConversationRef.current?.id === data.conversationId) {
                setActiveMessages(prev => prev.filter(m => m.id !== data.messageId));
            }
            // Update sidebar — reload from server to show the real previous lastMessage
            const userId = currentUserIdRef.current;
            setConversations(prev => {
                const conv = prev.find(c => c.id === data.conversationId);
                const wasLastMessage = conv?.lastMessage?.id === data.messageId;
                if (wasLastMessage && userId) {
                    // Re-fetch conversations from server to get the real previous lastMessage
                    chatAPI.getUserConversations(userId).then(fresh => setConversations(fresh));
                }
                // Optimistically remove from current view while fetch is in-flight
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
            // ⚠️ Do NOT disconnect the socket here.
            // The socket is managed globally by useGlobalSocket in App.tsx
            // and must stay alive when we navigate away from the chat page.
        };
    }, []);

    // Helper: delete empty conversation (no messages sent) when switching away
    const cleanupEmptyConversation = async () => {
        const conv = activeConversationRef.current;
        if (!conv) return;

        try {
            // Check if the conversation has any messages globally
            const messageCount = await chatAPI.getConversationMessages(conv.id, currentUserIdRef.current || undefined);
            if (messageCount.length === 0) {
                await chatAPI.deleteConversation(conv.id);
                setConversations(prev => prev.filter(c => c.id !== conv.id));
                // If we are still "on" this conversation, un-set it
                if (activeConversationRef.current?.id === conv.id) {
                    setActiveConversation(null);
                    setActiveMessages([]);
                }
            }
        } catch (e) {
            // Ignore — likely already deleted or lacks permissions
        }
    };

    const handleUserClick = async (user: DBUser) => {
        if (!currentUserId) return;

        // If we're already chatting with this user, just clear search and stay put
        const isCurrentActive = activeConversation && (activeConversation.user1.id === user.id || activeConversation.user2.id === user.id);
        if (isCurrentActive) {
            setSearchQuery('');
            return;
        }

        // Clean up current empty conversation before switching
        await cleanupEmptyConversation();

        const existingConv = conversations.find(conv =>
            conv.user1.id === user.id || conv.user2.id === user.id
        );
        if (existingConv) {
            setActiveConversation(existingConv);
            const messages = await chatAPI.getConversationMessages(existingConv.id, currentUserId);
            setActiveMessages(messages);
            if (connected) socketService.joinRoom(existingConv.id);
            setMobileView('chat');
            return;
        }

        if (connected) {
            socketService.createRoom(user.id);
            setMobileView('chat');
        } else {
            try {
                const conv = await chatAPI.findOrCreateConversation(currentUserId, user.id);
                setActiveConversation(conv);
                setSearchQuery(''); // Clear search on selection
                const messages = await chatAPI.getConversationMessages(conv.id, currentUserId);
                setActiveMessages(messages);
                setMobileView('chat');
            } catch (error) {
                console.error('Failed to create conversation via REST:', error);
            }
        }
    };

    const handleConversationClick = async (conversation: DBConversation) => {
        // Clean up current empty conversation before switching
        if (activeConversation && activeConversation.id !== conversation.id) {
            await cleanupEmptyConversation();
        }
        setActiveConversation(conversation);
        setSearchQuery(''); // Clear search on a conversation selection
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
                // Add conversation to sidebar if not already there (first message)
                setConversations(prev => {
                    const exists = prev.some(c => c.id === activeConversation.id);
                    if (!exists) {
                        return [{ ...activeConversation, lastMessage: savedMsg }, ...prev];
                    }
                    return prev.map(c =>
                        c.id === activeConversation.id ? { ...c, lastMessage: savedMsg } : c
                    );
                });
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
    const friendIds = new Set(friends.map(f => f.id));
    const filteredUsers = users.filter(u =>
        u.id !== currentUserId &&
        friendIds.has(u.id) &&
        (u.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredConversations = conversations.filter(conv => {
        if (!conv.lastMessage) return false; // Hide empty conversations
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
                {/* Left panel: conversation list — hidden on mobile when in chat view */}
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

                {/* Right panel: chat room — hidden on mobile when in list view */}
                <div className={`chat-card chat-card--right ${mobileView === 'list' ? 'chat-panel-hidden-mobile' : ''}`}>
                    {/* Mobile back button */}
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
