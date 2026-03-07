export const getAvatarUrl = (avatarUrl: string | null | undefined, name: string): string => {
    if (avatarUrl && avatarUrl.trim() !== '') {
        if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
            return avatarUrl;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;
        const cleanPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;

        if (cleanPath.startsWith('/api')) {
            return `${API_BASE_URL}${cleanPath}`;
        }
        return `${API_BASE_URL}/api${cleanPath}`;
    }

    const seed = encodeURIComponent(name || 'User');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};
