import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import './ProfilePage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// ── Icons ──────────────────────────────────────────────────────────────────
const HeartIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const MessageIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

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

// ── Component ─────────────────────────────────────────────────────────────────
function ProfilePage() {
    const { username: urlUsername } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();
    const myUsername = currentUser?.username || currentUser?.email?.split('@')[0] || '';

    const targetUsername = urlUsername || myUsername;
    const isOwner = !urlUsername || urlUsername === myUsername;

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('HELP');
    const [avatarReady, setAvatarReady] = useState(false);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        setAvatarReady(false);

        const fetchProfile = async () => {
            const data: ProfileData | null = isOwner
                ? await authAPI.getMyProfile() as ProfileData | null
                : await authAPI.getProfile(targetUsername) as ProfileData | null;

            if (!data) setNotFound(true);
            else setProfileData(data);
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
    const allPosts = profileData?.user?.posts || [];
    const filteredPosts = allPosts.filter(p => p.type === activeTab);
    const bannerGradient = getBannerGradient(username);
    const avatarSrc = getAvatarSrc(avatarUrl, username);

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
                                    <span className="stat-value">{allPosts.length}</span>
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
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="profile-tabs">
                    {(['HELP', 'RESOURCE', 'MEME'] as TabType[]).map(tab => (
                        <button
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                        >
                            {tab === 'HELP' ? 'Help' : tab === 'RESOURCE' ? 'Resources' : 'Memes'}
                            <span className="profile-tab-count">{allPosts.filter(p => p.type === tab).length}</span>
                        </button>
                    ))}
                </div>

                {/* ── Posts ── */}
                <div className="profile-posts">
                    {filteredPosts.length === 0 ? (
                        <div className="post-card">
                            <p className="post-content" style={{ color: '#475569', fontStyle: 'italic' }}>
                                No {activeTab === 'HELP' ? 'help' : activeTab === 'RESOURCE' ? 'resource' : 'meme'} posts yet.
                            </p>
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        className="post-author-avatar"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
                                        }}
                                    />
                                    <div className="post-author-info">
                                        <span className="post-author-name">@{username}</span>
                                        <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                                    </div>
                                    {isOwner && (
                                        <div className="post-owner-actions">
                                            <button className="post-owner-action delete" title="Delete post">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h4 className="post-title-small">{post.title}</h4>
                                <p className="post-content">
                                    {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                                </p>

                                {post.imageUrl && (
                                    <img
                                        src={fixImageUrl(post.imageUrl) || ''}
                                        alt="Post"
                                        className="post-image-preview"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                )}

                                {post.contentUrl && (
                                    <a
                                        href={post.contentUrl.startsWith('http') ? post.contentUrl : `https://${post.contentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="post-link-preview"
                                    >
                                        🔗 {post.contentUrl}
                                    </a>
                                )}

                                <div className="post-footer">
                                    <div className="post-actions">
                                        <button className="post-action" type="button"><HeartIcon /> 0</button>
                                        <button className="post-action" type="button"><MessageIcon /> 0</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default ProfilePage;



// function hashStr(s: string): number {
//     let hash = 0;
//     for (let i = 0; i < s.length; i++) {
//         hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
//     }
//     return Math.abs(hash);
// }

// function getBannerGradient(seed: string): string {
//     const h1 = hashStr(seed) % 360;
//     const h2 = (h1 + 40 + (hashStr(seed + '2') % 80)) % 360;
//     return `linear-gradient(135deg, hsl(${h1},70%,40%) 0%, hsl(${h2},80%,55%) 100%)`;
// }

// function ProfilePage() {
//     const { username: urlUsername } = useParams<{ username: string }>();
//     const currentUser = authAPI.getCurrentUser();
//     const derivedUsername = currentUser?.username || currentUser?.email?.split('@')[0] || 'user';

//     const displayUsername = urlUsername || derivedUsername;

//     const [profile, setProfile] = useState({
//         username: displayUsername,
//         bio: 'Computer Science student | Love helping others learn',
//         skills: ['JavaScript', 'React', 'Python', 'Data Structures'],
//         avatarUrl: null as string | null,
//     });

//     const [activeTab, setActiveTab] = useState<'help' | 'resources' | 'memes'>('help');
//     const [avatarReady, setAvatarReady] = useState(false);

//     const isOwner = !urlUsername || urlUsername === derivedUsername;

//     // Fetch profile from backend to get real bio, skills, and crucially avatarUrl
//     useEffect(() => {
//         if (isOwner) {
//             // Check cache first
//             const cached = sessionStorage.getItem('user_profile');
//             if (cached) {
//                 const parsed = JSON.parse(cached);
//                 setProfile(prev => ({
//                     ...prev,
//                     username: parsed.username || prev.username,
//                     bio: parsed.bio || prev.bio,
//                     skills: parsed.skills || prev.skills,
//                     avatarUrl: parsed.avatarUrl || null,
//                 }));
//                 return;
//             }
    
//             authAPI.getMyProfile().then((data) => {
//                 if (data) {
//                     const profileData = {
//                         username: data.username,
//                         avatarUrl: data.avatarUrl || null,
//                         bio: data.bio,
//                         skills: data.skills,
//                     };
//                     sessionStorage.setItem('user_profile', JSON.stringify(profileData));
//                     setProfile(prev => ({
//                         ...prev,
//                         ...profileData,
//                     }));
//                 }
//             });
//         }
//     }, [isOwner]);

//     const avatarSrc = getAvatarSrc(profile.avatarUrl, profile.username);
//     const bannerGradient = getBannerGradient(displayUsername);

//     return (
//         <div className="profile-page">
//             <div className="profile-container">
//                 {/* ── Profile Card ── */}
//                 <div className="profile-card">
//                     <div className="profile-banner" style={{ background: bannerGradient }}>
//                         <div className="profile-banner-fade" />
//                     </div>

//                     <div className="profile-avatar-wrap">
//                     <img
//                     src={avatarSrc}
//                     alt="Profile avatar"
//                     className="profile-avatar"
//                     style={{ opacity: avatarReady ? 1 : 0, transition: 'opacity 0.2s' }}
//                     onLoad={() => setAvatarReady(true)}
//                     onError={(e) => {
//                         (e.target as HTMLImageElement).src =
//                             `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`;
//                         setAvatarReady(true);
//                     }}
//                 />
//                                         <span className="profile-online-badge" aria-label="Online" />
//                     </div>

//                     <div className="profile-info-row">
//                         <div className="profile-meta">
//                             <div className="profile-name-row">
//                                 <h1 className="profile-name">@{profile.username}</h1>
//                                 <span className="profile-badge" title="Verified member">★</span>
//                             </div>
//                             <p className="profile-joined">Member since Feb 2025</p>
//                             <p className="profile-bio">{profile.bio}</p>

//                             <div className="profile-stats">
//                                 <div className="stat-item">
//                                     <span className="stat-value">127</span>
//                                     <span className="stat-label">Posts</span>
//                                 </div>
//                                 <div className="stat-item">
//                                     <span className="stat-value">1.2K</span>
//                                     <span className="stat-label">Helped</span>
//                                 </div>
//                                 <div className="stat-item">
//                                     <span className="stat-value">856</span>
//                                     <span className="stat-label">Followers</span>
//                                 </div>
//                             </div>

//                             {profile.skills && profile.skills.length > 0 && (
//                                 <div className="profile-skills-section">
//                                     <div className="skills-title">Skills</div>
//                                     <div className="skills-chips">
//                                         {profile.skills.map((skill: string) => (
//                                             <span key={skill} className="skill-chip">{skill}</span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Buttons — right side */}
//                         <div className="profile-actions">
//                             {!isOwner && (
//                                 <button className="profile-follow-btn" type="button">
//                                     Follow
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="profile-tabs">
//                     {(['help', 'resources', 'memes'] as const).map(tab => (
//                         <button
//                             key={tab}
//                             className={`profile-tab ${activeTab === tab ? 'profile-tab--active' : ''}`}
//                             onClick={() => setActiveTab(tab)}
//                             type="button"
//                         >
//                             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                         </button>
//                     ))}
//                 </div>

//                 {/* ── Tab Content ── */}
//                 {activeTab === 'help' && (
//                     <div className="profile-posts">
//                         {SAMPLE_POSTS.map(post => (
//                             <div key={post.id} className="post-card">
//                                 <div className="post-header">
//                                 <img
//                                     src={avatarSrc}
//                                     alt="avatar"
//                                     className="post-author-avatar"
//                                     style={{ opacity: avatarReady ? 1 : 0, transition: 'opacity 0.2s' }}
//                                     onLoad={() => setAvatarReady(true)}
//                                     onError={(e) => {
//                                         (e.target as HTMLImageElement).src =
//                                             `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.username)}`;
//                                         setAvatarReady(true);
//                                     }}
//                                 />
//                                     <div className="post-author-info">
//                                         <span className="post-author-name">@{profile.username}</span>
//                                         <span className="post-time">{post.time}</span>
//                                     </div>
//                                     {isOwner && (
//                                         <div className="post-owner-actions">
//                                             <button className="post-owner-action edit" title="Edit post">
//                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
//                                             </button>
//                                             <button className="post-owner-action delete" title="Delete post">
//                                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <p className="post-content">{post.content}</p>
//                                 <div className="post-footer">
//                                     <div className="post-actions">
//                                         <button className="post-action" type="button">
//                                             <HeartIcon /> {post.likes}
//                                         </button>
//                                         <button className="post-action" type="button">
//                                             <MessageIcon /> {post.comments}
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {activeTab === 'resources' && (
//                     <div className="profile-posts">
//                         <div className="post-card">
//                             <p className="post-content" style={{ color: '#475569', fontStyle: 'italic' }}>
//                                 No resources shared yet.
//                             </p>
//                         </div>
//                     </div>
//                 )}

//                 {activeTab === 'memes' && (
//                     <div className="profile-posts">
//                         <div className="post-card">
//                             <p className="post-content" style={{ color: '#475569', fontStyle: 'italic' }}>
//                                 No memes shared yet.
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ProfilePage;
