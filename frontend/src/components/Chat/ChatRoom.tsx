import React, { useState, useEffect, useRef } from 'react';
import type { DBMessage, DBConversation } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface ChatRoomProps {
    conversation: DBConversation;
    messages: DBMessage[];
    currentUserId: number | null;
    onSendMessage: (message: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const getOtherUser = () => {
        return conversation.user1.id === currentUserId ? conversation.user2 : conversation.user1;
    };

    const otherUser = getOtherUser();
    const otherName = otherUser.profile?.username || otherUser.email.split('@')[0];

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="chatroom">
            {/* Header */}
            <div className="chatroom-header">
                <div className="chatroom-header-user">
                    <div className="chatroom-header-avatar">
                        <img
                            src={getAvatarUrl(otherUser.profile?.avatarUrl, otherName)}
                            alt={otherName}
                        />
                    </div>
                    <div>
                        <h3 className="chatroom-header-name">{otherName}</h3>
                        <p className="chatroom-header-handle" style={{ display: 'inline', marginRight: '8px' }}>@{otherName}</p>
                        <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>• Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chatroom-messages">
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isOwn = message.senderId === currentUserId;
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const showTime = !prevMessage || (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000); // 5 mins gap

                        return (
                            <div key={message.id}>
                                {showTime && <div style={{ textAlign: 'center', margin: '16px 0 8px', fontSize: '0.7rem', color: '#64748b' }}>{formatTime(message.createdAt)}</div>}
                                <div className={`msg ${isOwn ? 'msg--own' : 'msg--other'}`}>
                                    <div className="msg-bubble">{message.content}</div>
                                    {!showTime && <span className="msg-time">{formatTime(message.createdAt)}</span>}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - matching the pill shape with icons at the end */}
            <form className="chatroom-input" onSubmit={handleSubmit}>
                <button type="button" className="chatroom-emoji-btn" style={{ fontSize: '1.2rem', padding: '0 10px' }}>😊</button>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ borderRadius: '20px', paddingLeft: '15px' }}
                    autoFocus
                />
                <button type="submit" className="chatroom-send-btn" style={{ marginLeft: '10px' }}>
                    <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', marginBottom: '2px' }}>➤</span>
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;
