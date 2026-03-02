import React from 'react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Show up to 5 page numbers centred around current page
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="search-pagination">
            <button
                className="pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ‹ Prev
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    className={`pagination-btn pagination-num ${p === page ? 'pagination-active' : ''}`}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </button>
            ))}

            <button
                className="pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next ›
            </button>
        </div>
    );
};

export default Pagination;
