import React from 'react';
import type { DBUser } from '../../services/chatApi';
import { getAvatarUrl } from '../../utils/avatarUtils';

interface UserListProps {
    users: DBUser[];
    currentUserId: number | null;
    onlineUserIds: number[];
    onUserClick: (user: DBUser) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onlineUserIds, onUserClick }) => {
    const otherUsers = users.filter((u) => u.id !== currentUserId);

    const getUserDisplayName = (user: DBUser): string => {
        return user.profile?.username || user.email.split('@')[0];
    };

    const isOnline = (userId: number): boolean => {
        return onlineUserIds.includes(userId);
    };

    if (otherUsers.length === 0) return null;

    return (
        <div style={{ paddingBottom: '10px' }}>
            {otherUsers.map((user) => (
                <div
                    key={user.id}
                    className="userlist-item"
                    style={{ margin: '4px 0' }}
                    onClick={() => onUserClick(user)}
                >
                    <div className="userlist-avatar">
                        <img
                            src={getAvatarUrl(user.profile?.avatarUrl, getUserDisplayName(user))}
                            alt={getUserDisplayName(user)}
                        />
                        {isOnline(user.id) && <span className="userlist-online-dot" />}
                    </div>
                    <div>
                        <div className="userlist-name">{getUserDisplayName(user)}</div>
                        <div className="userlist-status" style={!isOnline(user.id) ? { color: '#64748b' } : {}}>
                            {isOnline(user.id) ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserList;
