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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const getOtherParticipant = () => {
        return participants.find((p) => p.socketId !== currentUserId);
    };

    const otherUser = getOtherParticipant();

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="chat-room">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-header-avatar">
                        {otherUser?.index || '?'}
                    </div>
                    <div>
                        <h2>User {otherUser?.index || 'Unknown'}</h2>
                        <p className="chat-header-status">Online</p>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-messages">
                        <p>No messages yet</p>
                        <p className="hint">Send a message to start the conversation</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.from.socketId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                            >
                                <div className="message-avatar">
                                    {message.from.index}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">{message.content}</div>
                                    <div className="message-time">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    autoFocus
                />
                <button type="submit" className="chat-send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;
