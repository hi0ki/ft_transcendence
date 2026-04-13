import React from 'react';
import PostCard from './PostCard';
import type { Post } from './PostCard';

interface PostListProps {
    loading:    boolean;
    error:      string | null;
    posts:      Post[];
    onShowMore: (post: Post) => void;
    onComment:  (id: string) => void;
    onShare:    (id: string) => void;
}

const PostList: React.FC<PostListProps> = ({
    loading, error, posts, onShowMore, onComment, onShare,
}) => {
    if (loading) {
        return (
            <div className="feed-loading">
                <div className="spinner" />
                <p>Loading your feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="feed-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'rgba(20, 30, 60, 0.4)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '20px' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, marginBottom: '16px', filter: 'drop-shadow(0 0 8px rgba(0, 194, 255, 0.4))' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)' }}>
                    No posts found in this section yet.
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    Be the first to share something amazing!
                </p>
            </div>
        );
    }

    return (
        <>
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    commentCount={post.comments}
                    onShowMore={onShowMore}
                    onComment={onComment}
                    onShare={onShare}
                />
            ))}
        </>
    );
};

export default PostList;
