import React from 'react';
import type { User } from '../../services/chatApi';

interface UserListProps {
    users: User[];
    currentUserId?: string;
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick }) => {
    const otherUsers = users.filter((u) => u.socketId !== currentUserId);

    return (
        <div className="user-list">
            <h3>Online Users ({otherUsers.length})</h3>
            <div className="user-items">
                {otherUsers.length === 0 ? (
                    <div className="empty-state">
                        <p>No other users online</p>
                        <p className="hint">Open another tab to see more users</p>
                    </div>
                ) : (
                    otherUsers.map((user) => (
                        <div
                            key={user.socketId}
                            className="user-item"
                            onClick={() => onUserClick(user)}
                        >
                            <div className="user-avatar">
                                {user.index}
                            </div>
                            <div className="user-info">
                                <div className="user-name">User {user.index}</div>
                                <div className="user-status">Online</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;
