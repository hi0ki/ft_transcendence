import React, { useState } from 'react';
import './Navbar.css';

interface NavItem {
    id: string;
    label: string;
    icon: string;
    badge?: number;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: 2 },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 3 },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'moderation', label: 'Moderation', icon: '🛡️' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' },
];

interface NavbarProps {
    activeItem?: string;
    onNavigate?: (id: string) => void;
    username?: string;
    onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
    activeItem = 'messages',
    onNavigate,
    username = 'User',
    onLogout,
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNavClick = (id: string) => {
        onNavigate?.(id);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                className="navbar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation"
            >
                <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="navbar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <nav className={`navbar ${mobileOpen ? 'navbar--open' : ''}`}>
                {/* Logo / Brand */}
                <div className="navbar-brand">
                    <div className="navbar-logo">
                        <span className="navbar-logo-icon">💬</span>
                    </div>
                    <div className="navbar-brand-text">
                        <span className="navbar-brand-name">Peer Study Hub</span>
                        <span className="navbar-brand-tagline">Learn Together</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <ul className="navbar-menu">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`navbar-item ${activeItem === item.id ? 'navbar-item--active' : ''}`}
                                onClick={() => handleNavClick(item.id)}
                            >
                                <span className="navbar-item-icon">{item.icon}</span>
                                <span className="navbar-item-label">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className="navbar-item-badge">{item.badge}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* User Profile at Bottom */}
                <div className="navbar-user">
                    <div className="navbar-user-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="navbar-user-info">
                        <span className="navbar-user-name">{username}</span>
                        <span className="navbar-user-status">Online</span>
                    </div>
                    {onLogout && (
                        <button
                            className="navbar-logout-btn"
                            onClick={onLogout}
                            title="Logout"
                        >
                            🚪
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
