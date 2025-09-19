import { PlusCircle, RefreshCcw } from "lucide-react";
import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTvShowStore } from '../stores/useTvShowStore.jsx';
import TvShowCard from "../components/TvShowCard.jsx";
import { PackageIcon } from "lucide-react";
import AddTvShowModal from "../components/AddTvShowModal.jsx";
import TvShowFilters from "../components/TvShowFilters.jsx";

const Dashboard = ({ setAuth }) => {

  const [name, setName] = useState("");

  const { tvShows, loading, error, fetchTvShows, fetchFavorites, getFilteredTvShows, sort } = useTvShowStore();

  // Get filtered TV shows
  const filteredTvShows = getFilteredTvShows();


  async function getName() {
    try {

      const token = localStorage.getItem("token") || '';

      const response = await fetch("http://localhost:3000/dashboard", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const parseRes = await response.json();

      setName(parseRes.username);


    } catch (err) {
      console.error(err.message);
    }
  }


  useEffect(() => {
    getName();
    fetchTvShows();
    fetchFavorites();
  }, [fetchTvShows, fetchFavorites]);


  const logout = e => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.info("Logged out Successfully!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card">
      
      {/* Header Section */}
      <div className="bg-base-100/10 backdrop-blur-sm border-b border-base-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TV Show Tracker
              </h1>
              <p className="text-base-content/70 mt-1">Welcome back, {name}!</p>
            </div>
            <button onClick={logout} className="btn btn-outline btn-error">
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8 bg-base-100 p-6 rounded-lg border border-base-300 shadow-lg">
          <button className="btn btn-primary btn-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all" onClick={() => document.getElementById('add_tvshow_modal').showModal()}>
            <PlusCircle className="size-5 mr-2" />
            Add TV Show
          </button>
          <button className="btn btn-outline btn-circle hover:btn-neutral hover:scale-105 transition-all" onClick={fetchTvShows} title="Refresh">
            <RefreshCcw className="size-5" />
          </button>
        </div>

        <AddTvShowModal />

        <TvShowFilters />

        {/* Results count */}
        {!loading && tvShows.length > 0 && (
          <div className="mb-6 text-sm text-base-content/70 bg-base-100 p-4 rounded-lg border border-base-300">
            Showing <span className="font-bold text-primary">{filteredTvShows.length}</span> of <span className="font-bold text-secondary">{tvShows.length}</span> TV shows
            {sort.field !== 'title' || sort.direction !== 'asc' ? (
              <span className="ml-2 text-xs bg-base-200 text-base-content px-2 py-1 rounded-full border border-base-300">
                sorted by {sort.field} ({sort.direction === 'asc' ? 'A-Z' : 'Z-A'})
              </span>
            ) : null}
          </div>
        )}

        {error && <div className="alert alert-error mb-8 shadow-lg">Error: {error}</div>}

        {filteredTvShows.length === 0 && !loading && (
          <div className="flex flex-col justify-center items-center h-96 space-y-6 bg-base-100 rounded-lg border border-base-300 shadow-lg">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full p-8">
              <PackageIcon className="size-16 text-primary" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-base-content">
                {tvShows.length === 0 ? "No TV shows found" : "No TV shows match your filters"}
              </h3>
              <p className="text-base-content/70 max-w-md leading-relaxed">
                {tvShows.length === 0 
                  ? "Get started by adding your first TV show to the tracker!"
                  : "Try adjusting your filters or add a new TV show."
                }
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-base-100 rounded-lg border border-base-300 shadow-lg">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTvShows.map(tvShow => (
              <TvShowCard key={tvShow.show_id} tvShow={tvShow} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
};

export default Dashboard;