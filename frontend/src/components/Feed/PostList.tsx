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
            <div className="feed-empty">
                <p>No posts found in this section yet. Be the first to post!</p>
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
