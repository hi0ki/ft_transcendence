import { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

export function useOnlineUsers(): number[] {
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    useEffect(() => {
        // subscribeOnlineUsers returns an unsubscribe function
        const unsub = socketService.subscribeOnlineUsers(setOnlineUserIds);
        return unsub;
    }, []);

    return onlineUserIds;
}
