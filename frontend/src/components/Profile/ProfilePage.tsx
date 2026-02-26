import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import './ProfilePage.css';

const HeartIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const MessageIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const SAMPLE_POSTS = [
    { id: 1, content: 'Can someone help me understand Big O notation?', likes: 12, comments: 8, time: '2 hours ago' },
    { id: 2, content: 'My notes on React Hooks – free download', likes: 45, comments: 12, time: '1 day ago' },
    { id: 3, content: 'Just finished my Data Structures assignment. It was tough but worth it!', likes: 23, comments: 5, time: '3 days ago' },
];

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

function ProfilePage() {
    const { username: urlUsername } = useParams<{ username: string }>();
    const currentUser = authAPI.getCurrentUser();
    const derivedUsername = currentUser?.username || currentUser?.email?.split('@')[0] || 'user';

    const displayUsername = urlUsername || derivedUsername;

    const [profile, setProfile] = useState({
        username: displayUsername,
        bio: 'Computer Science student | Love helping others learn',
        skills: ['JavaScript', 'React', 'Python', 'Data Structures'],
        avatarUrl: null as string | null,
    });

    const [activeTab, setActiveTab] = useState<'help' | 'resources' | 'memes'>('help');

    const isOwner = !urlUsername || urlUsername === derivedUsername;

    // Fetch profile from backend to get real bio, skills, and crucially avatarUrl
    useEffect(() => {
        if (isOwner) {
            authAPI.getMyProfile().then((data) => {
                if (data) {
                    setProfile(prev => ({
                        ...prev,
                        username: data.username || prev.username,
                        bio: data.bio || prev.bio,
                        skills: data.skills || prev.skills,
                        avatarUrl: data.avatarUrl || null,
                    }));
                }
            });
        }
    }, [isOwner]);

    const avatarSrc = getAvatarSrc(profile.avatarUrl, profile.username);
    const bannerGradient = getBannerGradient(displayUsername);

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
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`;
                            }}
                        />
                        <span className="profile-online-badge" aria-label="Online" />
                    </div>

                    <div className="profile-info-row">
                        <div className="profile-meta">
                            <div className="profile-name-row">
                                <h1 className="profile-name">@{profile.username}</h1>
                                <span className="profile-badge" title="Verified member">★</span>
                            </div>
                            <p className="profile-joined">Member since Feb 2025</p>
                            <p className="profile-bio">{profile.bio}</p>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-value">127</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">1.2K</span>
                                    <span className="stat-label">Helped</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">856</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                            </div>

                            {profile.skills.length > 0 && (
                                <div className="profile-skills-section">
                                    <div className="skills-title">Skills</div>
                                    <div className="skills-chips">
                                        {profile.skills.map((skill: string) => (
                                            <span key={skill} className="skill-chip">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buttons — right side */}
                        <div className="profile-actions">
                            {!isOwner && (
                                <button className="profile-follow-btn" type="button">
                                    Follow
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-tabs">
                    {(['help', 'resources', 'memes'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                {activeTab === 'help' && (
                    <div className="profile-posts">
                        {SAMPLE_POSTS.map(post => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        className="post-author-avatar"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`;
                                        }}
                                    />
                                    <div className="post-author-info">
                                        <span className="post-author-name">@{profile.username}</span>
                                        <span className="post-time">{post.time}</span>
                                    </div>
                                    {isOwner && (
                                        <div className="post-owner-actions">
                                            <button className="post-owner-action edit" title="Edit post">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="post-owner-action delete" title="Delete post">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="post-content">{post.content}</p>
                                <div className="post-footer">
                                    <div className="post-actions">
                                        <button className="post-action" type="button">
                                            <HeartIcon /> {post.likes}
                                        </button>
                                        <button className="post-action" type="button">
                                            <MessageIcon /> {post.comments}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="profile-posts">
                        <div className="post-card">
                            <p className="post-content" style={{ color: '#475569', fontStyle: 'italic' }}>
                                No resources shared yet.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'memes' && (
                    <div className="profile-posts">
                        <div className="post-card">
                            <p className="post-content" style={{ color: '#475569', fontStyle: 'italic' }}>
                                No memes shared yet.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
