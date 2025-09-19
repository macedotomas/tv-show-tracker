import React, { useState, useRef, useEffect } from 'react'
import { useTvShowStore } from '../stores/useTvShowStore.jsx'
import { Package2Icon, FileTextIcon, TagIcon, MonitorIcon, CalendarIcon, StarIcon, PlusCircleIcon, ChevronDownIcon } from 'lucide-react'

function AddTvShowModal() {
  const { addProduct: addTvShow, formData, setFormData, loading } = useTvShowStore();
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  
  const genreOptions = [
    'Drama', 'Sitcom', 'Animation', 'Miniseries', 'Documentary', 'Sci-Fi',
    'Fantasy', 'Comedy', 'Anime', 'Thriller', 'Action', 'Adventure',
    'Romance', 'Mystery', 'Horror', 'Anthology', 'History'
  ];

  const filteredGenres = genreOptions.filter(genre =>
    genre.toLowerCase().includes(formData.genre.toLowerCase())
  );

  const handleGenreSelect = (genre) => {
    setFormData({ ...formData, genre });
    setIsGenreDropdownOpen(false);
  };

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

  return (
    <dialog id="add_tvshow_modal" className="modal">
      <div className="modal-box">
        {/* Close button */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        {/* Modal content */}
        <h3 className="font-bold text-lg mb-4">Add New TV Show</h3>
        <form onSubmit={addTvShow} className="space-y-6">
          <div className="grid gap-6">
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>

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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

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
                    value={formData.genre}
                    onChange={(e) => {
                      setFormData({ ...formData, genre: e.target.value });
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
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Series">Series</option>
                  <option value="Movie">Movie</option>
                  <option value="Miniseries">Mini-series</option>
                  <option value="Documentary">Documentary</option>
                </select>
              </div>
            </div>

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
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  required
                />
              </div>
            </div>

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
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => document.getElementById('add_tvshow_modal').close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={!formData.title || !formData.genre || !formData.type || !formData.release_date || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <PlusCircleIcon className="size-5 mr-2" />
                  Add TV Show
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      {/* BACKDROP */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export default AddTvShowModal