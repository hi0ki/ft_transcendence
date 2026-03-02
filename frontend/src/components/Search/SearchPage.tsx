import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import Pagination from './Pagination';
import PostCard from '../Feed/PostCard';
import type { Post } from '../Feed/PostCard';
import { searchAPI } from '../../services/searchApi';
import './SearchPage.css';

const LIMIT = 10;

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(1);

    const [results, setResults] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const doSearch = useCallback(async (p: number) => {
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

    // Re-search when filters change (reset to page 1)
    useEffect(() => {
        doSearch(1);
    }, [type, sortBy, order]);

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

    return (
        <div className="search-page">
            <div className="search-page-header">
                <h2 className="search-page-title">Search Posts</h2>
            </div>

            <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="Search by title or content..."
            />

            <SearchFilters
                type={type}
                sortBy={sortBy}
                order={order}
                onChange={handleFilterChange}
            />

            {loading && (
                <div className="search-loading">
                    <div className="search-spinner" />
                    <span>Searching...</span>
                </div>
            )}

            {error && <div className="search-error">{error}</div>}

            {!loading && hasSearched && (
                <div className="search-results-info">
                    {total > 0
                        ? `${total} result${total > 1 ? 's' : ''} found`
                        : `No results found${query ? ` for "${query}"` : ''}`}
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="search-results-list">
                    {results.map((post) => (
                        <PostCard key={post.id} post={post} readOnly={true} />
                    ))}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default SearchPage;
