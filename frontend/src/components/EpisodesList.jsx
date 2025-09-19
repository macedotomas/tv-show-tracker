import React, { useState, useEffect } from 'react';
import { Calendar, Play, ChevronDown, ChevronUp, Clock, Hash } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

function EpisodesList({ showId, showTitle }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState(new Set());

  useEffect(() => {
    if (showId) {
      fetchEpisodes();
    }
  }, [showId]);

  const fetchEpisodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axios.get(`${BASE_URL}/api/episodes/show/${showId}/seasons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEpisodes(response.data.data);
      
      // Auto-expand first season if it has episodes
      if (response.data.data.length > 0) {
        setExpandedSeasons(new Set([response.data.data[0].season_number]));
      }
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setError('Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeason = (seasonNumber) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-md"></div>
        <span className="ml-2 text-sm text-gray-600">Loading episodes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={fetchEpisodes}
          className="btn btn-sm btn-outline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <Play className="size-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2 text-gray-700">No Episodes Available</h3>
        <p className="text-sm text-gray-500">Episode information is not available for {showTitle}</p>
      </div>
    );
  }

  const totalEpisodes = episodes.reduce((sum, season) => sum + season.episodes.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-3">
          <Play className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Episodes</h2>
          <p className="text-gray-600 text-sm">
            {episodes.length} season{episodes.length !== 1 ? 's' : ''} • {totalEpisodes} episode{totalEpisodes !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Seasons List */}
      <div className="space-y-4">
        {episodes.map((season) => (
          <div key={season.season_number} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Season Header */}
            <button
              onClick={() => toggleSeason(season.season_number)}
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Hash className="size-4 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Season {season.season_number}</h3>
                  <p className="text-sm text-gray-600">{season.episodes.length} episode{season.episodes.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  {expandedSeasons.has(season.season_number) ? 'Hide' : 'Show'} episodes
                </span>
                {expandedSeasons.has(season.season_number) ? (
                  <ChevronUp className="size-5 text-gray-500" />
                ) : (
                  <ChevronDown className="size-5 text-gray-500" />
                )}
              </div>
            </button>

            {/* Episodes List */}
            {expandedSeasons.has(season.season_number) && (
              <div className="divide-y divide-gray-100">
                {season.episodes.map((episode) => (
                  <div key={episode.episode_id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between gap-4">
                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                            E{episode.episode_number}
                          </div>
                          <h4 className="font-medium text-gray-800 truncate">
                            {episode.title}
                          </h4>
                        </div>
                        
                        {/* Episode Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          {episode.release_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              <span>Aired {formatDate(episode.release_date)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>Season {season.season_number}, Episode {episode.episode_number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Episode Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200" title="Play Episode">
                          <Play className="size-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EpisodesList;
