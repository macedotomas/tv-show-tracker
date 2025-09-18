import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const TvShowDetails = ({ setAuth }) => {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/tv-shows/${id}`).then(res => {
      setTvShow(res.data.data);
    }).catch(console.error);
  }, [id]);

  if (!tvShow) return <div className="loading loading-spinner loading-lg" />;

  return (
    <div>
      <h1>Edit: {tvShow.title}</h1>
      {/* form goes here */}
    </div>
  );
};

export default TvShowDetails;
