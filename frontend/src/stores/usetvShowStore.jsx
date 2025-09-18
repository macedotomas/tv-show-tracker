import {create} from 'zustand';
import axios from 'axios';


const BASE_URL = 'http://localhost:5000';


export const useTvShowStore = create((set, get) => ({
  tvShows: [],
  loading:false,
  error:null,

  fetchTvShows: async () => {
    set({loading:true, error:null});
    try {
      const response = await axios.get(`${BASE_URL}/api/tv-shows`);
      
      // first data from response is from axios, second data is from backend response 
      set({tvShows: response.data.data, error:null});

    } catch (error) {
      
      set({error: error.message, loading:false});
    
    } finally {
      set({loading:false});
    }

  }
}));