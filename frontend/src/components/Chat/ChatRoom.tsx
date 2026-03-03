import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DBMessage, DBConversation } from '../../services/chatApi';
import { chatAPI } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface ChatRoomProps {
    conversation: DBConversation;
    messages: DBMessage[];
    currentUserId: number | null;
    onlineUserIds: number[];
    onSendMessage: (message: string, type?: string, fileUrl?: string) => void;
    onUpdateMessage: (messageId: number, content: string) => void;
    onDeleteMessage: (messageId: number, type: 'FOR_ME' | 'FOR_ALL') => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
    conversation,
    messages,
    currentUserId,
    onlineUserIds,
    onSendMessage,
    onUpdateMessage,
    onDeleteMessage,
}) => {
    const navigate = useNavigate();
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
    const isCancelledRef = useRef(false);

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
                if (isCancelledRef.current) {
                    isCancelledRef.current = false;
                    return; // don't send — user cancelled
                }
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
            isCancelledRef.current = true; // signal onstop to bail out
            audioChunksRef.current = [];   // discard buffered data
            mediaRecorderRef.current.stop();
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
    const isOtherUserOnline = onlineUserIds.includes(otherUser.id);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // ─── Render message content (text, image, video, voice, file) ───

    // Detect URLs in plain text and render them as clickable links
    const renderTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) =>
            urlRegex.test(part) ? (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="msg-link"
                >
                    {part}
                </a>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

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

        // Plain text message — detect and render URLs as clickable links
        return <>{renderTextWithLinks(message.content)}</>;
    };

    return (
        <div className="chatroom">
            {/* Header */}
            <div className="chatroom-header">
                <div
                    className="chatroom-header-user"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/profile/${otherName}`)}
                >
                    <div className="chatroom-header-avatar" style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={getAvatarUrl(otherUser.profile?.avatarUrl, otherName)}
                            alt={otherName}
                        />
                        {isOtherUserOnline && (
                            <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                border: '2px solid #0f172a',
                                display: 'block',
                            }} />
                        )}
                    </div>
                    <div>
                        <h3 className="chatroom-header-name">{otherName}</h3>
                        <p className="chatroom-header-handle" style={{ display: 'inline', marginRight: '8px' }}>@{otherName}</p>
                        <span style={{ fontSize: '0.75rem', color: isOtherUserOnline ? '#22c55e' : '#64748b' }}>
                            {isOtherUserOnline ? '• Online' : '• Offline'}
                        </span>
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
                                <div className={`msg ${isOwn ? 'msg--own' : 'msg--other'}`}>
                                    {showTime && <span className="msg-time">{formatTime(message.createdAt)}</span>}
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
                                            <p>Delete this message?</p>
                                            <div className="delete-actions">
                                                <button className="delete-all-btn" onClick={() => confirmDelete()}>Delete</button>
                                                <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`msg-bubble ${hasMedia ? 'msg-bubble--media' : ''}`}>
                                                {renderMessageContent(message)}
                                                <div className="msg-actions">
                                                    {isOwn && !hasMedia && (
                                                        <button className="msg-action-btn msg-action-btn--edit" onClick={() => handleEditStart(message)} title="Edit">
                                                            {/* Pencil icon */}
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button className="msg-action-btn msg-action-btn--delete" onClick={() => handleDeleteClick(message.id)} title="Delete">
                                                        {/* Trash icon */}
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4h6v2" />
                                                        </svg>
                                                        Delete
                                                    </button>
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
                            <div className="recording-wave-bars">
                                <span className="rwb rwb--1"></span>
                                <span className="rwb rwb--2"></span>
                                <span className="rwb rwb--3"></span>
                                <span className="rwb rwb--4"></span>
                                <span className="rwb rwb--5"></span>
                            </div>
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

                        {/* Input pill: attach + emoji + text */}
                        <div className="chatroom-input-pill">
                            <button
                                type="button"
                                className="chatroom-pill-btn"
                                onClick={handleFileSelect}
                                title="Attach file"
                            >
                                📎
                            </button>

                            <button
                                type="button"
                                className={`chatroom-pill-btn chatroom-pill-btn--emoji ${showEmojiPicker ? 'chatroom-pill-btn--active' : ''}`}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                title="Emoji"
                            >
                                😊
                            </button>

                            <input
                                ref={inputRef}
                                type="text"
                                className="chatroom-pill-input"
                                placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Send / mic button outside the pill */}
                        {isUploading ? (
                            <button type="button" className="chatroom-send-circle chatroom-send-circle--send" disabled>
                                <span className="upload-spinner"></span>
                            </button>
                        ) : (inputMessage.trim() || selectedFile) ? (
                            <button type="submit" className="chatroom-send-circle chatroom-send-circle--send" title="Send">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <path fill="white" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        ) : (
                            <button type="button" className="chatroom-send-circle chatroom-send-circle--mic" onClick={startRecording} title="Record">
                                <svg viewBox="0 0 24 24" width="32" height="32">
                                    <path fill="white" d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
                                    <path fill="white" d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 10z" />
                                </svg>
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
