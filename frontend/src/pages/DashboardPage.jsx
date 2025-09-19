import { PlusCircle, RefreshCcw } from "lucide-react";
import React, { Fragment, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTvShowStore } from '../stores/useTvShowStore.jsx';
import TvShowCard from "../components/TvShowCard.jsx";
import { PackageIcon } from "lucide-react";
import AddTvShowModal from "../components/AddTvShowModal.jsx";

const Dashboard = ({ setAuth }) => {

  const [name, setName] = useState("");

  const { tvShows, loading, error, fetchTvShows } = useTvShowStore();


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
  }, [fetchTvShows]);


  const logout = e => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
    toast.info("Logged out Successfully!");
  }

  return (
    <Fragment>
      <h1>Dashboard {name}</h1>
      <button onClick={logout}>Logout</button>
      <main className="mx-auto p-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <button className="btn btn-primary" onClick={() => document.getElementById('add_tvshow_modal').showModal()}>
            <PlusCircle className="size-5 mr-2" />
            Add TV Show
          </button>
          <button className="btn btn-ghost btn-circle" onClick={fetchTvShows}>
            <RefreshCcw className="size-5" />
          </button>
        </div>

        <AddTvShowModal />

        {error && <p className="alert alert-error mb-8">Error: {error}</p>}

        {tvShows.length === 0 && !loading && (
          <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="bg-base-100 rounded-full p-6">
              <PackageIcon className="size-12" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold ">No TV shows found</h3>
              <p className="text-gray-500 max-w-sm">
                Get started by adding your first TV show to the tracker!
              </p>
            </div>
          </div>
        )}



        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg" ></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 mm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tvShows.map(tvShow => (
              <TvShowCard key={tvShow.show_id} tvShow={tvShow} />
            ))}
          </div>
        )}



      </main>

    </Fragment>
  );
};

export default Dashboard;