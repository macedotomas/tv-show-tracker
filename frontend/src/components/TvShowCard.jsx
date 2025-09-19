import { EditIcon, Trash2Icon, Users, Heart } from 'lucide-react'
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
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* TvShow Details */}
      <div className="card-body">

        <h2 className="card-title">{tvShow.title}</h2>
        <p><strong>Genre:</strong> {tvShow.genre}</p>
        <p><strong>Type:</strong> {tvShow.type}</p>
        <p><strong>Release Date:</strong> {new Date(tvShow.release_date).toLocaleDateString()}</p>

        {/* Featured Actors */}
        {tvShow.actors && tvShow.actors.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1 mb-2">
              <Users className="size-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Cast:</span>
            </div>
            <div className="space-y-1">
              {tvShow.actors.slice(0, 2).map(actor => (
                <div 
                  key={actor.actor_id} 
                  className="text-xs text-gray-600"
                  title={actor.biography || `Born: ${actor.birth_date ? new Date(actor.birth_date).toLocaleDateString() : 'Unknown'}`}
                >
                  {actor.name}
                </div>
              ))}
              {tvShow.actors.length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{tvShow.actors.length - 2} more actor{tvShow.actors.length - 2 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Action Buttons */}
        <div className="card-actions justify-end mt-4">
          <button 
            onClick={handleFavoriteToggle}
            className={`btn btn-sm ${isShowFavorite ? 'btn-error' : 'btn-outline'}`}
            title={isShowFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`size-4 ${isShowFavorite ? 'fill-current' : ''}`} />
          </button>
          <Link to={`/tv-shows/${tvShow.show_id}`} className="btn btn-sm btn-info btn-outline">
            <EditIcon className="size-4" />
          </Link>
          <button className="btn btn-sm btn-error btn-outline" onClick={() => deleteTvShow(tvShow.show_id)}>
            <Trash2Icon className="size-4" />
          </button>

        </div>

      </div>

    </div>
  )
}

export default TvShowCard