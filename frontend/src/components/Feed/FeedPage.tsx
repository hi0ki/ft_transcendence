import React, { useState, useEffect, useCallback } from 'react';
import FeedHeader from './FeedHeader';
import FilterTabs from './FilterTabs';
import type { Post } from './PostCard';
import PostList from './PostList';
import CreatePostModal from './CreatePostModal';
import PostDetailModal from './PostDetailModal';
import CommentsModal from '../Comments/CommentsModal';
import ShareModal from './ShareModal';
import { postsAPI } from '../../services/postsApi';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import { commentsAPI } from '../../services/commentsApi';
import { useAuth } from '../../auth/authContext';
import './FeedPage.css';
import { useLocation } from 'react-router-dom';

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
        if (posts.length === 0) return;
    
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        if (!postId) return;
    
        // Filter to show only the shared post
        const sharedPost = posts.find(p => p.id === postId);
        if (sharedPost) {
            setPosts([sharedPost]); // ← show only that post
        }
    }, [posts.length]); 
    
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

    const handleCreatePost = async (newPostData: { type: string; title: string; content: string; tags: string[]; imageFile?: File; contentUrl?: string }) => {
        try {

            const backendType = newPostData.type.toUpperCase() as 'HELP' | 'RESOURCE' | 'MEME';


            const createdPost = await postsAPI.createPost({
                type: backendType,
                title: newPostData.title,
                content: newPostData.content,
                imageFile: newPostData.imageFile,
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

    const location = useLocation();

    // Scroll to post if redirected from search
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const postId = params.get('postId');
        if (postId) {
            // Wait for posts to render then scroll
            const tryScroll = (attempts = 0) => {
                const el = document.getElementById(`post-${postId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('post-highlight');
                    setTimeout(() => el.classList.remove('post-highlight'), 2500);
                } else if (attempts < 10) {
                    setTimeout(() => tryScroll(attempts + 1), 300);
                }
            };
            tryScroll();
        }
    }, [location.search]);

    return (
        <div className="feed-page">
            <div className="feed-container">
                <FeedHeader onCreatePost={() => setIsCreateModalOpen(true)} />
                <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="feed-content">
                    <PostList
                        loading={loading}
                        error={error}
                        posts={posts}
                        onShowMore={handleShowMore}
                        onComment={handleOpenComments}
                        onShare={(id) => setActiveSharePostId(id)}
                    />
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
                postUrl={`${window.location.origin}/home?post=${activeSharePostId}`}
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


