import React, { useState, useEffect, useRef } from 'react';
import type { DBMessage, DBConversation } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface ChatRoomProps {
    conversation: DBConversation;
    messages: DBMessage[];
    currentUserId: number | null;
    onSendMessage: (message: string) => void;
    onUpdateMessage: (messageId: number, content: string) => void;
    onDeleteMessage: (messageId: number, type: 'FOR_ME' | 'FOR_ALL') => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
    conversation,
    messages,
    currentUserId,
    onSendMessage,
    onUpdateMessage,
    onDeleteMessage,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState('smileys');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const emojiData: Record<string, { icon: string; emojis: string[] }> = {
        smileys: { icon: '😊', emojis: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬'] },
        gestures: { icon: '👋', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾', '🖕'] },
        hearts: { icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '🫶'] },
        animals: { icon: '🐱', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🦅', '🦆', '🦉', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'] },
        food: { icon: '🍕', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪', '🎂', '🍰', '🧇', '🥞', '🍫', '☕', '🍵', '🧃', '🍺', '🥤'] },
        objects: { icon: '⚡', emojis: ['⚡', '🔥', '✨', '🌟', '💫', '💥', '💢', '💦', '💨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🎮', '🎲', '🔔', '🎵', '🎶', '💡', '📱', '💻', '⌨️', '🖥️', '📷', '🎬', '🔑', '🔒', '💰', '💎', '🚀', '✈️', '🌈'] }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    const handleEmojiSelect = (emoji: string) => {
        setInputMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleEditStart = (message: DBMessage) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMessageId && editContent.trim()) {
            onUpdateMessage(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent('');
        }
    };

    const handleDeleteClick = (messageId: number) => {
        setShowDeleteConfirm(messageId);
    };

    const confirmDelete = () => {
        if (showDeleteConfirm !== null) {
            const msg = messages.find(m => m.id === showDeleteConfirm);
            const isOwn = msg?.senderId === currentUserId;
            onDeleteMessage(showDeleteConfirm, isOwn ? 'FOR_ALL' : 'FOR_ME');
            setShowDeleteConfirm(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
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
                        const isEditing = editingMessageId === message.id;

                        return (
                            <div key={message.id}>
                                {showTime && <div style={{ textAlign: 'center', margin: '16px 0 8px', fontSize: '0.7rem', color: '#64748b' }}>{formatTime(message.createdAt)}</div>}
                                <div className={`msg ${isOwn ? 'msg--own' : 'msg--other'}`}>
                                    {isEditing ? (
                                        <form className="msg-edit-form" onSubmit={handleEditSave}>
                                            <input
                                                className="msg-edit-input"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="msg-edit-actions">
                                                <button type="submit" className="msg-edit-btn msg-edit-btn--save">Save</button>
                                                <button type="button" className="msg-edit-btn msg-edit-btn--cancel" onClick={handleEditCancel}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : showDeleteConfirm === message.id ? (
                                        <div className="msg-delete-choices">
                                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem' }}>Delete this message?</p>
                                            <div className="delete-actions">
                                                <button className="delete-all-btn" onClick={() => confirmDelete()}>Confirm</button>
                                                <button className="cancel-btn" onClick={cancelDelete} style={{ background: 'transparent', border: '1px solid #ccc', color: '#ccc' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="msg-bubble">
                                                {message.content}
                                                <div className="msg-actions">
                                                    {isOwn && (
                                                        <button className="msg-action-btn" onClick={() => handleEditStart(message)} title="Edit">✎</button>
                                                    )}
                                                    <button className="msg-action-btn" onClick={() => handleDeleteClick(message.id)} title="Delete">🗑</button>
                                                </div>
                                            </div>
                                            {!showTime && <span className="msg-time">{formatTime(message.createdAt)}</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chatroom-input-wrapper">
                {showEmojiPicker && (
                    <div className="emoji-picker" ref={emojiPickerRef}>
                        <div className="emoji-picker-tabs">
                            {Object.entries(emojiData).map(([key, { icon }]) => (
                                <button
                                    key={key}
                                    className={`emoji-tab ${emojiCategory === key ? 'emoji-tab--active' : ''}`}
                                    onClick={() => setEmojiCategory(key)}
                                    title={key}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                        <div className="emoji-picker-grid">
                            {emojiData[emojiCategory].emojis.map((emoji, i) => (
                                <button
                                    key={i}
                                    className="emoji-item"
                                    onClick={() => handleEmojiSelect(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <form className="chatroom-input" onSubmit={handleSubmit}>
                    <button
                        type="button"
                        className={`chatroom-emoji-btn ${showEmojiPicker ? 'chatroom-emoji-btn--active' : ''}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        style={{ fontSize: '1.2rem', padding: '0 10px' }}
                    >
                        😊
                    </button>
                    <input
                        ref={inputRef}
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
        </div>
    );
};

export default ChatRoom;
