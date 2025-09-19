import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTvShowStore } from "../stores/useTvShowStore.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EditIcon, Heart, Calendar, Star, Monitor, Tag } from "lucide-react";
import ActorsList from "../components/ActorsList.jsx";
import EpisodesList from "../components/EpisodesList.jsx";

const TvShowViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    currentTvShow,
    loading,
    error,
    fetchTvShow,
    deleteTvShow,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useTvShowStore();

  const isShowFavorite = currentTvShow ? isFavorite(currentTvShow.show_id) : false;

  const handleFavoriteToggle = () => {
    if (currentTvShow) {
      if (isShowFavorite) {
        removeFromFavorites(currentTvShow.show_id);
      } else {
        addToFavorites(currentTvShow.show_id);
      }
    }
  };

  useEffect(() => {
    fetchTvShow(id);
  }, [fetchTvShow, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  if (!currentTvShow) {
    return <div className="text-center mt-4">TV Show not found</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8 bg-base-100 p-6 rounded-lg border border-base-300 shadow-lg">
          <button onClick={() => navigate("/")} className="btn btn-outline hover:btn-neutral">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/tv-shows/${id}/edit`)}
              className="btn btn-primary hover:scale-105 transition-all shadow-lg hover:shadow-primary/25"
            >
              <EditIcon className="size-4 mr-2" />
              Edit Show
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`btn ${isShowFavorite ? 'btn-error' : 'btn-outline btn-neutral'} hover:scale-105 transition-all`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isShowFavorite ? 'fill-current' : ''}`} />
              {isShowFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        </div>

        {/* TV Show Header */}
        <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Title and Basic Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">{currentTvShow.title}</h1>
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg border border-base-300">
                    <div className="bg-blue-500/20 rounded-full p-3">
                      <Monitor className="size-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 uppercase tracking-wide font-medium">Type</div>
                      <div className="font-bold text-blue-400">{currentTvShow.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg border border-base-300">
                    <div className="bg-green-500/20 rounded-full p-3">
                      <Tag className="size-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 uppercase tracking-wide font-medium">Genre</div>
                      <div className="font-bold text-green-400">{currentTvShow.genre}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg border border-base-300">
                    <div className="bg-purple-500/20 rounded-full p-3">
                      <Calendar className="size-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs text-base-content/60 uppercase tracking-wide font-medium">Release Date</div>
                      <div className="font-bold text-purple-400">{formatDate(currentTvShow.release_date)}</div>
                    </div>
                  </div>

                  {currentTvShow.rating && (
                    <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg border border-base-300">
                      <div className="bg-yellow-500/20 rounded-full p-3">
                        <Star className="size-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-xs text-base-content/60 uppercase tracking-wide font-medium">Rating</div>
                        <div className="font-bold text-yellow-400">{currentTvShow.rating}/10</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {currentTvShow.description && (
                  <div className="bg-base-200 p-6 rounded-lg border border-base-300">
                    <h3 className="text-xl font-bold mb-3 text-base-content">Description</h3>
                    <p className="text-base-content/80 leading-relaxed">{currentTvShow.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actors Section */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <ActorsList actors={currentTvShow?.actors} showDetailed={true} />
            </div>
          </div>

          {/* Episodes Section */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <EpisodesList showId={currentTvShow.show_id} showTitle={currentTvShow.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvShowViewPage;
