import React from 'react';
import type { User } from '../../services/chatApi';
import './Chat.css';

interface UserListProps {
    users: User[];
    currentUserId?: string;
    onUserClick: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onUserClick }) => {
    const otherUsers = users.filter(u => u.socketId !== currentUserId);

    return (
        <div className="user-list">
            <h3>💬 Available Users ({otherUsers.length})</h3>
            <div className="users-container">
                {otherUsers.length === 0 ? (
                    <div className="no-users">
                        <p>No other users online</p>
                        <p className="hint">Open another browser tab to test</p>
                    </div>
                ) : (
                    otherUsers.map((user) => (
                        <div
                            key={user.socketId}
                            className="user-item"
                        >
                            <div className="user-avatar">
                                {user.username ? user.username[0].toUpperCase() : user.index}
                            </div>
                            <div className="user-info">
                                <div className="user-name">
                                    {user.username || `User ${user.index}`}
                                </div>
                                <div className="user-status">🟢 Online</div>
                            </div>
                            <button
                                className="start-chat-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUserClick(user);
                                }}
                            >
                                💬 Start Chat
                            </button>
                        </div>
                    ))
                )}
            </div>

            {currentUserId && (
                <div className="current-user-info">
                    <div className="current-user-label">You are:</div>
                    <div className="current-user-name">
                        User {users.find(u => u.socketId === currentUserId)?.index}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
