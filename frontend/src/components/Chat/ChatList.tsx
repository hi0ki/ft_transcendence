import React from 'react';
import type { Room } from '../../services/chatApi';

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
    const getOtherParticipant = (room: Room) => {
        return room.participants.find((p) => p.socketId !== currentUserId);
    };

    const getLastMessage = (room: Room) => {
        if (room.messages.length === 0) return 'No messages yet';
        const lastMsg = room.messages[room.messages.length - 1];
        return lastMsg.content;
    };

    return (
        <div className="chat-list">
            <h3>Conversations ({rooms.length})</h3>
            <div className="chat-items">
                {rooms.length === 0 ? (
                    <div className="empty-state">
                        <p>No conversations yet</p>
                        <p className="hint">Click on a user to start chatting</p>
                    </div>
                ) : (
                    rooms.map((room) => {
                        const otherUser = getOtherParticipant(room);
                        const isActive = room.roomId === activeRoomId;

                        return (
                            <div
                                key={room.roomId}
                                className={`chat-item ${isActive ? 'active' : ''}`}
                                onClick={() => onRoomClick(room)}
                            >
                                <div className="chat-avatar">
                                    {otherUser?.index || '?'}
                                </div>
                                <div className="chat-info">
                                    <div className="chat-name">
                                        User {otherUser?.index || 'Unknown'}
                                    </div>
                                    <div className="chat-last-message">
                                        {getLastMessage(room)}
                                    </div>
                                </div>
                                {room.messages.length > 0 && (
                                    <div className="chat-badge">{room.messages.length}</div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatList;
