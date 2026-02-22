import React from 'react';
import type { DBConversation } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface ChatListProps {
    conversations: DBConversation[];
    currentUserId: number | null;
    onlineUserIds: number[];
    activeConversationId?: number;
    onConversationClick: (conversation: DBConversation) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    conversations,
    currentUserId,
    onlineUserIds,
    activeConversationId,
    onConversationClick,
}) => {
    const getOtherUser = (conversation: DBConversation) => {
        return conversation.user1.id === currentUserId ? conversation.user2 : conversation.user1;
    };

    const getDisplayName = (conversation: DBConversation): string => {
        const other = getOtherUser(conversation);
        return other.profile?.username || other.email.split('@')[0];
    };

    const isOnline = (userId: number): boolean => {
        return onlineUserIds.includes(userId);
    };

    const getLastMessagePreview = (conversation: DBConversation): string => {
        if (!conversation.lastMessage) return 'No messages yet';
        const content = conversation.lastMessage.content || '';
        return content.length > 40 ? content.substring(0, 40) + '...' : content;
    };

    const formatTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (conversations.length === 0) return null;

    return (
        <div className="chatlist">
            {conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const other = getOtherUser(conversation);

                return (
                    <div
                        key={conversation.id}
                        className={`chatlist-item ${isActive ? 'chatlist-item--active' : ''}`}
                        onClick={() => onConversationClick(conversation)}
                    >
                        <div className="chatlist-avatar">
                            <img
                                src={getAvatarUrl(other.profile?.avatarUrl, getDisplayName(conversation))}
                                alt={getDisplayName(conversation)}
                            />
                            {isOnline(other.id) && <span className="chatlist-online-dot" />}
                        </div>
                        <div className="chatlist-info">
                            <div className="chatlist-top">
                                <span className="chatlist-name">{getDisplayName(conversation)}</span>
                                {conversation.lastMessage && (
                                    <span className="chatlist-time">
                                        {formatTime(conversation.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <p className="chatlist-preview">
                                {getLastMessagePreview(conversation)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;
