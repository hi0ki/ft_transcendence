import React from 'react';
import './PostDetailModal.css';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        author: {
            name: string;
            handle: string;
            avatar: string;
        };
        timeAgo: string;
        content: string;
        type?: 'Help' | 'Resource' | 'Meme';
        imageUrl?: string;
        contentUrl?: string;
        tags?: string[];
    };
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ isOpen, onClose, post }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Post Detail</h2>
                        <p className="modal-subtitle">Full post content</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="post-detail-author">
                    <img src={post.author.avatar} alt={post.author.name} className="post-detail-avatar" />
                    <div>
                        <p className="post-detail-name">{post.author.name}</p>
                        <p className="post-detail-handle">{post.author.handle} • {post.timeAgo}</p>
                    </div>
                </div>

                {post.type && (
                    <div className={`post-type-badge type-${post.type.toLowerCase()}`}>
                        {post.type}
                    </div>
                )}

                <div className="post-detail-content">
                    <p>{post.content}</p>
                </div>

                {post.imageUrl && (
                    <div className="post-image">
                        <img src={post.imageUrl} alt="Post content" />
                    </div>
                )}

                {post.contentUrl && (
                    <div className="post-content-url">
                        <a href={post.contentUrl} target="_blank" rel="noopener noreferrer">
                            {post.contentUrl}
                        </a>
                    </div>
                )}

                {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                        {post.tags.map(tag => (
                            <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="modal-actions">
                    <button className="modal-close-btn-bottom" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
