import React, { useState, useEffect, useRef } from 'react';
import type { DBMessage, DBConversation } from '../../services/chatApi';
import { chatAPI } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface ChatRoomProps {
    conversation: DBConversation;
    messages: DBMessage[];
    currentUserId: number | null;
    onSendMessage: (message: string, type?: string, fileUrl?: string) => void;
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
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'IMAGE' | 'VIDEO' } | null>(null);

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Cleanup file preview URL
    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    const handleEmojiSelect = (emoji: string) => {
        setInputMessage(prev => prev + emoji);
        inputRef.current?.focus();
    };

    // ─── File handling ───
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (50MB max — videos need more room)
        if (file.size > 50 * 1024 * 1024) {
            setUploadError('File size must be under 50MB');
            setTimeout(() => setUploadError(null), 3000);
            return;
        }

        setSelectedFile(file);
        setUploadError(null);

        // Generate preview for images/videos
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            setFilePreview(URL.createObjectURL(file));
        } else {
            setFilePreview(null);
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const clearFileSelection = () => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        setUploadError(null);
    };

    const getFileType = (file: File): string => {
        if (file.type.startsWith('image/')) return 'IMAGE';
        if (file.type.startsWith('video/')) return 'VIDEO';
        // webm audio = voice recording; other audio = music/audio file
        if (file.type === 'audio/webm' || file.type === 'audio/ogg') return 'VOICE';
        if (file.type.startsWith('audio/')) return 'AUDIO';
        return 'FILE';
    };

    const getFileIcon = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        return '📎';
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // ─── Voice recording ───
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                if (audioBlob.size > 0) {
                    setIsUploading(true);
                    try {
                        const result = await chatAPI.uploadFile(audioBlob, 'voice-message.webm');
                        onSendMessage('🎤 Voice message', 'VOICE', result.fileUrl);
                    } catch (err) {
                        setUploadError('Failed to send voice message');
                        setTimeout(() => setUploadError(null), 3000);
                    }
                    setIsUploading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            setUploadError('Microphone access denied');
            setTimeout(() => setUploadError(null), 3000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
            audioChunksRef.current = [];
            setIsRecording(false);
            setRecordingTime(0);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const formatRecordingTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ─── Submit ───
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedFile) {
            // Upload file then send message
            setIsUploading(true);
            try {
                const result = await chatAPI.uploadFile(selectedFile);
                const fileType = getFileType(selectedFile);
                const caption = inputMessage.trim() || selectedFile.name;
                onSendMessage(caption, fileType, result.fileUrl);
                setInputMessage('');
                clearFileSelection();
            } catch (err) {
                setUploadError('Failed to upload file');
                setTimeout(() => setUploadError(null), 3000);
            }
            setIsUploading(false);
        } else if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    // ─── Edit / Delete ───
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

    // ─── Render message content (text, image, video, voice, file) ───
    const renderMessageContent = (message: DBMessage) => {
        const baseUrl = window.location.origin;

        if (message.fileUrl) {
            const fullUrl = message.fileUrl.startsWith('http') ? message.fileUrl : `${baseUrl}${message.fileUrl}`;

            switch (message.type) {
                case 'IMAGE':
                    return (
                        <div className="msg-media">
                            <img
                                src={fullUrl}
                                alt={message.content || 'Image'}
                                className="msg-media-image"
                                onClick={() => setLightboxMedia({ url: fullUrl, type: 'IMAGE' })}
                            />
                            {message.content && message.content !== message.fileUrl && !message.content.includes('.') && (
                                <p className="msg-media-caption">{message.content}</p>
                            )}
                        </div>
                    );

                case 'VIDEO':
                    return (
                        <div className="msg-media">
                            <video
                                src={fullUrl}
                                className="msg-media-video"
                                preload="metadata"
                                onClick={() => setLightboxMedia({ url: fullUrl, type: 'VIDEO' })}
                            />
                            <div className="msg-video-play-hint" onClick={() => setLightboxMedia({ url: fullUrl, type: 'VIDEO' })}>
                                <span>▶</span>
                            </div>
                            {message.content && !message.content.includes('.') && (
                                <p className="msg-media-caption">{message.content}</p>
                            )}
                        </div>
                    );

                case 'VOICE': {
                    const senderName = message.sender?.profile?.username || message.sender?.email?.split('@')[0] || 'User';
                    const senderAvatar = getAvatarUrl(message.sender?.profile?.avatarUrl, senderName);
                    return (
                        <div className="msg-voice">
                            <img src={senderAvatar} alt={senderName} className="msg-voice-avatar" />
                            <audio src={fullUrl} controls preload="metadata" className="msg-voice-player" />
                        </div>
                    );
                }

                case 'AUDIO': // Uploaded music/audio file (mp3, aac, flac, etc.)
                    return (
                        <div className="msg-audio">
                            <span className="msg-audio-icon">🎵</span>
                            <div className="msg-audio-content">
                                <span className="msg-audio-name">{message.content || 'Audio file'}</span>
                                <audio src={fullUrl} controls preload="metadata" className="msg-audio-player" />
                            </div>
                        </div>
                    );

                default: // FILE
                    return (
                        <div className="msg-file">
                            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="msg-file-link">
                                <span className="msg-file-icon">📎</span>
                                <span className="msg-file-name">{message.content || 'Download file'}</span>
                                <span className="msg-file-download">⬇</span>
                            </a>
                        </div>
                    );
            }
        }

        // Plain text message
        return <>{message.content}</>;
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
                        const showTime = !prevMessage || (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000);
                        const isEditing = editingMessageId === message.id;
                        const hasMedia = !!message.fileUrl;

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
                                            <div className={`msg-bubble ${hasMedia ? 'msg-bubble--media' : ''}`}>
                                                {renderMessageContent(message)}
                                                <div className="msg-actions">
                                                    {isOwn && !hasMedia && (
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

            {/* File Preview */}
            {selectedFile && (
                <div className="file-preview-bar">
                    <div className="file-preview-content">
                        {filePreview && selectedFile.type.startsWith('image/') ? (
                            <img src={filePreview} alt="Preview" className="file-preview-thumb" />
                        ) : filePreview && selectedFile.type.startsWith('video/') ? (
                            <video src={filePreview} className="file-preview-thumb" />
                        ) : (
                            <span className="file-preview-icon">{getFileIcon(selectedFile.type)}</span>
                        )}
                        <div className="file-preview-info">
                            <span className="file-preview-name">{selectedFile.name}</span>
                            <span className="file-preview-size">{formatFileSize(selectedFile.size)}</span>
                        </div>
                    </div>
                    <button className="file-preview-close" onClick={clearFileSelection}>✕</button>
                </div>
            )}

            {/* Upload Error */}
            {uploadError && (
                <div className="upload-error">
                    <span>⚠️ {uploadError}</span>
                </div>
            )}

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

                {isRecording ? (
                    <div className="recording-bar">
                        <div className="recording-indicator">
                            <span className="recording-dot"></span>
                            <span className="recording-time">{formatRecordingTime(recordingTime)}</span>
                            <span className="recording-label">Recording...</span>
                        </div>
                        <div className="recording-actions">
                            <button className="recording-cancel-btn" onClick={cancelRecording} title="Cancel">✕</button>
                            <button className="recording-stop-btn" onClick={stopRecording} title="Send">
                                <span style={{ transform: 'rotate(-45deg)', display: 'inline-block' }}>➤</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className="chatroom-input" onSubmit={handleSubmit}>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {/* Attachment button */}
                        <button
                            type="button"
                            className="chatroom-attach-btn"
                            onClick={handleFileSelect}
                            title="Attach file"
                        >
                            📎
                        </button>

                        {/* Emoji button */}
                        <button
                            type="button"
                            className={`chatroom-emoji-btn ${showEmojiPicker ? 'chatroom-emoji-btn--active' : ''}`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{ fontSize: '1.2rem', padding: '0 6px' }}
                        >
                            😊
                        </button>

                        {/* Text input */}
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            style={{ borderRadius: '20px', paddingLeft: '15px' }}
                            autoFocus
                        />

                        {/* Voice button (only when no text and no file) */}
                        {!inputMessage.trim() && !selectedFile ? (
                            <button
                                type="button"
                                className="chatroom-voice-btn"
                                onClick={startRecording}
                                title="Record voice message"
                            >
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.721c0 4.001 3.178 7.414 7.061 7.942v3.588h2.435v-3.588c3.883-.529 7.061-3.941 7.061-7.942h-2.041z" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="chatroom-send-btn"
                                disabled={isUploading}
                                style={{ marginLeft: '10px' }}
                            >
                                {isUploading ? (
                                    <span className="upload-spinner"></span>
                                ) : (
                                    <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', marginBottom: '2px' }}>➤</span>
                                )}
                            </button>
                        )}
                    </form>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxMedia && (
                <div className="media-lightbox" onClick={() => setLightboxMedia(null)}>
                    <button className="lightbox-close" onClick={() => setLightboxMedia(null)}>✕</button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {lightboxMedia.type === 'IMAGE' ? (
                            <img src={lightboxMedia.url} alt="Fullscreen" />
                        ) : (
                            <video src={lightboxMedia.url} controls autoPlay />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;
