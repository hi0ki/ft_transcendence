import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import Pagination from './Pagination';
import PostCard from '../Feed/PostCard';
import PostDetailModal from '../Feed/PostDetailModal';
import type { Post } from '../Feed/PostCard';
import { searchAPI } from '../../services/searchApi';
import type { UserResult } from '../../services/searchApi';
import { getAvatarSrc } from '../../services/authApi';
import './SearchPage.css';
import { useNavigate } from 'react-router-dom';

type SearchTab = 'posts' | 'users';
const LIMIT = 10;

const UserCard: React.FC<{ user: UserResult; onClick: () => void }> = ({ user, onClick }) => {
    const avatarSrc = getAvatarSrc(user.avatarUrl, user.username);
    return (
        <div className="user-card" onClick={onClick}>
            <img
                className="user-card-avatar"
                src={avatarSrc}
                alt={user.username}
                onError={(e) => {
                    (e.target as HTMLImageElement).src =
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;
                }}
            />
            <div className="user-card-info">
                <span className="user-card-username">@{user.username}</span>
                {user.bio && <p className="user-card-bio">{user.bio}</p>}
                {user.skills && user.skills.length > 0 && (
                    <div className="user-card-skills">
                        {user.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="user-card-skill">{skill}</span>
                        ))}
                        {user.skills.length > 4 && (
                            <span className="user-card-skill user-card-skill-more">+{user.skills.length - 4}</span>
                        )}
                    </div>
                )}
            </div>
            <span className="user-card-arrow">›</span>
        </div>
    );
};

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<SearchTab>('posts');
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(1);

    // Post results
    const [results, setResults] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // User results
    const [userResults, setUserResults] = useState<UserResult[]>([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userTotalPages, setUserTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [userHasSearched, setUserHasSearched] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const doPostSearch = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchAPI.search({
                q: query || undefined,
                type: type || undefined,
                sortBy,
                order,
                page: p,
                limit: LIMIT,
            });
            setResults(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
            setPage(res.page);
            setHasSearched(true);
        } catch (e: any) {
            setError(e.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    }, [query, type, sortBy, order]);

    const doUserSearch = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchAPI.searchUsers({
                q: query || undefined,
                page: p,
                limit: LIMIT,
            });
            setUserResults(res.data);
            setUserTotal(res.total);
            setUserTotalPages(res.totalPages);
            setPage(res.page);
            setUserHasSearched(true);
        } catch (e: any) {
            setError(e.message || 'User search failed');
        } finally {
            setLoading(false);
        }
    }, [query]);

    const doSearch = useCallback((p: number) => {
        if (tab === 'posts') doPostSearch(p);
        else doUserSearch(p);
    }, [tab, doPostSearch, doUserSearch]);

    // Re-search when post filters change
    useEffect(() => {
        if (tab === 'posts' && hasSearched) doPostSearch(1);
    }, [type, sortBy, order]);

    // Load posts on initial mount only
    useEffect(() => {
        doPostSearch(1);
    }, []);

    const handleSearch = (_q: string) => {
        doSearch(1);
    };

    const handleFilterChange = (filters: { type?: string; sortBy?: string; order?: string }) => {
        if (filters.type !== undefined) setType(filters.type);
        if (filters.sortBy !== undefined) setSortBy(filters.sortBy);
        if (filters.order !== undefined) setOrder(filters.order);
    };

    const handlePageChange = (p: number) => {
        doSearch(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleShowMore = (post: Post) => {
        setSelectedPost(post);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
    };

    const handleViewPost = (postId: string) => {
        navigate(`/home?postId=${postId}`);
    };

    const handleTabChange = (newTab: SearchTab) => {
        if (newTab !== tab) {
            setQuery('');
            setUserHasSearched(false);
            setHasSearched(false);
            setError(null);
            setTab(newTab);
        }
    };

    const currentTotal = tab === 'posts' ? total : userTotal;
    const currentTotalPages = tab === 'posts' ? totalPages : userTotalPages;
    const showResultsInfo = tab === 'posts' ? hasSearched : userHasSearched;

    return (
        <div className="search-page">
            <div className="search-page-header">
                <h2 className="search-page-title">Search</h2>
            </div>

            {/* Tabs */}
            <div className="search-tabs">
                <button
                    className={`search-tab ${tab === 'posts' ? 'search-tab-active' : ''}`}
                    onClick={() => handleTabChange('posts')}
                >
                    Posts
                </button>
                <button
                    className={`search-tab ${tab === 'users' ? 'search-tab-active' : ''}`}
                    onClick={() => handleTabChange('users')}
                >
                    Users
                </button>
            </div>

            <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder={tab === 'posts' ? 'Search by title or content...' : 'Search by username...'}
            />

            {tab === 'posts' && (
                <SearchFilters
                    type={type}
                    sortBy={sortBy}
                    order={order}
                    onChange={handleFilterChange}
                />
            )}

            {loading && (
                <div className="search-loading">
                    <div className="search-spinner" />
                    <span>Searching...</span>
                </div>
            )}

            {error && <div className="search-error">{error}</div>}

            {!loading && showResultsInfo && (
                <div className="search-results-info">
                    {currentTotal > 0
                        ? `${currentTotal} result${currentTotal > 1 ? 's' : ''} found`
                        : `No results found${query ? ` for "${query}"` : ''}`}
                </div>
            )}

            {/* Post results */}
            {!loading && tab === 'posts' && results.length > 0 && (
                <div className="search-results-list">
                    {results.map((post) => (
                        <div key={post.id} className="search-result-item">
                            <PostCard
                                post={post}
                                readOnly={true}
                                onShowMore={handleShowMore}
                                onViewPost={handleViewPost}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* User results */}
            {!loading && tab === 'users' && userResults.length > 0 && (
                <div className="search-results-list">
                    {userResults.map((user) => (
                        <UserCard
                            key={user.userId}
                            user={user}
                            onClick={() => navigate(`/profile/${user.username}`)}
                        />
                    ))}
                </div>
            )}

            {!loading && currentTotalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={currentTotalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {selectedPost && (
                <PostDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseModal}
                    post={selectedPost}
                />
            )}
        </div>
    );
};

export default SearchPage;
