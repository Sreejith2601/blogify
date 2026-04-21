import api from './api';

const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserPosts: async (id) => {
    try {
      const response = await api.get(`/users/${id}/posts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  followUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unfollowUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/unfollow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserAnalytics: async () => {
    try {
      const response = await api.get('/users/analytics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  subscribeToCategory: async (category) => {
    try {
      const response = await api.post('/users/subscribe-category', { category });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  savePost: async (id) => {
    try {
      const response = await api.post(`/users/save/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSavedPosts: async () => {
    try {
      const response = await api.get('/users/saved/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;
