/**
 * Sanitize utility — XSS protection for user input.
 * 
 * Strips HTML tags and escapes dangerous characters to prevent
 * Cross-Site Scripting (XSS) attacks. Similar to PHP's 
 * htmlspecialchars() + strip_tags().
 */

/**
 * Strip all HTML tags from a string (like PHP's strip_tags).
 */
function stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters (like PHP's htmlspecialchars).
 * Converts: & < > " ' to their HTML entity equivalents.
 */
function escapeHtml(input: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
    };
    return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Full sanitization: strip tags first, then escape remaining special chars.
 * Use this on all user-generated text content before saving to the database.
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return escapeHtml(stripTags(input.trim()));
}
