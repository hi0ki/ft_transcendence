import React from 'react';
import './PostCard.css';

interface Post {
    id: string;
    title: string;
    author: {
        name: string;
        handle: string;
        avatar: string;
    };
    timeAgo: string;
    content: string;
    tags?: string[];
    likes: number;
    comments: number;
    type?: 'Help' | 'Resource' | 'Meme';
    imageUrl?: string;
    contentUrl?: string;
}

export type { Post };

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    onShowMore?: (post: Post) => void;
}

const MAX_CONTENT_LENGTH = 200;

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare, onShowMore }) => {
    const isContentTruncated = post.content.length > MAX_CONTENT_LENGTH;
    const displayContent = isContentTruncated 
        ? post.content.substring(0, MAX_CONTENT_LENGTH) + '...' 
        : post.content;


    const formatUrl = (url: string): string => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };
    return (
        <div className="post-card">
            <div className="avatar-column">
                <img src={post.author.avatar} alt={post.author.name} className="post-avatar" />
            </div>

            <div className="content-column">
                <div className="post-header">
                    <div className="post-meta">
                        <span className="post-author-name">{post.author.name}</span>
                        <span className="post-dot">•</span>
                        <span className="post-time">{post.timeAgo}</span>
                    </div>
                    {post.type && (
                        <div className={`post-type-badge type-${post.type.toLowerCase()}`}>
                            {post.type === 'Help' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                            {post.type}
                        </div>
                    )}
                </div>

                <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    <p>{displayContent}</p>
                    {isContentTruncated && (
                        <button 
                            className="show-more-btn" 
                            onClick={() => onShowMore && onShowMore(post)}
                        >
                            Show More
                        </button>
                    )}
                </div>

                
                {post.imageUrl && (
                    <div className="post-image">
                        <img src={post.imageUrl} alt="Post content" />
                    </div>
                )}
                {post.contentUrl && (
                    <div className="post-content-url">
                        <a href={formatUrl(post.contentUrl)} target="_blank" rel="noopener noreferrer">
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

                <div className="post-actions">
                    <button className="action-btn" onClick={() => onLike && onLike(post.id)}>
                        <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {post.likes}
                    </button>
                    <button className="action-btn" onClick={() => onComment && onComment(post.id)}>
                        <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {post.comments}
                    </button>
                    <button className="action-btn" onClick={() => onShare && onShare(post.id)}>
                        <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
