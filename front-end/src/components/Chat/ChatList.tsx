import React from 'react';
import type { Room } from '../../services/chatApi';
import './Chat.css';

interface ChatListProps {
    rooms: Room[];
    currentUserId?: string;
    activeRoomId?: string;
    onRoomClick: (room: Room) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    rooms,
    currentUserId,
    activeRoomId,
    onRoomClick,
}) => {
    const getRoomName = (room: Room) => {
        const otherParticipant = room.participants.find(
            (p) => p.socketId !== currentUserId
        );
        return otherParticipant
            ? otherParticipant.username || `User ${otherParticipant.index}`
            : 'Chat Room';
    };

    const getLastMessage = (room: Room) => {
        if (room.messages.length === 0) return 'No messages yet';
        const lastMsg = room.messages[room.messages.length - 1];
        return lastMsg.content.length > 50
            ? lastMsg.content.substring(0, 50) + '...'
            : lastMsg.content;
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diffMs = now.getTime() - msgDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        return msgDate.toLocaleDateString();
    };

    return (
        <div className="chat-list">
            <h3>Conversations ({rooms.length})</h3>
            <div className="rooms-container">
                {rooms.length === 0 ? (
                    <div className="no-rooms">
                        <p>No conversations yet</p>
                        <p className="hint">Click on a user to start chatting</p>
                    </div>
                ) : (
                    rooms.map((room) => (
                        <div
                            key={room.roomId}
                            className={`room-item ${activeRoomId === room.roomId ? 'active' : ''}`}
                            onClick={() => onRoomClick(room)}
                        >
                            <div className="room-avatar">
                                {getRoomName(room)[0].toUpperCase()}
                            </div>
                            <div className="room-info">
                                <div className="room-header">
                                    <div className="room-name">{getRoomName(room)}</div>
                                    <div className="room-time">
                                        {room.messages.length > 0
                                            ? formatTime(room.messages[room.messages.length - 1].timestamp)
                                            : formatTime(room.createdAt)}
                                    </div>
                                </div>
                                <div className="room-last-message">{getLastMessage(room)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;
