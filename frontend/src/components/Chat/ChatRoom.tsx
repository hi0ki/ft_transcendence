import React, { useState, useEffect, useRef } from 'react';
import type { Message, User } from '../../services/chatApi';

interface ChatRoomProps {
    roomId: string;
    messages: Message[];
    participants: User[];
    currentUserId?: string;
    onSendMessage: (message: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
    roomId,
    messages,
    participants,
    currentUserId,
    onSendMessage,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const otherUser = participants.find((p) => p.socketId !== currentUserId);
    const otherName = otherUser?.username || `User ${otherUser?.index || '?'}`;
    const otherHandle = `@${otherName.toLowerCase().replace(/\s+/g, '')}`;

    const formatTime = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="chatroom">
            {/* Header */}
            <div className="chatroom-header">
                <div className="chatroom-header-user">
                    <div className="chatroom-header-avatar">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherName}`}
                            alt={otherName}
                        />
                    </div>
                    <div>
                        <h2 className="chatroom-header-name">{otherName}</h2>
                        <p className="chatroom-header-handle">{otherHandle}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chatroom-messages">
                {messages.length === 0 ? (
                    <div className="chatroom-empty">
                        <p>No messages yet</p>
                        <p className="chatroom-empty-hint">Send a message to start the conversation</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.from.socketId === currentUserId;
                        return (
                            <div key={message.id} className={`msg ${isOwn ? 'msg--own' : 'msg--other'}`}>
                                <div className="msg-bubble">{message.content}</div>
                                <span className="msg-time">{formatTime(message.timestamp)}</span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chatroom-input" onSubmit={handleSubmit}>
                <button type="button" className="chatroom-emoji-btn" title="Emoji">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                </button>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="chatroom-send-btn" disabled={!inputMessage.trim()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;
