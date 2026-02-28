import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './CommentsModal.css';

export interface Comment {
    id: string;
    userId?: number;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    timeAgo: string;
    content: string;
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[];
    currentUserAvatar: string;
    currentUserId: number | null;
    onAddComment?: (content: string) => void;
    onEditComment?: (commentId: string, newContent: string) => void;
    onDeleteComment?: (commentId: string) => void;
}

const CommentItem: React.FC<{
    comment: Comment;
    index: number;
    isOwner: boolean;
    onEdit?: (commentId: string, newContent: string) => void;
    onDelete?: (commentId: string) => void;
}> = ({ comment, index, isOwner, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

    const handleEdit = () => {
        setShowMenu(false);
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const handleSaveEdit = () => {
        if (editContent.trim() && onEdit) {
            onEdit(comment.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleDelete = () => {
        setShowMenu(false);
        if (onDelete) onDelete(comment.id);
    };

    return (
        <div className="comment-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <img src={comment.author.avatar} alt={comment.author.name} className="comment-avatar" />
            <div className="comment-body">
                <div className="comment-meta">
                    <span className="comment-author-name">{comment.author.name}</span>
                    <span className="comment-author-handle">{comment.author.handle}</span>
                    <span className="comment-dot">•</span>
                    <span className="comment-time">{comment.timeAgo}</span>
                    {isOwner && (
                        <div className="comment-menu-wrapper" ref={menuRef}>
                            <button
                                className="comment-menu-btn"
                                onClick={() => setShowMenu(!showMenu)}
                                title="Options"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="12" cy="19" r="2" />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="comment-dropdown-menu">
                                    <button className="comment-dropdown-item" onClick={handleEdit}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        Edit
                                    </button>
                                    <button className="comment-dropdown-item comment-dropdown-delete" onClick={handleDelete}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="comment-edit-area">
                        <input
                            className="comment-edit-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
                            autoFocus
                        />
                        <div className="comment-edit-actions">
                            <button className="comment-edit-save" onClick={handleSaveEdit}>Save</button>
                            <button className="comment-edit-cancel" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="comment-content">{comment.content}</p>
                )}
            </div>
        </div>
    );
};

const CommentsModal: React.FC<CommentsModalProps> = ({
    isOpen, onClose, comments, currentUserAvatar, currentUserId,
    onAddComment, onEditComment, onDeleteComment,
}) => {
    const [newComment, setNewComment] = useState('');

    // Lock body scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = () => {
        if (newComment.trim() && onAddComment) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return createPortal(
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="comments-modal-content">
                <div className="comments-header">
                    <h2 className="comments-title">Comments ({comments.length})</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="comments-list">
                    {comments.map((comment, index) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            index={index}
                            isOwner={!!currentUserId && comment.userId === currentUserId}
                            onEdit={onEditComment}
                            onDelete={onDeleteComment}
                        />
                    ))}
                    {comments.length === 0 && (
                        <div className="no-comments">No comments yet. Be the first to share your thoughts!</div>
                    )}
                </div>

                <div className="comments-input-area">
                    <img src={currentUserAvatar} alt="Current User" className="comment-avatar" />
                    <div className="comment-input-wrapper">
                        <input
                            type="text"
                            className="comment-input"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="comment-submit-btn" disabled={!newComment.trim()} onClick={handleSubmit}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CommentsModal;
