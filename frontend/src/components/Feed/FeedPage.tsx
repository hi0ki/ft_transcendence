import React, { useState, useEffect, useCallback } from 'react';
import FeedHeader from './FeedHeader';
import FilterTabs from './FilterTabs';
import PostCard from './PostCard';
import type { Post } from './PostCard';
import CreatePostModal from './CreatePostModal';
import PostDetailModal from './PostDetailModal';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import { postsAPI } from '../../services/postsApi';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import { commentsAPI } from '../../services/commentsApi';
import { useAuth } from '../../auth/authContext';
import './FeedPage.css';

// Extended Mock Data targeting to visually recreate screenshot values including nested comments
interface ExtendedPost extends Post {
    commentList: Comment[];
}

const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


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
                const postsWithComments: ExtendedPost[] = fetchedPosts.map(post => ({
                    ...post,
                    commentList: []
                }));

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

    // Fetch real comments from backend when modal opens
    const fetchComments = useCallback(async (postId: string) => {
        const numericId = parseInt(postId);
        if (isNaN(numericId)) return;

        try {
            const backendComments = await commentsAPI.getCommentsByPost(numericId);
            const commentCount = await commentsAPI.getCommentCount(numericId);
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        commentList: backendComments.map(c => ({
                            id: c.id,
                            userId: c.userId,
                            author: c.author,
                            timeAgo: c.timeAgo,
                            content: c.content,
                        })),
                        comments: commentCount,
                    };
                }
                return post;
            }));
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    }, []);

    const handleOpenComments = useCallback((postId: string) => {
        setActiveCommentPostId(postId);
        fetchComments(postId);
    }, [fetchComments]);

    const handleCreatePost = async (newPostData: { type: string; content: string; tags: string[] }) => {
        try {

            const backendType = newPostData.type.toUpperCase() as 'HELP' | 'RESOURCE' | 'MEME';


            const createdPost = await postsAPI.createPost({
                type: backendType,
                title: newPostData.title,
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

    const handleShowMore = (post: Post) => {
        setSelectedPost(post);
        setIsPostDetailOpen(true);
    };
    const handleAddComment = async (content: string) => {
        if (!activeCommentPostId) return;

        const numericPostId = parseInt(activeCommentPostId);
        if (isNaN(numericPostId)) return;

        try {
            // Create comment via backend API — returns real comment with real user data
            const created = await commentsAPI.createComment(numericPostId, content);

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === activeCommentPostId) {
                    const newCommentObj: Comment = {
                        id: created.id,
                        userId: created.userId,
                        author: created.author,
                        timeAgo: created.timeAgo,
                        content: created.content,
                    };
                    return {
                        ...post,
                        comments: post.comments + 1,
                        commentList: [...post.commentList, newCommentObj]
                    };
                }
                return post;
            }));
        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    const handleEditComment = async (commentId: string, newContent: string) => {
        if (!activeCommentPostId) return;
        const numericPostId = parseInt(activeCommentPostId);
        const numericCommentId = parseInt(commentId);
        if (isNaN(numericPostId) || isNaN(numericCommentId)) return;

        try {
            const updated = await commentsAPI.updateComment(numericCommentId, numericPostId, newContent);
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === activeCommentPostId) {
                    return {
                        ...post,
                        commentList: post.commentList.map(c =>
                            c.id === commentId ? { ...c, content: updated.content } : c
                        ),
                    };
                }
                return post;
            }));
        } catch (err) {
            console.error('Failed to edit comment:', err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!activeCommentPostId) return;
        const numericPostId = parseInt(activeCommentPostId);
        const numericCommentId = parseInt(commentId);
        if (isNaN(numericPostId) || isNaN(numericCommentId)) return;

        try {
            await commentsAPI.deleteComment(numericCommentId, numericPostId);
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === activeCommentPostId) {
                    return {
                        ...post,
                        comments: Math.max(0, post.comments - 1),
                        commentList: post.commentList.filter(c => c.id !== commentId),
                    };
                }
                return post;
            }));
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    // Get the active post for comments modal
    const activeCommentPost = posts.find(p => p.id === activeCommentPostId);

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
                                onShowMore={handleShowMore}
                                key={post.id}
                                post={post}
                                commentCount={post.comments}
                                onComment={(id: string) => handleOpenComments(id)}
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
                comments={activeCommentPost?.commentList || []}
                currentUserAvatar={getAvatarSrc(null, 'me')}
                currentUserId={user?.id ?? null}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
            />

            <ShareModal
                isOpen={!!activeSharePostId}
                onClose={() => setActiveSharePostId(null)}
                postUrl={`http://localhost:8080/post/${activeSharePostId}`}
            />

            {selectedPost && (
                <PostDetailModal
                    isOpen={isPostDetailOpen}
                    onClose={() => {
                        setIsPostDetailOpen(false);
                        setSelectedPost(null);
                    }}
                    post={selectedPost}
                />
            )}
        </div>
    );
};

export default FeedPage;


