export const getAvatarUrl = (avatarUrl: string | null | undefined, name: string): string => {
    // 1. If we have a specific avatar URL in the database profile, use it
    if (avatarUrl && avatarUrl.trim() !== '') {
        // If it's an absolute URL (http... or data:...), use it directly
        if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
            return avatarUrl;
        }

        // If it's a relative path, we need to prefix it so the browser can find it
        // Note: We assume the backend serves these files under /api/uploads/ or similar
        const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
        const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;

        // If the path already includes /api, don't duplicate it
        if (cleanPath.startsWith('/api')) {
            return `${API_BASE_URL}${cleanPath}`;
        }
        return `${API_BASE_URL}/api${cleanPath}`;
    }

    // 2. Fallback: Restore the user's original "avataaars" style from DiceBear
    // We use the username (name) as the seed so it stays consistent for each user
    const seed = encodeURIComponent(name || 'User');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};
