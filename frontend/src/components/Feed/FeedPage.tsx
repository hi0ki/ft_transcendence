import React, { useState, useEffect } from 'react';
import FeedHeader from './FeedHeader';
import FilterTabs from './FilterTabs';
import PostCard from './PostCard';
import type { Post } from './PostCard';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import type { Comment } from './CommentsModal';
import ShareModal from './ShareModal';
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

const CURRENT_USER_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex';

const FeedPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [posts, setPosts] = useState<ExtendedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Interaction Modal States
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);

    useEffect(() => {
        // Simulate API fetch request with small latency mapping
        let isMounted = true;
        setLoading(true);
        setError(null);

        setTimeout(() => {
            if (!isMounted) return;
            try {
                if (activeTab === 'All') {
                    setPosts(MOCK_POSTS);
                } else {
                    const mappedType = activeTab === 'Resources' ? 'Resource' : activeTab === 'Memes' ? 'Meme' : activeTab;
                    setPosts(MOCK_POSTS.filter(post => post.type === mappedType));
                }
            } catch (e) {
                setError('Failed to fetch posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => { isMounted = false; };
    }, [activeTab]);

    const handleCreatePost = (newPostData: { type: string; content: string; tags: string[] }) => {
        const newPost: ExtendedPost = {
            id: Date.now().toString(),
            author: {
                name: 'Alex Johnson', // Using name from Navbar screenshot profile
                handle: '@alexj',
                avatar: CURRENT_USER_AVATAR
            },
            timeAgo: 'Just now',
            content: newPostData.content,
            tags: newPostData.tags.map(t => t.startsWith('#') ? t : `#${t}`),
            likes: 0,
            comments: 0,
            type: newPostData.type as any,
            commentList: []
        };

        // If the current tab is "All" or matches the post type, show it immediately
        if (activeTab === 'All' || activeTab === newPostData.type) {
            setPosts([newPost, ...posts]);
        }

        setIsCreateModalOpen(false);
    };

    const handleLikePost = (postId: string) => {
        // Here we could simulate backend like API call. 
        // PostCard handles visual animation locally via state.
        console.log(`Liked post ${postId}`);
    };

    const handleAddComment = (content: string) => {
        if (!activeCommentPostId) return;

        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === activeCommentPostId) {
                const newCommentObj: Comment = {
                    id: `new-${Date.now()}`,
                    author: {
                        name: 'Alex Johnson',
                        handle: '@alexj',
                        avatar: CURRENT_USER_AVATAR
                    },
                    timeAgo: 'Just now',
                    content: content,
                    likes: 0
                };
                return {
                    ...post,
                    comments: post.comments + 1,
                    commentList: [...post.commentList, newCommentObj]
                };
            }
            return post;
        }));
    };

    const activeCommentPost = posts.find((p: ExtendedPost) => p.id === activeCommentPostId);

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
                            <button onClick={() => setActiveTab('All')}>Retry</button>
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
                onClose={() => setActiveCommentPostId(null)}
                comments={activeCommentPost?.commentList || []}
                currentUserAvatar={CURRENT_USER_AVATAR}
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
