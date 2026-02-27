import React, { useState, useEffect, useRef } from 'react';
import { reactionsAPI, REACTION_EMOJI, REACTION_LABELS } from '../../services/reactionsApi';
import { commentsAPI } from '../../services/commentsApi';
import type { ReactionType, ReactionWithUser } from '../../services/reactionsApi';
import './PostCard.css';

interface Post {
    id: string;
    author: {
        name: string;
        handle: string;
        avatar: string; // URL to avatar image
    };
    timeAgo: string;
    content: string; // The main text of the post
    tags?: string[];
    likes: number;
    comments: number;
    type?: 'Help' | 'Resource' | 'Meme'; // Badge indication
}

export type { Post };

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    commentCount?: number; // externally controlled comment count
}

const REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD'];

const PostCard: React.FC<PostCardProps> = ({ post, onComment, onShare, commentCount: externalCommentCount }) => {
    const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
    const [reactionCount, setReactionCount] = useState(post.likes);
    const [commentCount, setCommentCount] = useState(post.comments);
    const [showPicker, setShowPicker] = useState(false);
    const [showReactionsPopup, setShowReactionsPopup] = useState(false);
    const [reactionsUsers, setReactionsUsers] = useState<ReactionWithUser[]>([]);
    const [loadingReactions, setLoadingReactions] = useState(false);
    const pickerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

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
        }).catch(() => {});

        reactionsAPI.getCount(postId).then(count => {
            if (typeof count === 'number') setReactionCount(count);
        }).catch(() => {});

        commentsAPI.getCommentCount(postId).then(count => {
            if (typeof count === 'number') setCommentCount(count);
        }).catch(() => {});

        // Fetch reactions list for the inline summary
        reactionsAPI.getReactionsByPost(postId).then(data => {
            setReactionsUsers(data);
        }).catch(() => {});
    }, [post.id]);

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
        }).catch(() => {});
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

            {/* Inline reactions summary — shows who reacted */}
            {reactionsUsers.length > 0 && (
                <div className="reactions-summary" onClick={handleShowReactionsPopup}>
                    <div className="reactions-summary-avatars">
                        {reactionsUsers.slice(0, 5).map((r) => (
                            <img
                                key={r.userId}
                                src={r.user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userId}`}
                                alt={r.user?.profile?.username || 'User'}
                                className="reactions-summary-avatar"
                                title={`${r.user?.profile?.username || 'Unknown'} reacted ${REACTION_LABELS[r.type]}`}
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
                            ? `${reactionsUsers[0].user?.profile?.username || 'Someone'}`
                            : reactionsUsers.length <= 3
                                ? reactionsUsers.map(r => r.user?.profile?.username || 'Someone').join(', ')
                                : `${reactionsUsers.slice(0, 2).map(r => r.user?.profile?.username || 'Someone').join(', ')} and ${reactionsUsers.length - 2} more`
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
                                    className={`reaction-picker-btn ${myReaction === type ? 'active' : ''}`}
                                    onClick={() => handleReaction(type)}
                                    title={REACTION_LABELS[type]}
                                >
                                    <span className="reaction-emoji">{REACTION_EMOJI[type]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        className={`action-btn ${myReaction ? 'reacted' : ''}`}
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
                                            src={r.user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.userId}`}
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
        </div>
    );
};

export default PostCard;
