import { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';

/**
 * Subscribe directly to the socketService's internal online-users store.
 * Works in ANY component — no need to prop-drill from App.tsx.
 * Immediately delivers the current list on mount (no render flicker).
 */
export function useOnlineUsers(): number[] {
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);

    useEffect(() => {
        // subscribeOnlineUsers returns an unsubscribe function
        const unsub = socketService.subscribeOnlineUsers(setOnlineUserIds);
        return unsub;
    }, []);

    return onlineUserIds;
}
