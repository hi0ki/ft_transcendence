import React, { useState, useEffect, useRef, useCallback } from 'react';
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

    const currentUserIdRef = useRef<number | null>(null);
    const activeConversationRef = useRef<DBConversation | null>(null);
    const conversationsRef = useRef<DBConversation[]>([]);

    useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
    useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
    useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

    // ── Helper: join all known rooms ──────────────────────────────────────
    const joinAllRooms = useCallback((convs: DBConversation[]) => {
        convs.forEach(conv => socketService.joinRoom(conv.id));
    }, []);

    // ── Helper: fetch conversations and re-join all rooms ─────────────────
    const refreshConversations = useCallback(async (userId: number) => {
        try {
            const convs = await chatAPI.getUserConversations(userId);
            setConversations(convs);
            joinAllRooms(convs);
            return convs;
        } catch {
            return null;
        }
    }, [joinAllRooms]);

    // ── Online users subscription ─────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = socketService.subscribeOnlineUsers(setOnlineUserIds);
        if (socketService.isConnected()) socketService.emit('request_online_users');
        const handleConnectOnline = () => socketService.emit('request_online_users');
        socketService.on('connect', handleConnectOnline);
        return () => {
            unsubscribe();
            socketService.off('connect', handleConnectOnline);
        };
    }, []);

    // ── Main data + socket events ─────────────────────────────────────────
    useEffect(() => {
        const authUser = authAPI.getCurrentUser();
        if (!authUser) { setLoading(false); return; }
        setCurrentUserId(authUser.id);
        currentUserIdRef.current = authUser.id;

        // Initial data load
        const loadData = async () => {
            try { setUsers(await chatAPI.getUsers()); } catch {}
            try { setFriends(await friendsAPI.getFriends()); } catch {}
            try {
                const convs = await chatAPI.getUserConversations(authUser.id);
                setConversations(convs);
                if (socketService.isConnected()) joinAllRooms(convs);
            } catch {}
            setLoading(false);
        };
        loadData();

        // ── Socket: connect / disconnect ──────────────────────────────────
        const handleConnect = async () => {
            setConnected(true);
            // Re-join immediately with what we have, then refresh
            joinAllRooms(conversationsRef.current);
            const user = authAPI.getCurrentUser();
            if (user) await refreshConversations(user.id);
        };
        const handleDisconnect = () => setConnected(false);
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        if (socketService.isConnected()) {
            setConnected(true);
            joinAllRooms(conversationsRef.current);
        }

        // ── Socket: room_created ──────────────────────────────────────────
        const handleRoomCreated = async (data: {
            conversationId: number;
            conversation: any;
            initiatorId?: number;
        }) => {
            const userId = currentUserIdRef.current;

            // Always join the socket room for both users
            socketService.joinRoom(data.conversationId);

            if (data.conversation) {
                setConversations(prev => {
                    if (prev.some(c => c.id === data.conversationId)) return prev;
                    return [data.conversation, ...prev];
                });
            } else if (userId) {
                await refreshConversations(userId);
            }

            if (data.initiatorId === userId) {
                // Initiator: only set activeConversation if not already set
                // (handleUserClick already set it via REST — don't override/flicker)
                if (!activeConversationRef.current || activeConversationRef.current.id !== data.conversationId) {
                    setActiveConversation(data.conversation);
                    setActiveMessages([]);
                    setSearchQuery('');
                }
            } else {
                // Recipient (Jana): add conversation to her list so she's ready to receive
                // She doesn't auto-open it — she'll see it in her conversation list
            }
        };

        // ── Socket: room_message ──────────────────────────────────────────
        // Fires for EVERY message in any room both users are joined to.
        const handleRoomMessage = (message: DBMessage) => {
            // 1. Always show in active chat window if it matches
            if (activeConversationRef.current?.id === message.conversationId) {
                setActiveMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
            }

            // 2. Update conversations list
            setConversations(prev => {
                const exists = prev.some(c => c.id === message.conversationId);
                if (!exists) {
                    // This conversation isn't in state yet — fetch in background
                    // This handles the case where room_created was missed
                    const userId = currentUserIdRef.current;
                    if (userId) {
                        chatAPI.getUserConversations(userId).then(convs => {
                            setConversations(convs);
                            joinAllRooms(convs);
                            // Now show the message in active window if it matches
                            if (activeConversationRef.current?.id === message.conversationId) {
                                setActiveMessages(prev2 => {
                                    if (prev2.some(m => m.id === message.id)) return prev2;
                                    return [...prev2, message];
                                });
                            }
                        });
                    }
                    return prev;
                }

                return prev
                    .map(conv => conv.id === message.conversationId
                        ? { ...conv, lastMessage: message }
                        : conv
                    )
                    .sort((a, b) =>
                        new Date(b.lastMessage?.createdAt || b.createdAt).getTime() -
                        new Date(a.lastMessage?.createdAt || a.createdAt).getTime()
                    );
            });
        };

        // ── Socket: message_updated ───────────────────────────────────────
        const handleMessageUpdated = (message: DBMessage) => {
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
        };

        // ── Socket: message_deleted ───────────────────────────────────────
        const handleMessageDeleted = (data: {
            messageId: number;
            conversationId: number;
            deleteType: string;
        }) => {
            if (activeConversationRef.current?.id === data.conversationId) {
                setActiveMessages(prev => prev.filter(m => m.id !== data.messageId));
            }
            setConversations(prev => {
                const conv = prev.find(c => c.id === data.conversationId);
                if (conv?.lastMessage?.id === data.messageId) {
                    const userId = currentUserIdRef.current;
                    if (userId) chatAPI.getUserConversations(userId).then(setConversations);
                }
                return prev.map(c =>
                    c.id === data.conversationId && c.lastMessage?.id === data.messageId
                        ? { ...c, lastMessage: null }
                        : c
                );
            });
        };

        // Register all listeners
        socketService.onRoomCreated(handleRoomCreated);
        socketService.onRoomMessage(handleRoomMessage);
        socketService.onMessageUpdated(handleMessageUpdated);
        socketService.onMessageDeleted(handleMessageDeleted);

        // Cleanup ALL listeners on unmount — prevents stacking on re-render
        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.off('room_created', handleRoomCreated);
            socketService.off('room_message', handleRoomMessage);
            socketService.off('message_updated', handleMessageUpdated);
            socketService.off('message_deleted', handleMessageDeleted);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cleanup empty conversation when switching ─────────────────────────
    const cleanupEmptyConversation = async () => {
        const conv = activeConversationRef.current;
        if (!conv) return;
        try {
            const msgs = await chatAPI.getConversationMessages(conv.id, currentUserIdRef.current || undefined);
            if (msgs.length === 0) {
                await chatAPI.deleteConversation(conv.id);
                setConversations(prev => prev.filter(c => c.id !== conv.id));
                if (activeConversationRef.current?.id === conv.id) {
                    setActiveConversation(null);
                    setActiveMessages([]);
                }
            }
        } catch {}
    };

    // ── Click on a user in search results ────────────────────────────────
    const handleUserClick = async (user: DBUser) => {
        if (!currentUserId) return;

        // Already open? Just clear search
        const isCurrentActive = activeConversation && (
            Number(activeConversation.user1.id) === Number(user.id) ||
            Number(activeConversation.user2.id) === Number(user.id)
        );
        if (isCurrentActive) { setSearchQuery(''); return; }

        await cleanupEmptyConversation();

        // Check if conversation already exists locally
        const existingConv = conversationsRef.current.find(conv =>
            Number(conv.user1.id) === Number(user.id) ||
            Number(conv.user2.id) === Number(user.id)
        );

        if (existingConv) {
            setActiveConversation(existingConv);
            const messages = await chatAPI.getConversationMessages(existingConv.id, currentUserId);
            setActiveMessages(messages);
            socketService.joinRoom(existingConv.id);
            setSearchQuery('');
            setMobileView('chat');
            return;
        }

        // No existing conversation:
        // 1. Create via REST immediately so we have the conversation object NOW
        // 2. Then emit create_room via socket so Jana gets notified in real time
        try {
            const conv = await chatAPI.findOrCreateConversation(currentUserId, Number(user.id));
            // Open the chat window immediately — don't wait for socket round-trip
            setActiveConversation(conv);
            setActiveMessages([]);
            setConversations(prev => {
                if (prev.some(c => c.id === conv.id)) return prev;
                return [conv, ...prev];
            });
            // Join the socket room so we receive messages
            socketService.joinRoom(conv.id);
            // Also tell the backend via socket so it can notify Jana (room_created → her frontend)
            socketService.createRoom(Number(user.id));
            setSearchQuery('');
            setMobileView('chat');
        } catch {}
    };

    // ── Click on an existing conversation ────────────────────────────────
    const handleConversationClick = async (conversation: DBConversation) => {
        if (activeConversation?.id !== conversation.id) {
            await cleanupEmptyConversation();
        }
        setActiveConversation(conversation);
        setSearchQuery('');
        const messages = await chatAPI.getConversationMessages(
            conversation.id,
            currentUserId || undefined
        );
        setActiveMessages(messages);
        socketService.joinRoom(conversation.id);
        setMobileView('chat');
    };

    // ── Send / Update / Delete ────────────────────────────────────────────
    const handleSendMessage = async (message: string, type?: string, fileUrl?: string) => {
        if (!activeConversation || !currentUserId) return;
        if (connected) {
            socketService.sendMessage(activeConversation.id, message, type, fileUrl);
        } else {
            try {
                const savedMsg = await chatAPI.sendMessage(
                    activeConversation.id, currentUserId, message, type || 'TEXT', fileUrl
                );
                setActiveMessages(prev => [...prev, savedMsg]);
                setConversations(prev => {
                    if (!prev.some(c => c.id === activeConversation.id))
                        return [{ ...activeConversation, lastMessage: savedMsg }, ...prev];
                    return prev.map(c =>
                        c.id === activeConversation.id ? { ...c, lastMessage: savedMsg } : c
                    );
                });
            } catch {}
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
            } catch {}
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
            } catch {}
        }
    };

    // ── Filtered lists ────────────────────────────────────────────────────
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
                    <button className="chat-mobile-back" onClick={() => setMobileView('list')}>
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