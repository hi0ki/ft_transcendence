import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    user?: {
        email: string;
        profile?: { username?: string; avatarUrl?: string | null };
    };
}

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

    useEffect(() => { fetchPosts(); }, []);

    const handleApprove = async (post: AdminPost) => {
        setBusy(post.id);
        try {
            const res = await fetch(`${API_BASE_URL}/posts/admin/${post.id}/status`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            if (!res.ok) throw new Error('Failed to approve');
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'APPROVED' } : p));
        } catch (e: any) { setError(e.message); }
        finally { setBusy(null); }
    };

    const handleDelete = async (post: AdminPost) => {
        if (!window.confirm(`Delete post "${post.title}"? This cannot be undone.`)) return;
        setBusy(post.id);
        try {
            const res = await fetch(`${API_BASE_URL}/posts/admin/${post.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete');
            setPosts(prev => prev.filter(p => p.id !== post.id));
        } catch (e: any) { setError(e.message); }
        finally { setBusy(null); }
    };

    const pending = posts.filter(p => p.status === 'PENDING');
    const approved = posts.filter(p => p.status === 'APPROVED');
    const displayed = activeTab === 'PENDING' ? pending : approved;

    return (
        <div className="mod-page">
            {/* Header */}
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

            {/* Stats */}
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

            {/* Error */}
            {error && <div className="mod-error">⚠ {error} <button onClick={() => setError(null)}>✕</button></div>}

            {/* Tabs */}
            <div className="mod-tabs">
                <button
                    className={`mod-tab ${activeTab === 'PENDING' ? 'mod-tab--active' : ''}`}
                    onClick={() => setActiveTab('PENDING')}
                >
                    Pending {pending.length > 0 && <span className="mod-tab-count">{pending.length}</span>}
                </button>
                <button
                    className={`mod-tab ${activeTab === 'APPROVED' ? 'mod-tab--active' : ''}`}
                    onClick={() => setActiveTab('APPROVED')}
                >
                    Approved {approved.length > 0 && <span className="mod-tab-count">{approved.length}</span>}
                </button>
            </div>

            {/* Post list */}
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
                                        <img src={getAvatarSrc(post)} alt={username} className="mod-card-avatar" />
                                        <div className="mod-card-author-info">
                                            <span className="mod-card-name">{username}</span>
                                            <span className="mod-card-meta">
                                                @{username.toLowerCase().replace(/\s+/g, '')} · {timeAgo(post.createdAt)}
                                            </span>
                                        </div>
                                        <span className={`mod-type-badge mod-type-badge--${post.type.toLowerCase()}`}>{post.type}</span>
                                    </div>
                                    <span className={`mod-status-badge mod-status-badge--${post.status.toLowerCase()}`}>
                                        {post.status === 'PENDING' ? 'Pending Review' : 'Approved'}
                                    </span>
                                </div>

                                <div className="mod-card-content">
                                    <h3 className="mod-card-title">{post.title}</h3>
                                    <p className="mod-card-body">{post.content}</p>
                                </div>

                                <div className="mod-card-actions">
                                    {post.status === 'PENDING' && (
                                        <button
                                            className="mod-action mod-action--approve"
                                            onClick={() => handleApprove(post)}
                                            disabled={isBusy}
                                        >
                                            <span>✓</span> Approve
                                        </button>
                                    )}
                                    <button
                                        className="mod-action mod-action--delete"
                                        onClick={() => handleDelete(post)}
                                        disabled={isBusy}
                                    >
                                        <span>✕</span> {isBusy ? '…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
