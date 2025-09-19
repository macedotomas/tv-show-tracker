import React from 'react';
import { Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTvShowStore } from '../stores/useTvShowStore.jsx';

function TvShowFilters() {
  const { 
    filters, 
    sort,
    setFilters, 
    resetFilters,
    setSortField,
    resetSort,
    getUniqueGenres, 
    getUniqueTypes 
  } = useTvShowStore();

  const uniqueGenres = getUniqueGenres();
  const uniqueTypes = getUniqueTypes();

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'genre', label: 'Genre' },
    { value: 'type', label: 'Type' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'rating', label: 'Rating' }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const hasActiveFilters = filters.genre || filters.type;
  const hasCustomSort = sort.field !== 'title' || sort.direction !== 'asc';

  const getSortIcon = (field) => {
    if (sort.field !== field) return <ArrowUpDown className="size-4" />;
    return sort.direction === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="size-5" />
        <h3 className="text-lg font-semibold">Filter & Sort TV Shows</h3>
        {(hasActiveFilters || hasCustomSort) && (
          <button
            onClick={() => {
              resetFilters();
              resetSort();
            }}
            className="btn btn-ghost btn-sm ml-auto"
            title="Clear all filters and reset sort"
          >
            <X className="size-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Genre Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Genre</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value="">All Genres</option>
            {uniqueGenres.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Type</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Sort by</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={sort.field}
            onChange={(e) => setSortField(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Direction Buttons */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text">Sort Direction</span>
        </label>
        <div className="flex gap-2">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSortField(option.value)}
              className={`btn btn-sm ${
                sort.field === option.value ? 'btn-primary' : 'btn-outline'
              }`}
              title={`Sort by ${option.label} ${sort.field === option.value ? (sort.direction === 'asc' ? 'ascending' : 'descending') : ''}`}
            >
              {getSortIcon(option.value)}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(hasActiveFilters || hasCustomSort) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active:</span>
          {filters.genre && (
            <div className="badge badge-primary gap-2">
              Genre: {filters.genre}
              <button
                onClick={() => handleFilterChange('genre', '')}
                className="btn btn-ghost btn-xs p-0 min-h-0 h-auto"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {filters.type && (
            <div className="badge badge-secondary gap-2">
              Type: {filters.type}
              <button
                onClick={() => handleFilterChange('type', '')}
                className="btn btn-ghost btn-xs p-0 min-h-0 h-auto"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {hasCustomSort && (
            <div className="badge badge-accent gap-2">
              Sort: {sortOptions.find(opt => opt.value === sort.field)?.label} 
              ({sort.direction === 'asc' ? 'A-Z' : 'Z-A'})
              <button
                onClick={resetSort}
                className="btn btn-ghost btn-xs p-0 min-h-0 h-auto"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TvShowFilters;
