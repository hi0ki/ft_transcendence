import { useEffect } from 'react';
import { socketService } from '../services/socketService';

const HEARTBEAT_INTERVAL_MS = 30_000; // 1 second

/**
 * Global hook that sends a heartbeat to the server every second
 * to maintain online status. Must be mounted globally (App.tsx).
 * Sends an immediate heartbeat once the socket is confirmed connected.
 */
export function useHeartbeat(isAuthenticated: boolean) {
    useEffect(() => {
        if (!isAuthenticated) return;

        const onConnect = () => socketService.heartbeat();
        socketService.on('connect', onConnect);

        if (socketService.isConnected()) {
            socketService.heartbeat();
        }

        const interval = setInterval(() => {
            if (socketService.isConnected()) {
                socketService.heartbeat();
            }
        }, HEARTBEAT_INTERVAL_MS);

        return () => {
            socketService.off('connect', onConnect);
            clearInterval(interval);
        };
    }, [isAuthenticated]);
}
