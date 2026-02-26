import React, { useState } from 'react';
import './CommentsModal.css';

export interface Comment {
    id: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    timeAgo: string;
    content: string;
    likes: number;
}

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    comments: Comment[];
    currentUserAvatar: string;
    onAddComment?: (content: string) => void;
}

const CommentItem: React.FC<{ comment: Comment, index: number }> = ({ comment, index }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [localLikes, setLocalLikes] = useState(comment.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);
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
                </div>
                <p className="comment-content">{comment.content}</p>
                <button className={`comment-like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                    <svg className={`action-icon ${isLiked ? 'liked' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    {localLikes}
                </button>
            </div>
        </div>
    );
};

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, comments, currentUserAvatar, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

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

    return (
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
                        <CommentItem key={comment.id} comment={comment} index={index} />
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
        </div>
    );
};

export default CommentsModal;
