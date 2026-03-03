import React from 'react';

interface SearchFiltersProps {
    type: string;
    sortBy: string;
    order: string;
    onChange: (filters: { type?: string; sortBy?: string; order?: string }) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ type, sortBy, order, onChange }) => {
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'newest') onChange({ sortBy: 'createdAt', order: 'desc' });
        else if (val === 'oldest') onChange({ sortBy: 'createdAt', order: 'asc' });
        else if (val === 'reactions') onChange({ sortBy: 'reactions', order: 'desc' });
    };

    const sortValue = sortBy === 'reactions' ? 'reactions' : order === 'asc' ? 'oldest' : 'newest';

    return (
        <div className="search-filters">
            <select
                className="search-filter-select"
                value={type}
                onChange={(e) => onChange({ type: e.target.value })}
            >
                <option value="">All Types</option>
                <option value="HELP">Help</option>
                <option value="RESOURCE">Resource</option>
                <option value="MEME">Meme</option>
            </select>

            <select
                className="search-filter-select"
                value={sortValue}
                onChange={handleSortChange}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="reactions">Most Reacted</option>
            </select>
        </div>
    );
};

export default SearchFilters;
