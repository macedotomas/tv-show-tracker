import React, { useState } from 'react';
import { Users, Calendar, Info, Star, ChevronDown, ChevronUp, Tv, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

function ActorsList({ actors, showDetailed = false }) {
  const [expandedActors, setExpandedActors] = useState(new Set());
  const [actorTvShows, setActorTvShows] = useState({});
  const [loadingActors, setLoadingActors] = useState(new Set());

  const fetchActorTvShows = async (actorId) => {
    if (actorTvShows[actorId] || loadingActors.has(actorId)) {
      return; // Already fetched or currently loading
    }

    setLoadingActors(prev => new Set([...prev, actorId]));
    
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axios.get(`${BASE_URL}/api/actors/${actorId}/tv-shows`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActorTvShows(prev => ({
        ...prev,
        [actorId]: response.data.data
      }));
    } catch (error) {
      console.error('Error fetching actor TV shows:', error);
      setActorTvShows(prev => ({
        ...prev,
        [actorId]: []
      }));
    } finally {
      setLoadingActors(prev => {
        const newSet = new Set(prev);
        newSet.delete(actorId);
        return newSet;
      });
    }
  };

  const toggleActorExpansion = async (actorId) => {
    const newExpanded = new Set(expandedActors);
    
    if (newExpanded.has(actorId)) {
      newExpanded.delete(actorId);
    } else {
      newExpanded.add(actorId);
      await fetchActorTvShows(actorId);
    }
    
    setExpandedActors(newExpanded);
  };

  if (!actors || actors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <Users className="size-12 text-primary/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Cast Information</h3>
        <p className="text-sm">Actor details are not available for this show</p>
      </div>
    );
  }

  if (!showDetailed) {
    // Simple list view for cards
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-primary/10 rounded-full p-1.5">
            <Users className="size-4 text-primary" />
          </div>
          <h3 className="font-semibold text-primary">Featured Cast</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {actors.slice(0, 4).map(actor => (
            <div 
              key={actor.actor_id} 
              className="group relative"
            >
              <div className="bg-gradient-to-r from-primary/80 to-secondary/80 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                {actor.name}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <div className="font-semibold">{actor.name}</div>
                {actor.birth_date && (
                  <div className="text-gray-300">Born: {new Date(actor.birth_date).toLocaleDateString()}</div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
          {actors.length > 4 && (
            <div className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium">
              +{actors.length - 4} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view for details page
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-full p-3">
          <Users className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Featured Cast</h2>
          <p className="text-gray-600 text-sm">{actors.length} actor{actors.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {actors.map((actor, index) => (
          <div key={actor.actor_id} className="group">
            <div className="card bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/30">
              <div className="card-body p-4">
                <div className="flex items-start gap-4">
                  {/* Actor Avatar/Icon */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                      <Users className="size-8 text-primary" />
                    </div>
                  </div>
                  
                  {/* Actor Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {actor.name}
                        </h3>
                        {index === 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="size-4 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                              Lead Actor
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Birth Date */}
                      {actor.birth_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-blue-100 rounded-full p-1.5">
                            <Calendar className="size-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">Born</div>
                            <div className="text-blue-600 font-semibold">
                              {new Date(actor.birth_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Biography */}
                      {actor.biography && (
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <div className="bg-gray-100 rounded-full p-1.5 mt-0.5">
                              <Info className="size-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-700 text-sm mb-1">Biography</div>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {actor.biography}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Filmography Toggle Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleActorExpansion(actor.actor_id)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium"
                      >
                        <Tv className="size-4" />
                        <span>Filmography</span>
                        {expandedActors.has(actor.actor_id) ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Filmography Section */}
                    {expandedActors.has(actor.actor_id) && (
                      <div className="mt-4 space-y-3">
                        {loadingActors.has(actor.actor_id) ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="loading loading-spinner loading-md"></div>
                            <span className="ml-2 text-sm text-gray-600">Loading filmography...</span>
                          </div>
                        ) : (
                          <>
                            {actorTvShows[actor.actor_id]?.length > 0 ? (
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="bg-purple-100 rounded-full p-1">
                                    <Tv className="size-3 text-purple-600" />
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-700">
                                    TV Shows ({actorTvShows[actor.actor_id].length})
                                  </h4>
                                </div>
                                <div className="grid gap-2 max-h-64 overflow-y-auto">
                                  {actorTvShows[actor.actor_id].map((show) => (
                                    <div
                                      key={show.show_id}
                                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200 group"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <h5 className="font-medium text-gray-800 text-sm truncate">
                                              {show.title}
                                            </h5>
                                            <a
                                              href={`/tv-shows/${show.show_id}`}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                              title="View TV Show Details"
                                            >
                                              <ExternalLink className="size-3 text-gray-500 hover:text-primary" />
                                            </a>
                                          </div>
                                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                              {show.type}
                                            </span>
                                            <span>{show.genre}</span>
                                            {show.release_date && (
                                              <span>
                                                {new Date(show.release_date).getFullYear()}
                                              </span>
                                            )}
                                            {show.rating && (
                                              <div className="flex items-center gap-1">
                                                <Star className="size-3 text-yellow-500 fill-current" />
                                                <span>{show.rating}/10</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <Tv className="size-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No TV shows found for this actor</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActorsList;
