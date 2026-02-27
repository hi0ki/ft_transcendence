import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import './Navbar.css';

interface NavItemProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isActive: boolean;
    onClick: () => void;
}

const NavItem = ({ label, icon, badge, isActive, onClick }: NavItemProps) => (
    <button
        type="button"
        className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
        onClick={onClick}
    >
        <span className="nav-item-icon">{icon}</span>
        <span className="nav-item-label">{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="nav-item-badge">{badge}</span>
        )}
    </button>
);

interface NavbarProps {
	username: string;
	onLogout: () => void;
	isOpen?: boolean;
	onClose?: () => void;
}

function Navbar({ username, onLogout, isOpen, onClose }: NavbarProps) {
	const location = useLocation();
	const navigate = useNavigate();

	// Read everything directly from the JWT — no API call needed
	const currentUser = authAPI.getCurrentUser();
	const [avatarUrl] = useState<string | null>(currentUser?.avatarUrl ?? null);
	const [profileUsername] = useState<string>(
		currentUser?.username || currentUser?.email?.split('@')[0] || username
	);

	const currentPath = location.pathname;

	const isAdmin = currentUser?.role === 'ADMIN';

	const navItems = [
		{ id: 'home', label: 'Home', icon: <HomeIcon />, path: '/home' },
		{ id: 'search', label: 'Search', icon: <SearchIcon />, path: '/search' },
		{ id: 'messages', label: 'Messages', icon: <MessageIcon />, path: '/chat', badge: 2 },
		{ id: 'notifications', label: 'Notifications', icon: <BellIcon />, path: '/notifications', badge: 3 },
		{ id: 'profile', label: 'Profile', icon: <UserIcon />, path: '/profile' },
		{ id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
		...(isAdmin ? [{ id: 'moderation', label: 'Moderation', icon: <ShieldIcon />, path: '/moderation' }] : []),
	];

	return (
		<aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
			<button className="sidebar-mobile-close" onClick={onClose}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
			</button>
			<div className="sidebar-header">
				<div className="brand-logo">
					<div className="logo-circle">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
					</div>
				</div>
				<div className="brand-text">
					<h1 className="brand-title">Peer Study Hub</h1>
					<p className="brand-tagline">Learn Together</p>
				</div>
			</div>

			<nav className="sidebar-nav">
				{navItems.map((item) => (
					<NavItem
						key={item.id}
						id={item.id}
						label={item.label}
						icon={item.icon}
						badge={item.badge}
						isActive={currentPath === item.path}
						onClick={() => {
							navigate(item.path);
							if (onClose) onClose();
						}}
					/>
				))}
			</nav>

			<div className="sidebar-footer">
				<div className="user-profile-card">
					<div className="user-avatar">
						<img
							src={getAvatarSrc(avatarUrl, profileUsername)}
							alt="avatar"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileUsername)}`;
							}}
						/>
					</div>
					<div className="user-details">
						<span className="user-name">{profileUsername}</span>
						<span className="user-handle">@{profileUsername.toLowerCase().replace(/\s+/g, '')}</span>
					</div>
				</div>
				<button className="logout-standalone" onClick={onLogout}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
}

// Simple icon components
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const MessageIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const ShieldIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;

export default Navbar;
