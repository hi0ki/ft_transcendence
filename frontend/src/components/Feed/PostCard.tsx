import React, { useState, useEffect } from 'react';
import { reactionsAPI, REACTION_EMOJI } from '../../services/reactionsApi';
import type { ReactionType, ReactionWithUser } from '../../services/reactionsApi';
import './PostCard.css';

interface Post {
    id: string;
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
}

export type { Post };

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
}

const REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD'];

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
    const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
    const [localLikes, setLocalLikes] = useState(post.likes);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [reactions, setReactions] = useState<ReactionWithUser[]>([]);
    const [showReactedProfiles, setShowReactedProfiles] = useState(false);

    const getUserId = (): number => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return -1;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch {
            return -1;
        }
    };

    // Load current user's reaction and all reactions on mount
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [myReaction, allReactions] = await Promise.all([
                    reactionsAPI.getMyReaction(parseInt(post.id)),
                    reactionsAPI.getReactionsByPost(parseInt(post.id)),
                ]);
                if (cancelled) return;
                if (myReaction?.type) {
                    setActiveReaction(myReaction.type as ReactionType);
                }
                setReactions(allReactions);
                setLocalLikes(allReactions.length);
            } catch {
                // silent
            }
        };
        load();
        return () => { cancelled = true; };
    }, [post.id]);

    const handleReactionSelect = async (type: ReactionType) => {
        if (reactionLoading) return;
        setReactionLoading(true);
        setShowReactionPicker(false);

        try {
            if (activeReaction === type) {
                // Same reaction clicked → remove it
                await reactionsAPI.toggle(parseInt(post.id), type);
                setActiveReaction(null);
                setLocalLikes(prev => Math.max(0, prev - 1));
                setReactions(prev => prev.filter(r => r.userId !== getUserId()));
            } else if (activeReaction) {
                // Different reaction → update type
                await reactionsAPI.update(parseInt(post.id), type);
                setActiveReaction(type);
                setReactions(prev => prev.map(r =>
                    r.userId === getUserId() ? { ...r, type } : r
                ));
            } else {
                // No reaction yet → create
                const result = await reactionsAPI.toggle(parseInt(post.id), type);
                if (result.action === 'created') {
                    setActiveReaction(type);
                    setLocalLikes(prev => prev + 1);
                    const allReactions = await reactionsAPI.getReactionsByPost(parseInt(post.id));
                    setReactions(allReactions);
                } else if (result.action === 'removed') {
                    setActiveReaction(null);
                    setLocalLikes(prev => Math.max(0, prev - 1));
                    setReactions(prev => prev.filter(r => r.userId !== getUserId()));
                }
            }
        } catch (err) {
            console.error('Error toggling reaction:', err);
        } finally {
            setReactionLoading(false);
        }
    };

    const handleQuickReaction = () => {
        if (activeReaction) {
            // Already reacted → remove it
            handleReactionSelect(activeReaction);
        } else {
            // No reaction → add LIKE
            handleReactionSelect('LIKE');
        }
    };

    // Group reactions by type for the profile display
    const reactionsByType: Record<string, ReactionWithUser[]> = {};
    reactions.forEach(r => {
        if (!reactionsByType[r.type]) reactionsByType[r.type] = [];
        reactionsByType[r.type].push(r);
    });

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author-info">
                    <img src={post.author.avatar} alt={post.author.name} className="post-avatar" />
                    <div className="author-text">
                        <span className="author-name">{post.author.name}</span>
                        <span className="author-handle">{post.author.handle}</span>
                        <span className="post-dot">•</span>
                        <span className="post-time">{post.timeAgo}</span>
                    </div>
                </div>
                {post.type && (
                    <div className={`post-type-badge type-${post.type.toLowerCase()}`}>
                        {post.type === 'Help' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
                        {post.type}
                    </div>
                )}
            </div>

            <div className="post-content">
                <p>{post.content}</p>
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                    {post.tags.map(tag => (
                        <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                </div>
            )}

            {/* Reacted profiles summary — click to expand */}
            {reactions.length > 0 && (
                <div className="reactions-summary" onClick={() => setShowReactedProfiles(!showReactedProfiles)}>
                    <div className="reactions-emoji-row">
                        {Object.keys(reactionsByType).map(type => (
                            <span key={type} className="reaction-summary-emoji" title={`${reactionsByType[type].length} ${type}`}>
                                {REACTION_EMOJI[type as ReactionType]}
                            </span>
                        ))}
                    </div>
                    <span className="reactions-count">
                        {reactions.length} {reactions.length === 1 ? 'reaction' : 'reactions'}
                    </span>
                    <span className="reactions-chevron">{showReactedProfiles ? '▲' : '▼'}</span>
                </div>
            )}

            {/* Expanded reacted profiles panel */}
            {showReactedProfiles && reactions.length > 0 && (
                <div className="reacted-profiles-panel">
                    {Object.entries(reactionsByType).map(([type, users]) => (
                        <div key={type} className="reacted-type-group">
                            <span className="reacted-type-label">{REACTION_EMOJI[type as ReactionType]} {type}</span>
                            <div className="reacted-users-list">
                                {users.map(r => (
                                    <div key={r.userId} className="reacted-user-item">
                                        <img
                                            src={r.user.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userId}`}
                                            alt={r.user.profile?.username || r.user.email}
                                            className="reacted-user-avatar"
                                        />
                                        <span className="reacted-user-name">
                                            {r.user.profile?.username || r.user.email.split('@')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="post-actions">
                <div
                    className="reaction-wrapper"
                    onMouseEnter={() => setShowReactionPicker(true)}
                    onMouseLeave={() => setShowReactionPicker(false)}
                >
                    {showReactionPicker && (
                        <div className="reaction-picker">
                            {REACTION_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`reaction-picker-btn ${activeReaction === type ? 'active' : ''}`}
                                    onClick={() => handleReactionSelect(type)}
                                    title={type}
                                >
                                    {REACTION_EMOJI[type]}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        className={`action-btn ${activeReaction ? 'reacted' : ''}`}
                        onClick={handleQuickReaction}
                    >
                        <span className="reaction-display">
                            {activeReaction ? REACTION_EMOJI[activeReaction] : (
                                <svg className="action-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            )}
                        </span>
                        {localLikes}
                    </button>
                </div>
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
    );
};

export default PostCard;
