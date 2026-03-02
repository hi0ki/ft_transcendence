import { useEffect } from 'react';
import { socketService } from '../services/socketService';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Global hook that sends a heartbeat to the server every 30 seconds
 * to maintain online status. Must be mounted globally (App.tsx).
 */
export function useHeartbeat(isAuthenticated: boolean) {
    useEffect(() => {
        if (!isAuthenticated) return;

        // Send initial heartbeat immediately
        if (socketService.isConnected()) {
            socketService.heartbeat();
        }

        const interval = setInterval(() => {
            if (socketService.isConnected()) {
                socketService.heartbeat();
            }
        }, HEARTBEAT_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAuthenticated]);
}
