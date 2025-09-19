import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';


const BASE_URL = 'http://localhost:3000';


export const useTvShowStore = create((set, get) => ({
  tvShows: [],
  loading: false,
  error: null,
  currentTvShow: null,

  // form state
  formData: {
    title: "",
    description: "",
    genre: "",
    type: "",
    release_date: "",
    rating: ""
  },

  setFormData: (formData) => set({ formData }),

  resetFormData: () => set({
    formData: {
      title: "",
      description: "",
      genre: "",
      type: "",
      release_date: "",
      rating: ""
    }
  }),


  addProduct: async (e) => {
    e.preventDefault();
    set({ loading: true });


    try {
      const token = localStorage.getItem("token") || '';
      const response = await axios.post(`${BASE_URL}/api/tv-shows`, get().formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // first data from response is from axios, second data is from backend response 
      set({ tvShows: [...get().tvShows, response.data.data], error: null });
      get().resetFormData();
      toast.success("TV show added successfully.");


      // Close the modal after successful addition
      document.getElementById('add_tvshow_modal').close();

    } catch (error) {
      set({ error: error.message });
      toast.error("Failed to add TV show.");
    } finally {
      set({ loading: false });
    }

  },


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
  },

  fetchTvShow: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axios.get(`${BASE_URL}/api/tv-shows/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tvShowData = response.data.data;
      
      // Format the release_date for HTML date input (YYYY-MM-DD)
      let formattedDate = '';
      if (tvShowData.release_date) {
        const date = new Date(tvShowData.release_date);
        formattedDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      }
      
      set({ 
        currentTvShow: tvShowData, 
        formData: {
          title: tvShowData.title || '',
          description: tvShowData.description || '',
          genre: tvShowData.genre || '',
          type: tvShowData.type || '',
          release_date: formattedDate,
          rating: tvShowData.rating || ''
        },
        error: null
       });
    } catch (error) {
      console.error(error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateTvShow: async (id, navigate) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axios.patch(`${BASE_URL}/api/tv-shows/${id}`, get().formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the local state with the updated TV show
      set({currentTvShow: response.data.data});
      toast.success("TV show updated successfully.");
      
      // Navigate back to dashboard after successful update
      if (navigate) {
        navigate('/');
      }
    } catch (error) {
      set({ error: error.message });
      toast.error("Failed to update TV show.");
    } finally {
      set({ loading: false });
    }
  }

}));

