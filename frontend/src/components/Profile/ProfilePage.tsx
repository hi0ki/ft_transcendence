import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import { reactionsAPI, REACTION_EMOJI, REACTION_LABELS } from '../../services/reactionsApi';
import { commentsAPI } from '../../services/commentsApi';
import type { ReactionType, ReactionWithUser } from '../../services/reactionsApi';
import CommentsModal from '../Feed/CommentsModal';
import type { Comment } from '../Feed/CommentsModal';
import PostDetailModal from '../Feed/PostDetailModal';
import './ProfilePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// ── Icons ──────────────────────────────────────────────────────────────────
const HeartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
);
const MessageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
const ImageIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD'];
const MAX_CONTENT_LENGTH = 150;

// ── Helpers ─────────────────────────────────────────────────────────────────
function hashStr(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function getBannerGradient(seed: string): string {
    const h1 = hashStr(seed) % 360;
    const h2 = (h1 + 40 + (hashStr(seed + '2') % 80)) % 360;
    return `linear-gradient(135deg, hsl(${h1},70%,40%) 0%, hsl(${h2},80%,55%) 100%)`;
}

function formatTimeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(isoDate).toLocaleDateString();
}

function formatJoined(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fixImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return url;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface BackendPost {
    id: number;
    title: string;
    content: string;
    type: 'HELP' | 'RESOURCE' | 'MEME';
    imageUrl?: string | null;
    contentUrl?: string | null;
    createdAt: string;
}

interface ProfileData {
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    skills?: string[];
    user: {
        id: number;
        email: string;
        role: string;
        createdAt: string;
        posts: BackendPost[];
        friendsCount?: number;
    };
}

type TabType = 'HELP' | 'RESOURCE' | 'MEME';

// ── ProfilePostCard ───────────────────────────────────────────────────────────
interface ProfilePostCardProps {
    post: BackendPost;
    avatarSrc: string;
    username: string;
    isOwner: boolean;
    onDelete?: (postId: number) => void;
    currentUserId: number | null;
    currentUserAvatar: string;
}

const ProfilePostCard: React.FC<ProfilePostCardProps> = ({
    post, avatarSrc, username, isOwner, onDelete, currentUserId, currentUserAvatar
}) => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
    const [reactionCount, setReactionCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const [showReactionsPopup, setShowReactionsPopup] = useState(false);
    const [reactionsUsers, setReactionsUsers] = useState<ReactionWithUser[]>([]);
    const [loadingReactions, setLoadingReactions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const pickerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Show More if content is long OR if post has an image (image will be shown in the modal)
    const isContentTruncated = (post.content && post.content.length > MAX_CONTENT_LENGTH) || !!post.imageUrl;
    const displayContent =
        post.content && post.content.length > MAX_CONTENT_LENGTH
            ? post.content.substring(0, MAX_CONTENT_LENGTH) + '...'
            : post.content;

    useEffect(() => {
        const postId = post.id;
        reactionsAPI.getMyReaction(postId).then(data => {
            if (data && data.type) setMyReaction(data.type);
        }).catch(() => { });

        reactionsAPI.getCount(postId).then(count => {
            if (typeof count === 'number') setReactionCount(count);
        }).catch(() => { });

        commentsAPI.getCommentCount(postId).then(count => {
            if (typeof count === 'number') setCommentCount(count);
        }).catch(() => { });

        reactionsAPI.getReactionsByPost(postId).then(data => {
            setReactionsUsers(data);
        }).catch(() => { });
    }, [post.id]);

    // Lock body scroll when popups open
    useEffect(() => {
        if (showReactionsPopup || showComments) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showReactionsPopup, showComments]);

    const handleReaction = async (type: ReactionType) => {
        setShowPicker(false);
        try {
            if (myReaction === type) {
                setMyReaction(null);
                setReactionCount(prev => Math.max(0, prev - 1));
                await reactionsAPI.toggle(post.id, type);
            } else if (myReaction) {
                setMyReaction(type);
                await reactionsAPI.toggle(post.id, type);
            } else {
                setMyReaction(type);
                setReactionCount(prev => prev + 1);
                await reactionsAPI.toggle(post.id, type);
            }
        } catch {
            setMyReaction(null);
            const count = await reactionsAPI.getCount(post.id).catch(() => 0);
            setReactionCount(count);
        }
        reactionsAPI.getReactionsByPost(post.id).then(data => setReactionsUsers(data)).catch(() => { });
    };

    const handleShowReactionsPopup = async () => {
        setShowReactionsPopup(true);
        setLoadingReactions(true);
        try {
            const data = await reactionsAPI.getReactionsByPost(post.id);
            setReactionsUsers(data);
        } catch {
            setReactionsUsers([]);
        } finally {
            setLoadingReactions(false);
        }
    };

    const handleOpenComments = async () => {
        setShowComments(true);
        try {
            const data = await commentsAPI.getCommentsByPost(post.id);
            if (Array.isArray(data)) {
                setComments(data);
            }
        } catch { }
    };

    const handleAddComment = async (content: string) => {
        try {
            const newC = await commentsAPI.createComment(post.id, content);
            if (newC) {
                setComments(prev => [...prev, newC]);
                setCommentCount(prev => prev + 1);
            }
        } catch { }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await commentsAPI.deleteComment(parseInt(commentId), post.id);
            setComments(prev => prev.filter(c => c.id !== commentId));
            setCommentCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const handleEditComment = async (commentId: string, newContent: string) => {
        try {
            await commentsAPI.updateComment(parseInt(commentId), post.id, newContent);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: newContent } : c));
        } catch { }
    };

    const handleMouseEnter = () => {
        if (pickerTimeout.current) clearTimeout(pickerTimeout.current);
        setShowPicker(true);
    };
    const handleMouseLeave = () => {
        pickerTimeout.current = setTimeout(() => setShowPicker(false), 400);
    };

    return (
        <div className="ppc-card">
            {/* Header */}
            <div className="ppc-header">
                <img
                    src={avatarSrc}
                    alt="avatar"
                    className="ppc-avatar"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
                    }}
                />
                <div className="ppc-author-info">
                    <span className="ppc-author-name">@{username}</span>
                    <span className="ppc-time">{formatTimeAgo(post.createdAt)}</span>
                </div>
                {isOwner && (
                    <button
                        className="ppc-delete-btn"
                        title="Delete post"
                        onClick={() => onDelete && onDelete(post.id)}
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="ppc-content">
                <h4 className="ppc-title">{post.title}</h4>
                {post.content && (
                    <>
                        <p className="ppc-text">{displayContent}</p>
                        {isContentTruncated && (
                            <button className="ppc-show-more" onClick={() => setShowDetailModal(true)}>
                                Show More
                            </button>
                        )}
                    </>
                )}

                {/* Image mention instead of full image */}
                {post.imageUrl && (
                    <div className="ppc-image-mention">
                        <ImageIcon />
                        <span>Image attached</span>
                    </div>
                )}

                {/* Link */}
                {post.contentUrl && (
                    <a
                        href={post.contentUrl.startsWith('http') ? post.contentUrl : `https://${post.contentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ppc-link"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span>{post.contentUrl}</span>
                    </a>
                )}
            </div>

            {/* Inline reactions summary */}
            {reactionsUsers.length > 0 && (
                <div className="ppc-reactions-summary" onClick={handleShowReactionsPopup}>
                    <div className="ppc-reactions-avatars">
                        {reactionsUsers.slice(0, 5).map(r => (
                            <img
                                key={r.userId}
                                src={r.user?.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + r.userId}
                                alt={r.user?.profile?.username || 'User'}
                                className="ppc-reactions-avatar"
                            />
                        ))}
                    </div>
                    <div className="ppc-reactions-emojis">
                        {[...new Set(reactionsUsers.map(r => r.type))].map(type => (
                            <span key={type}>{REACTION_EMOJI[type]}</span>
                        ))}
                    </div>
                    <span className="ppc-reactions-text">
                        {reactionsUsers.length === 1
                            ? (reactionsUsers[0].user?.profile?.username || 'Someone')
                            : reactionsUsers.length <= 3
                                ? reactionsUsers.map(r => r.user?.profile?.username || 'Someone').join(', ')
                                : reactionsUsers.slice(0, 2).map(r => r.user?.profile?.username || 'Someone').join(', ') + ' and ' + (reactionsUsers.length - 2) + ' more'
                        }
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="ppc-actions">
                <div
                    className="ppc-reaction-wrapper"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {showPicker && (
                        <div className="ppc-reaction-picker">
                            {REACTION_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`ppc-reaction-picker-btn ${myReaction === type ? 'active' : ''}`}
                                    onClick={() => handleReaction(type)}
                                    title={REACTION_LABELS[type]}
                                >
                                    <span className="ppc-reaction-emoji">{REACTION_EMOJI[type]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        className={`ppc-action-btn ${myReaction ? 'reacted' : ''}`}
                        onClick={() => handleReaction(myReaction || 'LIKE')}
                    >
                        {myReaction ? (
                            <span className="ppc-reaction-emoji-inline">{REACTION_EMOJI[myReaction]}</span>
                        ) : (
                            <HeartIcon />
                        )}
                        {reactionCount > 0 && (
                            <span
                                className="ppc-count-link"
                                onClick={(e) => { e.stopPropagation(); handleShowReactionsPopup(); }}
                            >
                                {reactionCount}
                            </span>
                        )}
                    </button>
                </div>
                <button className="ppc-action-btn" onClick={handleOpenComments}>
                    <MessageIcon />
                    {commentCount > 0 && <span>{commentCount}</span>}
                </button>
            </div>

            {/* Reactions users popup */}
            {showReactionsPopup && createPortal(
                <div className="reactions-popup-backdrop" onClick={() => setShowReactionsPopup(false)}>
                    <div className="reactions-popup" onClick={e => e.stopPropagation()}>
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
                                reactionsUsers.map(r => (
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
                </div>,
                document.body
            )}

            {/* Comments modal */}
            <CommentsModal
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                comments={comments}
                currentUserAvatar={currentUserAvatar}
                currentUserId={currentUserId}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
            />

            {/* Post detail modal (Show More) — portal so it can't be clipped */}
            {showDetailModal && createPortal(
                <PostDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    post={{
                        title: post.title,
                        author: {
                            name: username,
                            handle: '@' + username,
                            avatar: avatarSrc,
                        },
                        timeAgo: formatTimeAgo(post.createdAt),
                        content: post.content,
                        type: post.type === 'HELP' ? 'Help' : post.type === 'RESOURCE' ? 'Resource' : 'Meme',
                        imageUrl: fixImageUrl(post.imageUrl) || undefined,
                        contentUrl: post.contentUrl || undefined,
                    }}
                />,
                document.body
            )}
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────
function ProfilePage() {
    const { username: urlUsername } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();
    const myUsername = currentUser?.username || currentUser?.email?.split('@')[0] || '';
    const currentUserId = currentUser?.id ? Number(currentUser.id) : null;

    const targetUsername = urlUsername || myUsername;
    const isOwner = !urlUsername || urlUsername === myUsername;

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('HELP');
    const [avatarReady, setAvatarReady] = useState(false);
    const [posts, setPosts] = useState<BackendPost[]>([]);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        setAvatarReady(false);

        const fetchProfile = async () => {
            const data: ProfileData | null = isOwner
                ? await authAPI.getMyProfile() as ProfileData | null
                : await authAPI.getProfile(targetUsername) as ProfileData | null;

            if (!data) setNotFound(true);
            else {
                setProfileData(data);
                setPosts(data.user?.posts || []);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [targetUsername, isOwner]);

    // ── Derived data ─────────────────────────────────────────────────────────
    const username = profileData?.username || targetUsername;
    const bio = profileData?.bio || '';
    const skills = profileData?.skills || [];
    const avatarUrl = fixImageUrl(profileData?.avatarUrl);
    const joinedAt = profileData?.user?.createdAt ? formatJoined(profileData.user.createdAt) : '';
    const filteredPosts = posts.filter(p => p.type === activeTab);
    const bannerGradient = getBannerGradient(username);
    const avatarSrc = getAvatarSrc(avatarUrl, username);

    const currentUserAvatarSrc = getAvatarSrc(
        fixImageUrl(currentUser?.avatarUrl),
        myUsername
    );

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        try {
            const token = authAPI.getToken();
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            } else {
                alert('Failed to delete post');
            }
        } catch {
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '60px 0' }}>
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '60px 0' }}>
                        Profile not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">

                {/* ── Profile Card ── */}
                <div className="profile-card">
                    <div className="profile-banner" style={{ background: bannerGradient }}>
                        <div className="profile-banner-fade" />
                    </div>

                    <div className="profile-avatar-wrap">
                        <img
                            src={avatarSrc}
                            alt="Profile avatar"
                            className="profile-avatar"
                            style={{ opacity: avatarReady ? 1 : 0, transition: 'opacity 0.3s' }}
                            onLoad={() => setAvatarReady(true)}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
                                setAvatarReady(true);
                            }}
                        />
                        <span className="profile-online-badge" aria-label="Online" />
                    </div>

                    <div className="profile-info-row">
                        <div className="profile-meta">
                            <div className="profile-name-row">
                                <h1 className="profile-name">@{username}</h1>
                                <span className="profile-badge" title="Verified member">★</span>
                            </div>
                            {joinedAt && <p className="profile-joined">Member since {joinedAt}</p>}
                            {bio && <p className="profile-bio">{bio}</p>}

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{posts.length}</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{profileData?.user?.friendsCount ?? 0}</span>
                                    <span className="stat-label">Friends</span>
                                </div>
                            </div>

                            {skills.length > 0 && (
                                <div className="profile-skills-section">
                                    <div className="skills-title">Skills</div>
                                    <div className="skills-chips">
                                        {skills.map((skill: string) => (
                                            <span key={skill} className="skill-chip">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="profile-actions">
                            {isOwner ? (
                                <button className="profile-edit-btn" type="button" onClick={() => navigate('/settings')}>
                                    Edit Profile
                                </button>
                            ) : (
                                <button className="profile-follow-btn" type="button">
                                    Follow
                                </button>
                            )}

                            {/* Delete button — only visible to ADMIN, only for non-admin users */}
                            {currentUser?.role === 'ADMIN' && !isOwner && profileData?.user?.role !== 'ADMIN' && (
                                <button
                                    className="profile-delete-btn"
                                    type="button"
                                    onClick={async () => {
                                        if (!window.confirm(`Delete user @${username}? This cannot be undone.`)) return;
                                        const token = authAPI.getToken();
                                        const res = await fetch(`${API_BASE_URL}/api/users/${profileData?.user?.id}`, {
                                            method: 'DELETE',
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        if (res.ok) {
                                            navigate('/home');
                                        } else {
                                            alert('Failed to delete user');
                                        }
                                    }}
                                >
                                    🗑 Delete User
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="profile-tabs">
                    {(['HELP', 'RESOURCE', 'MEME'] as TabType[]).map(tab => {
                        const count = posts.filter(p => p.type === tab).length;
                        const label = tab === 'HELP' ? 'Help' : tab === 'RESOURCE' ? 'Resources' : 'Memes';
                        return (
                            <button
                                key={tab}
                                className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                type="button"
                            >
                                <span className="profile-tab-label">{label}</span>
                                <span className="profile-tab-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Posts ── */}
                <div className="profile-posts">
                    {filteredPosts.length === 0 ? (
                        <div className="ppc-empty">
                            No {activeTab === 'HELP' ? 'help' : activeTab === 'RESOURCE' ? 'resource' : 'meme'} posts yet.
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <ProfilePostCard
                                key={post.id}
                                post={post}
                                avatarSrc={avatarSrc}
                                username={username}
                                isOwner={isOwner}
                                onDelete={handleDeletePost}
                                currentUserId={currentUserId}
                                currentUserAvatar={currentUserAvatarSrc}
                            />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default ProfilePage;
