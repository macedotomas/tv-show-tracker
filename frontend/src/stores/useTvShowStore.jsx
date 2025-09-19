import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';


const BASE_URL = 'http://localhost:3000';


export const useTvShowStore = create((set, get) => ({
  tvShows: [],
  loading: false,
  error: null,
  currentTvShow: null,

  // filter state
  filters: {
    genre: "",
    type: ""
  },

  // sort state
  sort: {
    field: "title", // default sort by title
    direction: "asc" // asc or desc
  },

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

  setFilters: (filters) => set({ filters }),

  setSort: (sort) => set({ sort }),

  setSortField: (field) => {
    const currentSort = get().sort;
    // If clicking the same field, toggle direction
    const direction = currentSort.field === field && currentSort.direction === "asc" ? "desc" : "asc";
    set({ sort: { field, direction } });
  },

  resetFilters: () => set({
    filters: {
      genre: "",
      type: ""
    }
  }),

  resetSort: () => set({
    sort: {
      field: "title",
      direction: "asc"
    }
  }),

  // computed filtered TV shows
  getFilteredTvShows: () => {
    const { tvShows, filters, sort } = get();
    
    // First filter
    let filtered = tvShows.filter(tvShow => {
      const genreMatch = !filters.genre || tvShow.genre.toLowerCase().includes(filters.genre.toLowerCase());
      const typeMatch = !filters.type || tvShow.type.toLowerCase().includes(filters.type.toLowerCase());
      
      return genreMatch && typeMatch;
    });

    // Then sort
    return filtered.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      // Handle different data types
      if (sort.field === 'release_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sort.field === 'rating') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sort.direction === 'desc' ? comparison * -1 : comparison;
    });
  },

  // get unique genres and types for filter dropdowns
  getUniqueGenres: () => {
    const { tvShows } = get();
    const genres = [...new Set(tvShows.map(show => show.genre).filter(Boolean))];
    return genres.sort();
  },

  getUniqueTypes: () => {
    const { tvShows } = get();
    const types = [...new Set(tvShows.map(show => show.type).filter(Boolean))];
    return types.sort();
  },

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

