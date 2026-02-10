import React, { useEffect, useRef } from 'react';
import type { Message, User } from '../../services/chatApi';
import MessageInput from './MessageInput';
import './Chat.css';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOtherParticipant = () => {
        return participants.find(p => p.socketId !== currentUserId);
    };

    const otherUser = getOtherParticipant();

    return (
        <div className="chat-room">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2>
                        {otherUser
                            ? (otherUser.username || `User ${otherUser.index}`)
                            : 'Chat Room'}
                    </h2>
                    <div className="participants-count">
                        {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.from.socketId === currentUserId ? 'message-sent' : 'message-received'
                                } ${msg.type === 'system' ? 'message-system' : ''}`}
                        >
                            <div className="message-header">
                                <span className="message-sender">
                                    {msg.from.socketId === currentUserId
                                        ? 'You'
                                        : msg.from.username || `User ${msg.from.index}`}
                                </span>
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-content">{msg.content}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatRoom;
