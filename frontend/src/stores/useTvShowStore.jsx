import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';


const BASE_URL = 'http://localhost:3000';


export const useTvShowStore = create((set, get) => ({
  tvShows: [],
  loading: false,
  error: null,

  fetchTvShows: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/api/tv-shows`);

      // first data from response is from axios, second data is from backend response 
      set({ tvShows: response.data.data, error: null });

    } catch (error) {

      set({ error: error.message, loading: false });

    } finally {
      set({ loading: false });
    }

  },

  deleteTvShow: async (id) => {
    try {
      set({ loading: true });
      const token = localStorage.getItem("token") || '';
      await axios.delete(`${BASE_URL}/api/tv-shows/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the local state to remove the deleted TV show
      set({ tvShows: get().tvShows.filter(tvShow => tvShow.show_id !== id) });
      toast.success("TV show deleted successfully.");
    } catch (error) {
      set({ error: error.message });
      toast.error("Failed to delete TV show.");
    } finally {
      set({ loading: false });
    }
  }

}));

