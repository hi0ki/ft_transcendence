import React, { useState } from 'react';
import './Chat.css';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleSendClick = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="message-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? 'Select a user to start chatting' : 'Type your message...'}
                disabled={disabled}
                className="message-input-field"
            />
            <button
                type="button"
                onClick={handleSendClick}
                disabled={!message.trim() || disabled}
                className="send-button"
            >
                📤 Send Message
            </button>
        </form>
    );
};

export default MessageInput;
