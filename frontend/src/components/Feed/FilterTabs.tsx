import React from 'react';
import './FilterTabs.css';

interface FilterTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TABS = ['Help', 'Resources', 'Memes', 'All'];

const FilterTabs: React.FC<FilterTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="filter-tabs-container">
            {TABS.map(tab => (
                <button
                    key={tab}
                    className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default FilterTabs;
