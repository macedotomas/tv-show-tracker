import { EyeIcon, Trash2Icon, Users, Heart } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { useTvShowStore } from '../stores/useTvShowStore.jsx'

function TvShowCard({ tvShow }) {

  const { deleteTvShow, addToFavorites, removeFromFavorites, isFavorite } = useTvShowStore();
  
  const isShowFavorite = isFavorite(tvShow.show_id);

  const handleFavoriteToggle = () => {
    if (isShowFavorite) {
      removeFromFavorites(tvShow.show_id);
    } else {
      addToFavorites(tvShow.show_id);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/30 hover:bg-base-200">
      {/* TvShow Details */}
      <div className="card-body">

        <h2 className="card-title text-base-content">{tvShow.title}</h2>
        <div className="space-y-2 text-sm">
          <p className="text-base-content/80"><span className="font-semibold text-primary">Genre:</span> {tvShow.genre}</p>
          <p className="text-base-content/80"><span className="font-semibold text-secondary">Type:</span> {tvShow.type}</p>
          <p className="text-base-content/80"><span className="font-semibold text-accent">Release Date:</span> {new Date(tvShow.release_date).toLocaleDateString()}</p>
        </div>

        {/* Featured Actors */}
        {tvShow.actors && tvShow.actors.length > 0 && (
          <div className="mt-4 p-3 bg-base-200 rounded-lg border border-base-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 rounded-full p-1">
                <Users className="size-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">Featured Cast</span>
            </div>
            <div className="space-y-2">
              {tvShow.actors.slice(0, 2).map(actor => (
                <div 
                  key={actor.actor_id} 
                  className="text-xs text-base-content/70 hover:text-base-content transition-colors"
                  title={actor.biography || `Born: ${actor.birth_date ? new Date(actor.birth_date).toLocaleDateString() : 'Unknown'}`}
                >
                  • {actor.name}
                </div>
              ))}
              {tvShow.actors.length > 2 && (
                <div className="text-xs text-base-content/50 italic">
                  +{tvShow.actors.length - 2} more actor{tvShow.actors.length - 2 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Action Buttons */}
        <div className="card-actions justify-end mt-6 pt-4 border-t border-base-300">
          <button 
            onClick={handleFavoriteToggle}
            className={`btn btn-sm ${isShowFavorite ? 'btn-error' : 'btn-outline btn-neutral'} hover:scale-105 transition-transform`}
            title={isShowFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`size-4 ${isShowFavorite ? 'fill-current' : ''}`} />
          </button>
          <Link to={`/tv-shows/${tvShow.show_id}`} className="btn btn-sm btn-primary hover:scale-105 transition-transform" title="View details">
            <EyeIcon className="size-4" />
          </Link>
          <button className="btn btn-sm btn-error btn-outline hover:scale-105 transition-transform" onClick={() => deleteTvShow(tvShow.show_id)} title="Delete show">
            <Trash2Icon className="size-4" />
          </button>
        </div>

      </div>

    </div>
  )
}

export default TvShowCard