import React, { useRef, useEffect } from 'react';

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    onSearch: (v: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch, placeholder = 'Search posts...' }) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        onChange(v);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onSearch(v), 400);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (timerRef.current) clearTimeout(timerRef.current);
            onSearch(value);
        }
    };

    return (
        <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input
                type="text"
                className="search-bar-input"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus
            />
        </div>
    );
};

export default SearchBar;
