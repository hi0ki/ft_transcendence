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
import { commentsAPI } from '../../services/commentsApi';
import { authAPI } from '../../services/authApi';
import './FeedPage.css';

// Extended Mock Data targeting to visually recreate screenshot values including nested comments
interface ExtendedPost extends Post {
    commentList: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
    {
        id: 'c1',
        author: {
            name: 'Marcus Lee',
            handle: '@marcusl',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
        },
        timeAgo: '1 hour ago',
        content: 'Big O notation measures the worst-case time complexity. O(1) is constant, O(n) is linear, O(n²) is quadratic. Think of it as how the runtime grows as input size increases!',
        likes: 5
    },
    {
        id: 'c2',
        author: {
            name: 'Sofia Rodriguez',
            handle: '@sofiar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'
        },
        timeAgo: '45 minutes ago',
        content: 'I recommend the book \'Cracking the Coding Interview\' - has great explanations on Big O!',
        likes: 3
    }
];

const MOCK_POSTS: ExtendedPost[] = [
    {
        id: '1',
        author: {
            name: 'Emma Wilson',
            handle: '@emmaw',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
        },
        timeAgo: '2 hours ago',
        content: 'Can someone help me understand Big O notation? I\'m struggling with time complexity analysis.',
        tags: ['#Data Structures', '#Algorithms'],
        likes: 12,
        comments: 2,
        type: 'Help',
        commentList: MOCK_COMMENTS
    },
    {
        id: '2',
        author: {
            name: 'Marcus Lee',
            handle: '@marcusl',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
        },
        timeAgo: '5 hours ago',
        content: 'Just uploaded my complete React hooks cheat sheet! Free for everyone. Includes useState, useEffect, useContext, and custom hooks with examples.',
        tags: ['#React', '#JavaScript', '#Tutorial'],
        likes: 45,
        comments: 1,
        type: 'Resource',
        commentList: [
            {
                id: 'c3',
                author: { name: 'Elena R', handle: '@elenar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
                timeAgo: '2 hours ago',
                content: 'This is amazing! Exactly what I was looking for as I transition from class components.',
                likes: 4
            }
        ]
    },
    {
        id: '3',
        author: {
            name: 'Sofia Rodriguez',
            handle: '@sofiar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'
        },
        timeAgo: '1 day ago',
        content: 'When you finally fix a bug at 3 AM:\n\n"I don\'t know what I did, but it works now" 🎉',
        tags: ['#Funny', '#Programming'],
        likes: 234,
        comments: 2,
        type: 'Meme',
        commentList: [
            {
                id: 'c4',
                author: { name: 'James T', handle: '@jamest', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesD' },
                timeAgo: '20 hours ago',
                content: 'And then you break it again the next morning trying to "clean up the code".',
                likes: 56
            },
            {
                id: 'c5',
                author: { name: 'Sarah Chen', handle: '@sarahc', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                timeAgo: '18 hours ago',
                content: 'Too real 😂',
                likes: 12
            }
        ]
    }
];

const FeedPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [posts, setPosts] = useState<ExtendedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Interaction Modal States
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [activeComments, setActiveComments] = useState<Comment[]>([]);

    // Get current user from JWT
    const currentUser = authAPI.getCurrentUser();
    const currentUserAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'default'}`;

    
    useEffect(() => {
        let isMounted = true;
        
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const fetchedPosts = await postsAPI.getAllPosts();
                
                if (!isMounted) return;

                // Add mock commentList for existing functionality
                const postsWithComments: ExtendedPost[] = fetchedPosts.map(post => ({
                    ...post,
                    commentList: [] // Mock empty comments list (comments service handles this)
                }));

                // Filter by active tab
                if (activeTab === 'All') {
                    setPosts(postsWithComments);
                } else {
                    const mappedType = activeTab === 'Resources' ? 'Resource' : activeTab === 'Memes' ? 'Meme' : activeTab;
                    setPosts(postsWithComments.filter(post => post.type === mappedType));
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

    const handleCreatePost = async (newPostData: { type: string; content: string; tags: string[] }) => {
        try {
            
            const backendType = newPostData.type.toUpperCase() as 'HELP' | 'RESOURCE' | 'MEME';
            
            
            const createdPost = await postsAPI.createPost({
                type: backendType,
                content: newPostData.content
            });

            // Add mock data for comments and tags
            const newPost: ExtendedPost = {
                ...createdPost,
                tags: newPostData.tags.map(t => t.startsWith('#') ? t : `#${t}`), // Keep user's tags visually
                commentList: []
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

    // Fetch comments from backend when opening comments modal
    const handleOpenComments = async (postId: string) => {
        setActiveCommentPostId(postId);
        setCommentsLoading(true);
        try {
            const fetchedComments = await commentsAPI.getCommentsByPost(parseInt(postId));
            setActiveComments(fetchedComments);
        } catch (e: any) {
            console.error('Error fetching comments:', e);
            setActiveComments([]);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async (content: string) => {
        if (!activeCommentPostId || !currentUser) return;

        try {
            const newComment = await commentsAPI.createComment(
                parseInt(activeCommentPostId),
                content
            );

            // Update comments list in the modal
            setActiveComments(prev => [...prev, newComment]);

            // Update comment count on the post card
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === activeCommentPostId) {
                    return {
                        ...post,
                        comments: post.comments + 1,
                        commentList: [...post.commentList, newComment]
                    };
                }
                return post;
            }));
        } catch (e: any) {
            console.error('Error creating comment:', e);
            alert(e.message || 'Failed to add comment.');
        }
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
                                onComment={(id: string) => handleOpenComments(id)}
                                onShare={(id: string) => setActiveSharePostId(id)}
                            />
                        ))
                    ) : (
                        <div className="feed-empty">
                            <p>No posts found in this section yet. Be the first to start a conversation!</p>
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
                onClose={() => { setActiveCommentPostId(null); setActiveComments([]); }}
                comments={activeComments}
                currentUserAvatar={currentUserAvatar}
                onAddComment={handleAddComment}
            />

            <ShareModal
                isOpen={!!activeSharePostId}
                onClose={() => setActiveSharePostId(null)}
                postUrl={`http://localhost:8080/post/${activeSharePostId}`} // Mock sharing link targeting active environment
            />
        </div>
    );
};

export default FeedPage;
