import React, { useState, useEffect } from 'react';
import FeedHeader from './FeedHeader';
import FilterTabs from './FilterTabs';
import PostCard from './PostCard';
import type { Post } from './PostCard';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import type { Comment } from './CommentsModal';
import ShareModal from './ShareModal';
import { postsAPI } from '../../services/postsApi';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import './FeedPage.css';

const FeedPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = authAPI.getCurrentUser();
        if (!currentUser) return;

        authAPI.getMyProfile();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const fetchedPosts = await postsAPI.getAllPosts();

                if (!isMounted) return;

                // Filter by active tab
                if (activeTab === 'All') {
                    setPosts(fetchedPosts);
                } else {
                    const mappedType = activeTab === 'Resources' ? 'Resource' : activeTab === 'Memes' ? 'Meme' : activeTab;
                    setPosts(fetchedPosts.filter(post => post.type === mappedType));
                }
            } catch (e: any) {
                if (!isMounted) return;
                setError(e.message || 'Failed to fetch posts. Please try again later.');
                console.error('Error fetching posts:', e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPosts();

        return () => { isMounted = false; };
    }, [activeTab]);

    const handleCreatePost = async (newPostData: { type: string; content: string; tags: string[]; imageUrl?: string; contentUrl?: string }) => {
        try {

            const backendType = newPostData.type.toUpperCase() as 'HELP' | 'RESOURCE' | 'MEME';


            const createdPost = await postsAPI.createPost({
                type: backendType,
                content: newPostData.content,
                imageUrl: newPostData.imageUrl,
                contentUrl: newPostData.contentUrl
            });

            const newPost: Post = {
                ...createdPost,
                tags: newPostData.tags.map(t => t.startsWith('#') ? t : `#${t}`),
            };


            if (activeTab === 'All' || activeTab === newPostData.type) {
                setPosts([newPost, ...posts]);
            }

            setIsCreateModalOpen(false);
        } catch (e: any) {
            console.error('Error creating post:', e);
            alert(e.message || 'Failed to create post. Please try again.');
        }
    };

    const handleLikePost = (postId: string) => {

        console.log(`Liked post ${postId}`);
    };

    const handleAddComment = (content: string) => {
        console.log(`Add comment to post ${activeCommentPostId}: ${content}`);
    };

    return (
        <div className="feed-page">
            <div className="feed-container">
                <FeedHeader onCreatePost={() => setIsCreateModalOpen(true)} />
                <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="feed-content">
                    {loading ? (
                        <div className="feed-loading">
                            <div className="spinner"></div>
                            <p>Loading your feed...</p>
                        </div>
                    ) : error ? (
                        <div className="feed-error">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLikePost}
                                onComment={(id: string) => setActiveCommentPostId(id)}
                                onShare={(id: string) => setActiveSharePostId(id)}
                            />
                        ))
                    ) : (
                        <div className="feed-empty">
                            <p>No posts found in this section yet. Be the first to post a POOOST!</p>
                        </div>
                    )}
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreatePost}
            />

            <CommentsModal
                isOpen={!!activeCommentPostId}
                onClose={() => setActiveCommentPostId(null)}
                comments={[]}
                currentUserAvatar={getAvatarSrc(null, 'me')}
                onAddComment={handleAddComment}
            />

            <ShareModal
                isOpen={!!activeSharePostId}
                onClose={() => setActiveSharePostId(null)}
                postUrl={`http://localhost:8080/post/${activeSharePostId}`}
            />
        </div>
    );
};

export default FeedPage;
