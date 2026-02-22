import React from 'react';
import type { Room } from '../../services/chatApi';

interface ChatListProps {
    rooms: Room[];
    currentUserId?: string;
    activeRoomId?: string;
    onRoomClick: (room: Room) => void;
    searchQuery?: string;
}

const ChatList: React.FC<ChatListProps> = ({
    rooms,
    currentUserId,
    activeRoomId,
    onRoomClick,
    searchQuery = '',
}) => {
    const getOtherParticipant = (room: Room) =>
        room.participants.find((p) => p.socketId !== currentUserId);

    const getLastMessage = (room: Room) => {
        if (room.messages.length === 0) return 'No messages yet';
        return room.messages[room.messages.length - 1].content;
    };

    const getTimeAgo = (room: Room) => {
        if (room.messages.length === 0) return '';
        const lastMsg = room.messages[room.messages.length - 1];
        const diff = Date.now() - new Date(lastMsg.timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getName = (room: Room) => {
        const other = getOtherParticipant(room);
        return other?.username || `User ${other?.index || '?'}`;
    };

    const filteredRooms = rooms.filter((room) => {
        if (!searchQuery) return true;
        const name = getName(room).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    if (filteredRooms.length === 0 && rooms.length === 0) return null;

    return (
        <div className="chatlist">
            {filteredRooms.length === 0 ? (
                <div className="chatlist-empty">No conversations found</div>
            ) : (
                filteredRooms.map((room) => {
                    const isActive = room.roomId === activeRoomId;
                    const name = getName(room);
                    const initial = name.charAt(0).toUpperCase();

                    return (
                        <div
                            key={room.roomId}
                            className={`chatlist-item ${isActive ? 'chatlist-item--active' : ''}`}
                            onClick={() => onRoomClick(room)}
                        >
                            <div className="chatlist-avatar">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                                    alt={name}
                                />
                                <span className="chatlist-online-dot"></span>
                            </div>
                            <div className="chatlist-info">
                                <div className="chatlist-top">
                                    <span className="chatlist-name">{name}</span>
                                    <span className="chatlist-time">{getTimeAgo(room)}</span>
                                </div>
                                <p className="chatlist-preview">{getLastMessage(room)}</p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ChatList;
