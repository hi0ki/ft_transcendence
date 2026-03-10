const API_BASE = (import.meta as any).env?.VITE_API_URL || window.location.origin;

export interface AchievementProgress {
    posts:     number;
    reactions: number;
    comments:  number;
    earned:    string[];
    thresholds: {
        FIRST_POSTER:    number;
        REACTION_MASTER: number;
        COMMENT_KING:    number;
    };
}

export async function getAchievementProgress(
    userId: number,
    // ← removed token parameter, cookie handles auth now
): Promise<AchievementProgress> {
    const res = await fetch(`${API_BASE}/api/achievements/progress/${userId}`, {
        credentials: 'include',                 // ← replaced Authorization header
    });
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
}