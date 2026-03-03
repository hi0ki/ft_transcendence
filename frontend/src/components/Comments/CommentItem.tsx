import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Comment } from './CommentsModal';

interface CommentItemProps {
    comment:  Comment;
    index:    number;
    isOwner:  boolean;
    onEdit?:  (commentId: string, newContent: string) => void;
    onDelete?: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, index, isOwner, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [showMenu,    setShowMenu]    = useState(false);
    const [isEditing,   setIsEditing]   = useState(false);
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

    const handleSaveEdit = () => {
        if (editContent.trim() && onEdit) onEdit(comment.id, editContent.trim());
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    return (
        <div className="comment-item" style={{ animationDelay: `${index * 0.05}s` }}>
            <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="comment-avatar post-author-clickable"
                onClick={() => {
                    const handle = (comment.author.handle || comment.author.name).replace(/^@/, '');
                    navigate(`/profile/${handle}`);
                }}
            />
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
                                    <circle cx="12" cy="5"  r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="12" cy="19" r="2" />
                                </svg>
                            </button>
                            {showMenu && (
                                <div className="comment-dropdown-menu">
                                    <button
                                        className="comment-dropdown-item"
                                        onClick={() => { setShowMenu(false); setIsEditing(true); setEditContent(comment.content); }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button
                                        className="comment-dropdown-item comment-dropdown-delete"
                                        onClick={() => { setShowMenu(false); onDelete && onDelete(comment.id); }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
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
                            onChange={e => setEditContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter')  handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                        />
                        <div className="comment-edit-actions">
                            <button className="comment-edit-save"   onClick={handleSaveEdit}>Save</button>
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

export default CommentItem;
