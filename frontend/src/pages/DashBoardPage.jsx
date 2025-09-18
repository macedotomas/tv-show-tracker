import Dashboard from "../components/Dashboard";


function DashBoardPage() {
  const { tvShows, fetchTvShows } = useTvShowStore();

  useEffect(() => {
    fetchTvShows();
  }, [fetchTvShows]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Dashboard />
    </div>
  );
}
export default DashBoardPage;