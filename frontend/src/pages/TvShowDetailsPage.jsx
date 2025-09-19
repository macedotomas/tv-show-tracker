import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useTvShowStore } from "../stores/useTvShowStore.jsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Package2Icon, FileTextIcon, TagIcon, MonitorIcon, CalendarIcon, StarIcon, SaveIcon, Trash2Icon, ChevronDownIcon } from "lucide-react";
import ActorsList from "../components/ActorsList.jsx";

const BASE_URL = "http://localhost:3000";

const TvShowDetails = ({ setAuth }) => {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState(null);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  
  const {
    currentTvShow,
    formData,
    setFormData,
    loading,
    error,
    fetchTvShow,
    updateTvShow,
    deleteTvShow
  } = useTvShowStore();

  const navigate = useNavigate();

  const genreOptions = [
    'Drama', 'Sitcom', 'Animation', 'Miniseries', 'Documentary', 'Sci-Fi',
    'Fantasy', 'Comedy', 'Anime', 'Thriller', 'Action', 'Adventure',
    'Romance', 'Mystery', 'Horror', 'Anthology', 'History'
  ];

  const safeFormData = formData || {
    title: '',
    description: '',
    genre: '',
    type: '',
    release_date: '',
    rating: ''
  };

  const filteredGenres = genreOptions.filter(genre =>
    genre.toLowerCase().includes(safeFormData.genre.toLowerCase())
  );

  const handleGenreSelect = (genre) => {
    setFormData({ ...safeFormData, genre });
    setIsGenreDropdownOpen(false);
  };

  useEffect(() => {
    fetchTvShow(id);
  }, [fetchTvShow, id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setIsGenreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Provide fallback values for formData

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



  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" >
      <button onClick={() => navigate("/")} className="btn btn-ghost mb-8">
        <ArrowLeftIcon className="size-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Edit TvShow</h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateTvShow(id, navigate);
            }} className="space-y-6">

              {/* TV SHOW TITLE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">TV Show Title</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <Package2Icon className="size-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter TV show title"
                    className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200"
                    value={safeFormData.title}
                    onChange={(e) => setFormData({ ...safeFormData, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Description</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-base-content/50">
                    <FileTextIcon className="size-5" />
                  </div>
                  <textarea
                    placeholder="Enter TV show description"
                    className="textarea textarea-bordered w-full pl-10 py-3 focus:textarea-primary transition-colors duration-200 min-h-[100px]"
                    value={safeFormData.description}
                    onChange={(e) => setFormData({ ...safeFormData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* GENRE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Genre</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <TagIcon className="size-5" />
                  </div>
                  <div className="relative" ref={genreDropdownRef}>
                    <input
                      type="text"
                      placeholder="Enter or select genre"
                      className="input input-bordered w-full pl-10 pr-10 py-3 focus:input-primary transition-colors duration-200"
                      value={safeFormData.genre}
                      onChange={(e) => {
                        setFormData({ ...safeFormData, genre: e.target.value });
                        setIsGenreDropdownOpen(true);
                      }}
                      onFocus={() => setIsGenreDropdownOpen(true)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                    >
                      <ChevronDownIcon className={`size-4 transition-transform duration-200 ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isGenreDropdownOpen && filteredGenres.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredGenres.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => handleGenreSelect(genre)}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TYPE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Type</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <MonitorIcon className="size-5" />
                  </div>
                  <select
                    className="select select-bordered w-full pl-10 py-3 focus:select-primary transition-colors duration-200"
                    value={safeFormData.type}
                    onChange={(e) => setFormData({ ...safeFormData, type: e.target.value })}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Series">Series</option>
                    <option value="Movie">Movie</option>
                    <option value="Mini-series">Mini-series</option>
                    <option value="Documentary">Documentary</option>
                  </select>
                </div>
              </div>

              {/* RELEASE DATE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Release Date</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <CalendarIcon className="size-5" />
                  </div>
                  <input
                    type="date"
                    className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200"
                    value={safeFormData.release_date}
                    onChange={(e) => setFormData({ ...safeFormData, release_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* RATING */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Rating</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                    <StarIcon className="size-5" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Enter rating (0-10)"
                    className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors duration-200"
                    value={safeFormData.rating}
                    onChange={(e) => setFormData({ ...safeFormData, rating: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <SaveIcon className="size-5 mr-2" />
                      Update TV Show
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-error btn-outline"
                  onClick={() => {
                      deleteTvShow(id);
                      navigate('/');
                    
                  }}
                >
                  <Trash2Icon className="size-5" />
                </button>
              </div>
              
            </form>

          </div>
        </div>

        {/* Actors Section */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <ActorsList actors={currentTvShow?.actors} showDetailed={true} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default TvShowDetails;
