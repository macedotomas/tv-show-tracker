import React from 'react';
import { Filter, X } from 'lucide-react';
import { useTvShowStore } from '../stores/useTvShowStore.jsx';

function TvShowFilters() {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    getUniqueGenres, 
    getUniqueTypes 
  } = useTvShowStore();

  const uniqueGenres = getUniqueGenres();
  const uniqueTypes = getUniqueTypes();

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const hasActiveFilters = filters.genre || filters.type;

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="size-5" />
        <h3 className="text-lg font-semibold">Filter TV Shows</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="btn btn-ghost btn-sm ml-auto"
            title="Clear all filters"
          >
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
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
        </div>
      )}
    </div>
  );
}

export default TvShowFilters;
