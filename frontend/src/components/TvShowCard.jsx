import { EditIcon, Trash2Icon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { useTvShowStore } from '../stores/useTvShowStore.jsx'

function TvShowCard({ tvShow }) {

  const { deleteTvShow } = useTvShowStore();

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* TvShow Details */}
      <div className="card-body">

        <h2 className="card-title">{tvShow.title}</h2>
        <p><strong>Genre:</strong> {tvShow.genre}</p>
        <p><strong>Type:</strong> {tvShow.type}</p>
        <p><strong>Release Date:</strong> {new Date(tvShow.release_date).toLocaleDateString()}</p>


        {/* Action Buttons */}
        <div className="card-actions justify-end mt-4">
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