import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CommentItem from './CommentItem';
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
                            maxLength={500}
                        />
                        <span style={{ fontSize: '11px', color: newComment.length > 450 ? '#ef4444' : '#6b7280', marginRight: '6px', whiteSpace: 'nowrap' }}>
                            {newComment.length}/500
                        </span>
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
