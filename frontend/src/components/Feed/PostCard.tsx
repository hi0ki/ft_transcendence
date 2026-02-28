import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { reactionsAPI, REACTION_EMOJI, REACTION_LABELS } from '../../services/reactionsApi';
import { commentsAPI } from '../../services/commentsApi';
import type { ReactionType, ReactionWithUser } from '../../services/reactionsApi';
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
    commentCount?: number;
}

const MAX_CONTENT_LENGTH = 200;
const REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD'];

const PostCard: React.FC<PostCardProps> = ({ post, onComment, onShare, onShowMore, commentCount: externalCommentCount }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
    const [reactionCount, setReactionCount] = useState(post.likes);
    const [commentCount, setCommentCount] = useState(post.comments);
    const [showPicker, setShowPicker] = useState(false);
    const [showReactionsPopup, setShowReactionsPopup] = useState(false);
    const [reactionsUsers, setReactionsUsers] = useState<ReactionWithUser[]>([]);
    const [loadingReactions, setLoadingReactions] = useState(false);
    const pickerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const isContentTruncated = post.content && post.content.length > MAX_CONTENT_LENGTH;
    const displayContent = isContentTruncated
        ? post.content.substring(0, MAX_CONTENT_LENGTH) + '...'
        : post.content;

    // Sync external comment count
    useEffect(() => {
        if (typeof externalCommentCount === 'number') {
            setCommentCount(externalCommentCount);
        }
    }, [externalCommentCount]);

    // Fetch current user's reaction, counts, and reactions list on mount
    useEffect(() => {
        const postId = parseInt(post.id);
        if (isNaN(postId)) return;

        reactionsAPI.getMyReaction(postId).then(data => {
            if (data && data.type) setMyReaction(data.type);
        }).catch(() => { });

        reactionsAPI.getCount(postId).then(count => {
            if (typeof count === 'number') setReactionCount(count);
        }).catch(() => { });

        commentsAPI.getCommentCount(postId).then(count => {
            if (typeof count === 'number') setCommentCount(count);
        }).catch(() => { });

        // Fetch reactions list for the inline summary
        reactionsAPI.getReactionsByPost(postId).then(data => {
            setReactionsUsers(data);
        }).catch(() => { });
    }, [post.id]);

    const formatUrl = (url: string): string => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://' + url;
    };

    const getTypeIcon = (type: string) => {
        if (type === 'Help') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
        if (type === 'Resource') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
        if (type === 'Meme') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
        return null;
    };

    const handleReaction = async (type: ReactionType) => {
        const postId = parseInt(post.id);
        if (isNaN(postId)) return;
        setShowPicker(false);

        try {
            if (myReaction === type) {
                setMyReaction(null);
                setReactionCount(prev => Math.max(0, prev - 1));
                await reactionsAPI.toggle(postId, type);
            } else if (myReaction) {
                setMyReaction(type);
                await reactionsAPI.toggle(postId, type);
            } else {
                setMyReaction(type);
                setReactionCount(prev => prev + 1);
                await reactionsAPI.toggle(postId, type);
            }
        } catch (err) {
            console.error('Failed to toggle reaction:', err);
            setMyReaction(null);
            const count = await reactionsAPI.getCount(postId).catch(() => 0);
            setReactionCount(count);
        }

        // Refresh the reactions list after any toggle
        reactionsAPI.getReactionsByPost(postId).then(data => {
            setReactionsUsers(data);
        }).catch(() => { });
    };

    const handleShowReactionsPopup = async () => {
        const postId = parseInt(post.id);
        if (isNaN(postId)) return;
        setShowReactionsPopup(true);
        setLoadingReactions(true);
        try {
            const data = await reactionsAPI.getReactionsByPost(postId);
            setReactionsUsers(data);
        } catch {
            setReactionsUsers([]);
        } finally {
            setLoadingReactions(false);
        }
    };

    const handleMouseEnter = () => {
        if (pickerTimeout.current) clearTimeout(pickerTimeout.current);
        setShowPicker(true);
    };

    const handleMouseLeave = () => {
        pickerTimeout.current = setTimeout(() => setShowPicker(false), 400);
    };

    return (
        <div className="post-card">
            <div className="post-header-container">
                <div className="post-author-info" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
                    <img
                        src={post.author.avatar || 'https://via.placeholder.com/48'\}
                        alt={post.author.name}
                        className="post-author-avatar"
                        style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="post-author-details" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="post-author-name">{post.author.name}</span>
                        <div className="post-author-meta">
                            <span className="post-author-handle">
                                {post.author.handle?.startsWith('@') ? post.author.handle : '@' + (post.author.handle || post.author.name.toLowerCase().replace(/\s/g, ''))}
                            </span>
                            <span className="post-dot">•</span>
                            <span className="post-time">{post.timeAgo}</span>
                        </div>
                    </div>
                </div>
                {post.type && (
                    <div className={'post-type-badge type-' + post.type.toLowerCase()}>
                        {getTypeIcon(post.type)}
                        {post.type}
                    </div>
                )}
            </div>

            <div className="post-content-container">
                <h3 className="post-title">{post.title}</h3>
                {post.content && <p className="post-text">{displayContent}</p>}
                {isContentTruncated && (
                    <button
                        className="show-more-btn"
                        onClick={() => onShowMore && onShowMore(post)}
                    >
                        Show More
                    </button>
                )}

                {post.contentUrl && (
                    <a href={formatUrl(post.contentUrl)} target="_blank" rel="noopener noreferrer" className="post-link-card">
                        <div className="link-icon-container">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </div>
                        <div className="link-content">
                            <span className="link-url">{post.contentUrl}</span>
                            <span className="link-hint">Click to visit link</span>
                        </div>
                        <div className="link-external-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </div>
                    </a>
                )}

                {post.imageUrl && (
                    <div className="post-image-container" onClick={() => setIsImageModalOpen(true)}>
                        <img src={post.imageUrl} alt="Post content" className="post-image" />
                    </div>
                )}

                {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                        {post.tags.map(tag => (
                            <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Inline reactions summary — shows who reacted */}
            {reactionsUsers.length > 0 && (
                <div className="reactions-summary" onClick={handleShowReactionsPopup}>
                    <div className="reactions-summary-avatars">
                        {reactionsUsers.slice(0, 5).map((r) => (
                            <img
                                key={r.userId}
                                src={r.user?.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + r.userId}
                                alt={r.user?.profile?.username || 'User'}
                                className="reactions-summary-avatar"
                                title={(r.user?.profile?.username || 'Unknown') + ' reacted ' + REACTION_LABELS[r.type]}
                            />
                        ))}
                    </div>
                    <div className="reactions-summary-emojis">
                        {/* Show unique reaction types */}
                        {[...new Set(reactionsUsers.map(r => r.type))].map(type => (
                            <span key={type} className="reactions-summary-emoji">{REACTION_EMOJI[type]}</span>
                        ))}
                    </div>
                    <span className="reactions-summary-text">
                        {reactionsUsers.length === 1
                            ? (reactionsUsers[0].user?.profile?.username || 'Someone')
                            : reactionsUsers.length <= 3
                                ? reactionsUsers.map(r => r.user?.profile?.username || 'Someone').join(', ')
                                : reactionsUsers.slice(0, 2).map(r => r.user?.profile?.username || 'Someone').join(', ') + ' and ' + (reactionsUsers.length - 2) + ' more'
                        }
                    </span>
                </div>
            )}

            <div className="post-actions">
                <div
                    className="reaction-wrapper"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={pickerRef}
                >
                    {showPicker && (
                        <div className="reaction-picker">
                            {REACTION_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={'reaction-picker-btn ' + (myReaction === type ? 'active' : '')}
                                    onClick={() => handleReaction(type)}
                                    title={REACTION_LABELS[type]}
                                >
                                    <span className="reaction-emoji">{REACTION_EMOJI[type]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        className={'action-btn ' + (myReaction ? 'reacted' : '')}
                        onClick={() => handleReaction(myReaction || 'LIKE')}
                    >
                        {myReaction ? (
                            <span className="reaction-emoji-inline">{REACTION_EMOJI[myReaction]}</span>
                        ) : (
                            <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                        )}
                        {reactionCount > 0 && (
                            <span
                                className="reaction-count-link"
                                onClick={(e) => { e.stopPropagation(); handleShowReactionsPopup(); }}
                                title="See who reacted"
                            >
                                {reactionCount}
                            </span>
                        )}
                    </button>
                </div>
                <button className="action-btn" onClick={() => onComment && onComment(post.id)}>
                    <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {commentCount}
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

            {/* Reactions Users Popup */}
            {showReactionsPopup && (
                <div className="reactions-popup-backdrop" onClick={() => setShowReactionsPopup(false)}>
                    <div className="reactions-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="reactions-popup-header">
                            <h3>Reactions</h3>
                            <button className="reactions-popup-close" onClick={() => setShowReactionsPopup(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="reactions-popup-list">
                            {loadingReactions ? (
                                <div className="reactions-popup-loading">Loading...</div>
                            ) : reactionsUsers.length === 0 ? (
                                <div className="reactions-popup-empty">No reactions yet</div>
                            ) : (
                                reactionsUsers.map((r) => (
                                    <div key={r.userId} className="reactions-popup-item">
                                        <img
                                            src={r.user?.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + r.userId}
                                            alt={r.user?.profile?.username || 'User'}
                                            className="reactions-popup-avatar"
                                        />
                                        <span className="reactions-popup-name">
                                            {r.user?.profile?.username || r.user?.email || 'Unknown'}
                                        </span>
                                        <span className="reactions-popup-emoji" title={REACTION_LABELS[r.type]}>
                                            {REACTION_EMOJI[r.type]}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {isImageModalOpen && createPortal(
                <div className="image-modal-backdrop" onClick={() => setIsImageModalOpen(false)}>
                    <button className="image-modal-close" onClick={() => setIsImageModalOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <img src={post.imageUrl} alt="Enlarged content" className="image-modal-content" onClick={e => e.stopPropagation()} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default PostCard;
