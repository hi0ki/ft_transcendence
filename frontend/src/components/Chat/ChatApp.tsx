import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: Date;
}

interface ChatRoom {
    id: string;
    name: string;
    lastMessage?: string;
    unread?: number;
}

const ChatApp: React.FC = () => {
    const [rooms] = useState<ChatRoom[]>([
        { id: '1', name: 'General', lastMessage: 'Welcome to the chat!', unread: 0 },
        { id: '2', name: 'Study Group', lastMessage: 'Who wants to study tonight?', unread: 2 },
        { id: '3', name: 'Help & Support', lastMessage: 'I need help with React', unread: 1 },
    ]);
    const [selectedRoom, setSelectedRoom] = useState<string>('1');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Welcome to Peer Study Hub! 🎉', sender: 'system', timestamp: new Date() },
        { id: '2', text: 'Feel free to start chatting with your study peers.', sender: 'system', timestamp: new Date() },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'me',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
    };

    return (
        <div className="chat-container">
            {/* Sidebar — Room List */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3>Messages</h3>
                </div>
                <div className="chat-room-list">
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            className={`chat-room-item ${selectedRoom === room.id ? 'active' : ''}`}
                            onClick={() => setSelectedRoom(room.id)}
                        >
                            <div className="chat-room-avatar">{room.name.charAt(0)}</div>
                            <div className="chat-room-info">
                                <span className="chat-room-name">{room.name}</span>
                                <span className="chat-room-last">{room.lastMessage}</span>
                            </div>
                            {room.unread && room.unread > 0 ? (
                                <span className="chat-room-badge">{room.unread}</span>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                <div className="chat-header">
                    <h3>{rooms.find((r) => r.id === selectedRoom)?.name || 'Chat'}</h3>
                </div>
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.sender === 'me' ? 'chat-message--mine' : 'chat-message--other'}`}
                        >
                            <div className="chat-message-bubble">
                                <p>{msg.text}</p>
                                <span className="chat-message-time">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type a message…"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatApp;
