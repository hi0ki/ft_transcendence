import React from 'react';
import type { User } from '../../services/chatApi';

interface UserListProps {
    users: User[];
    currentUserId?: string;
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick }) => {
    const otherUsers = users.filter((u) => u.socketId !== currentUserId);

    if (otherUsers.length === 0) return null;

    return (
        <div className="userlist">
            <h4 className="userlist-title">Online Users ({otherUsers.length})</h4>
            {otherUsers.map((user) => {
                const name = user.username || `User ${user.index}`;
                return (
                    <div
                        key={user.socketId}
                        className="userlist-item"
                        onClick={() => onUserClick(user)}
                    >
                        <div className="userlist-avatar">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                                alt={name}
                            />
                            <span className="userlist-online-dot"></span>
                        </div>
                        <div className="userlist-info">
                            <span className="userlist-name">{name}</span>
                            <span className="userlist-status">Online</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserList;
