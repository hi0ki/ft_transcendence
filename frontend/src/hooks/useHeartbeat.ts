import { useEffect } from 'react';
import { socketService } from '../services/socketService';

const HEARTBEAT_INTERVAL_MS = 1_000; // 1 second

/**
 * Global hook that sends a heartbeat to the server every second
 * to maintain online status. Must be mounted globally (App.tsx).
 * Sends an immediate heartbeat once the socket is confirmed connected.
 */
export function useHeartbeat(isAuthenticated: boolean) {
    useEffect(() => {
        if (!isAuthenticated) return;

        // Register a one-shot listener for the 'connect' event so we send
        // the first heartbeat the moment the socket is established (avoids
        // the race where isConnected() is still false right after login).
        const onConnect = () => socketService.heartbeat();
        socketService.on('connect', onConnect);

        // Also fire immediately if already connected (e.g. page refresh while
        // still logged in — the socket was already up before this hook ran).
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
