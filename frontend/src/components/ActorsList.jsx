import React from 'react';
import { Users, Calendar, Info, Star } from 'lucide-react';

function ActorsList({ actors, showDetailed = false }) {
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
                  </div>
                  
                  {/* Decorative element */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full p-2">
                      <Star className="size-4 text-primary" />
                    </div>
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
