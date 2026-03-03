import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { authAPI } from '../../services/authApi';
import './AdminPage.css';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || window.location.origin;

interface AdminPost {
    id: number;
    title: string;
    content: string;
    type: string;
    status: 'PENDING' | 'APPROVED';
    createdAt: string;
    imageUrl?: string;
    contentUrl?: string;
    tags?: string[];
    user?: {
        email: string;
        profile?: { username?: string; avatarUrl?: string | null };
    };
}

// ── NEW ──
interface AdminUser {
    id: number;
    email: string;
    role: string;
    createdAt: string;
    postCount: number;
    followerCount: number;
    profile?: {
        username?: string;
        avatarUrl?: string | null;
    };
}

const MAX_PREVIEW_LENGTH = 300;

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    return `${d} day${d > 1 ? 's' : ''} ago`;
}

function getAvatarSrc(post: AdminPost) {
    if (post.user?.profile?.avatarUrl) return post.user.profile.avatarUrl;
    const seed = post.user?.profile?.username || post.user?.email?.split('@')[0] || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function getUserAvatarSrc(user: AdminUser) {
    if (user.profile?.avatarUrl) return user.profile.avatarUrl;
    const seed = user.profile?.username || user.email.split('@')[0] || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function formatUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
}

/** Full-post modal rendered in a portal */
function PostDetailModal({ post, onClose }: { post: AdminPost; onClose: () => void }) {
    const username = post.user?.profile?.username || post.user?.email?.split('@')[0] || 'Unknown';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return createPortal(
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content post-detail-modal-content">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Full Post</h2>
                        <p className="modal-subtitle">Complete post content for moderation</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="post-detail-author">
                    <img src={getAvatarSrc(post)} alt={username} className="post-detail-avatar" />
                    <div>
                        <p className="post-detail-name">{username}</p>
                        <p className="post-detail-handle">@{username.toLowerCase().replace(/\s+/g, '')} · {timeAgo(post.createdAt)}</p>
                    </div>
                </div>

                <span className={`mod-type-badge mod-type-badge--${post.type.toLowerCase()}`}>{post.type}</span>

                <div className="post-detail-content">
                    <h3 className="post-detail-title">{post.title}</h3>
                    <p>{post.content}</p>
                </div>

                {post.contentUrl && (
                    <div className="post-content-url">
                        <a href={formatUrl(post.contentUrl)} target="_blank" rel="noopener noreferrer">{post.contentUrl}</a>
                    </div>
                )}

                {post.imageUrl && (
                    <div className="post-image">
                        <img src={post.imageUrl} alt="Post content" style={{ maxWidth: '100%', borderRadius: '8px' }} />
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
        </div>,
        document.body
    );
}

export default function AdminPage() {
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();

    if (!authAPI.isAuthenticated() || currentUser?.role !== 'ADMIN') {
        navigate('/home', { replace: true });
        return null;
    }

    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
    const [busy, setBusy] = useState<number | null>(null);
    const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

    // ── NEW: main tab + users state ──
    const [activeMainTab, setActiveMainTab] = useState<'posts' | 'users'>('posts');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersBusy, setUsersBusy] = useState<number | null>(null);

    const token = authAPI.getToken();

    const fetchPosts = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/posts/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then((data: AdminPost[]) => { setPosts(data); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    };

    // ── NEW ──
    const fetchUsers = () => {
        setUsersLoading(true);
        fetch(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then((response: any) => {
                const users = response.data || response;
                setUsers(users);
                setUsersLoading(false);
            })
            .catch(err => { setError(err.message); setUsersLoading(false); });
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleApprove = async (post: AdminPost) => {
        setBusy(post.id);
        try {
            const res = await fetch(`${API_BASE_URL}/posts/admin/${post.id}/status`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to approve (HTTP ${res.status})`);
            }
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'APPROVED' } : p));
        } catch (e: any) {
            setError(e.message);
        } finally { setBusy(null); }
    };

    const handleDelete = async (post: AdminPost) => {
        if (!window.confirm(`Delete post "${post.title}"? This cannot be undone.`)) return;
        setBusy(post.id);
        try {
            const res = await fetch(`${API_BASE_URL}/posts/admin/${post.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to delete (HTTP ${res.status})`);
            }
            setPosts(prev => prev.filter(p => p.id !== post.id));
        } catch (e: any) {
            setError(e.message);
        } finally { setBusy(null); }
    };

    // ── NEW ──
    const handleChangeRole = async (userId: number, newRole: string) => {
        setUsersBusy(userId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to change role (HTTP ${res.status})`);
            }
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (e: any) {
            setError(e.message);
        } finally { setUsersBusy(null); }
    };

    const pending = posts.filter(p => p.status === 'PENDING');
    const approved = posts.filter(p => p.status === 'APPROVED');
    const displayed = activeTab === 'PENDING' ? pending : approved;

    // ── NEW: Filter users by role ──
    const adminUsers = users.filter(u => u.role === 'ADMIN');
    const regularUsers = users.filter(u => u.role === 'USER');

    return (
        <div className="mod-page">
            {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

            <div className="mod-header">
                <div className="mod-header-left">
                    <div className="mod-title-row">
                        <span className="mod-warning-icon">⚠</span>
                        <h1>Moderation Panel</h1>
                    </div>
                    <p className="mod-subtitle">Review and manage submitted content</p>
                </div>
                {pending.length > 0 && (
                    <div className="mod-pending-badge">{pending.length} pending</div>
                )}
            </div>

            {/* ── NEW: Main tab switcher ── */}
            <div className="mod-tabs" style={{ paddingBottom: '0', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0' }}>
                <button
                    className={`mod-tab ${activeMainTab === 'posts' ? 'mod-tab--active' : ''}`}
                    onClick={() => setActiveMainTab('posts')}
                >
                    Posts
                    {posts.length > 0 && <span className="mod-tab-count">{posts.length}</span>}
                </button>
                <button
                    className={`mod-tab ${activeMainTab === 'users' ? 'mod-tab--active' : ''}`}
                    onClick={() => {
                        setActiveMainTab('users');
                        if (users.length === 0) fetchUsers();
                    }}
                >
                    Users
                    {users.length > 0 && <span className="mod-tab-count">{users.length}</span>}
                </button>
            </div>

            {error && <div className="mod-error">⚠ {error} <button onClick={() => setError(null)}>✕</button></div>}

            {/* ── POSTS SECTION (unchanged) ── */}
            {activeMainTab === 'posts' && (
                <>
                    <div className="mod-stats">
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Total Posts</span>
                            <span className="mod-stat-value">{posts.length}</span>
                            <span className="mod-stat-icon mod-stat-icon--total">⚑</span>
                        </div>
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Pending Review</span>
                            <span className="mod-stat-value mod-stat-value--pending">{pending.length}</span>
                            <span className="mod-stat-icon mod-stat-icon--pending">◉</span>
                        </div>
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Approved</span>
                            <span className="mod-stat-value mod-stat-value--approved">{approved.length}</span>
                            <span className="mod-stat-icon mod-stat-icon--approved">✓</span>
                        </div>
                    </div>

                    <div className="mod-tabs">
                        <button className={`mod-tab ${activeTab === 'PENDING' ? 'mod-tab--active' : ''}`} onClick={() => setActiveTab('PENDING')}>
                            Pending {pending.length > 0 && <span className="mod-tab-count">{pending.length}</span>}
                        </button>
                        <button className={`mod-tab ${activeTab === 'APPROVED' ? 'mod-tab--active' : ''}`} onClick={() => setActiveTab('APPROVED')}>
                            Approved {approved.length > 0 && <span className="mod-tab-count">{approved.length}</span>}
                        </button>
                    </div>

                    <div className="mod-list">
                        {loading ? (
                            <div className="mod-loading"><div className="mod-spinner" /><span>Loading posts…</span></div>
                        ) : displayed.length === 0 ? (
                            <div className="mod-empty">
                                <span className="mod-empty-icon">📭</span>
                                <span>No {activeTab.toLowerCase()} posts</span>
                            </div>
                        ) : (
                            displayed.map(post => {
                                const username = post.user?.profile?.username || post.user?.email?.split('@')[0] || 'Unknown';
                                const isBusy = busy === post.id;

                                return (
                                    <div key={post.id} className="mod-card">
                                        <div className="mod-card-header">
                                            <div className="mod-card-author">
                                                <div
                                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${username}`); }}
                                                >
                                                    <img src={getAvatarSrc(post)} alt={username} className="mod-card-avatar" />
                                                    <div className="mod-card-author-info">
                                                        <span className="mod-card-name">{username}</span>
                                                        <span className="mod-card-meta">
                                                            @{username.toLowerCase().replace(/\s+/g, '')} · {timeAgo(post.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`mod-type-badge mod-type-badge--${post.type.toLowerCase()}`}>{post.type}</span>
                                            </div>
                                            <span className={`mod-status-badge mod-status-badge--${post.status.toLowerCase()}`}>
                                                {post.status === 'PENDING' ? 'Pending Review' : 'Approved'}
                                            </span>
                                        </div>

                                        <div className="mod-card-body-block">
                                            {post.title && <h3 className="mod-card-title">{post.title}</h3>}

                                            {post.content && (
                                                <p className="mod-card-body">
                                                    {post.content.length > MAX_PREVIEW_LENGTH
                                                        ? post.content.substring(0, MAX_PREVIEW_LENGTH) + '…'
                                                        : post.content}
                                                </p>
                                            )}

                                            <div className="mod-card-indicators">
                                                {post.imageUrl && (
                                                    <span className="mod-indicator mod-indicator--image">📷 Has image</span>
                                                )}
                                                {post.contentUrl && (
                                                    <a
                                                        href={formatUrl(post.contentUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mod-indicator mod-indicator--link"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        🔗 {post.contentUrl.length > 50 ? post.contentUrl.substring(0, 50) + '…' : post.contentUrl}
                                                    </a>
                                                )}
                                                {post.tags && post.tags.length > 0 && post.tags.map(tag => (
                                                    <span key={tag} className="mod-tag-pill">{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mod-card-actions">
                                            {post.status === 'PENDING' && (
                                                <button
                                                    className="mod-action mod-action--approve"
                                                    onClick={() => handleApprove(post)}
                                                    disabled={isBusy}
                                                >
                                                    ✓ Approve
                                                </button>
                                            )}
                                            <button
                                                className="mod-action mod-action--delete"
                                                onClick={() => handleDelete(post)}
                                                disabled={isBusy}
                                            >
                                                ✕ {isBusy ? '…' : 'Delete'}
                                            </button>
                                            <button
                                                className="mod-action mod-action--view"
                                                onClick={() => setSelectedPost(post)}
                                            >
                                                👁 View Full Post
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* ── USERS SECTION ── */}
            {activeMainTab === 'users' && (
                <>
                    <div className="mod-stats">
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Total Users</span>
                            <span className="mod-stat-value">{users.length}</span>
                            <span className="mod-stat-icon mod-stat-icon--total">👤</span>
                        </div>
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Admins</span>
                            <span className="mod-stat-value mod-stat-value--approved">
                                {adminUsers.length}
                            </span>
                            <span className="mod-stat-icon mod-stat-icon--approved">★</span>
                        </div>
                        <div className="mod-stat-card">
                            <span className="mod-stat-label">Regular Users</span>
                            <span className="mod-stat-value mod-stat-value--pending">
                                {regularUsers.length}
                            </span>
                            <span className="mod-stat-icon mod-stat-icon--pending">◉</span>
                        </div>
                    </div>

                    <div className="mod-list">
                        {/* Admin Users Section */}
                        {adminUsers.length > 0 && (
                            <div className="mod-user-section">
                                <h3 className="mod-user-section-title">
                                    <span className="mod-user-section-icon">★</span> Admin Users ({adminUsers.length})
                                </h3>
                                <div className="mod-user-list">
                                    {adminUsers.map(user => {
                                        const username = user.profile?.username || user.email.split('@')[0];
                                        const isCurrentUser = user.id === currentUser?.id;

                                        return (
                                            <div key={user.id} className="mod-user-row" onClick={() => navigate(`/profile/${username}`)} style={{ cursor: 'pointer' }}>
                                                <div className="mod-user-identity">
                                                    <img src={getUserAvatarSrc(user)} alt={username} className="mod-user-avatar" />
                                                    <div className="mod-user-info">
                                                        <span className="mod-user-name">
                                                            {username}
                                                            {isCurrentUser && (
                                                                <span className="mod-user-you">(you)</span>
                                                            )}
                                                        </span>
                                                        <span className="mod-user-meta">
                                                            {user.email} · joined {timeAgo(user.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mod-user-stats">
                                                    <div className="mod-user-stat">
                                                        <span className="mod-user-stat-value mod-user-stat-value--posts">{user.postCount}</span>
                                                        <span className="mod-user-stat-label">Posts</span>
                                                    </div>
                                                    <div className="mod-user-stat">
                                                        <span className="mod-user-stat-value mod-user-stat-value--friends">{user.followerCount}</span>
                                                        <span className="mod-user-stat-label">Friends</span>
                                                    </div>
                                                </div>
                                                <span className="mod-user-role mod-user-role--admin">ADMIN</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Regular Users Section */}
                        {regularUsers.length > 0 && (
                            <div className="mod-user-section">
                                <h3 className="mod-user-section-title">
                                    <span className="mod-user-section-icon">◉</span> Regular Users ({regularUsers.length})
                                </h3>
                                <div className="mod-user-list">
                                    {regularUsers.map(user => {
                                        const username = user.profile?.username || user.email.split('@')[0];

                                        return (
                                            <div key={user.id} className="mod-user-row" onClick={() => navigate(`/profile/${username}`)} style={{ cursor: 'pointer' }}>
                                                <div className="mod-user-identity">
                                                    <img src={getUserAvatarSrc(user)} alt={username} className="mod-user-avatar" />
                                                    <div className="mod-user-info">
                                                        <span className="mod-user-name">{username}</span>
                                                        <span className="mod-user-meta">
                                                            {user.email} · joined {timeAgo(user.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mod-user-stats">
                                                    <div className="mod-user-stat">
                                                        <span className="mod-user-stat-value mod-user-stat-value--posts">{user.postCount}</span>
                                                        <span className="mod-user-stat-label">Posts</span>
                                                    </div>
                                                    <div className="mod-user-stat">
                                                        <span className="mod-user-stat-value mod-user-stat-value--friends">{user.followerCount}</span>
                                                        <span className="mod-user-stat-label">Friends</span>
                                                    </div>
                                                </div>
                                                <span className="mod-user-role mod-user-role--user">USER</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {usersLoading && (
                            <div className="mod-loading"><div className="mod-spinner" /><span>Loading users…</span></div>
                        )}

                        {!usersLoading && users.length === 0 && (
                            <div className="mod-empty">
                                <span className="mod-empty-icon">👤</span>
                                <span>No users found</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}