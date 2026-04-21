import api from './api';

const postService = {
  getAllPosts: async (params = {}) => {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPostById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  likePost: async (id) => {
    try {
      const response = await api.put(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sharePost: async (id) => {
    try {
      const response = await api.put(`/posts/${id}/share`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Metadata Management
  getUserMetadata: async () => {
    try {
      const response = await api.get('/posts/meta/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  renameCategory: async (oldCategory, newCategory) => {
    try {
      const response = await api.put('/posts/meta/category/rename', { oldCategory, newCategory });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteCategory: async (category) => {
    try {
      const response = await api.delete('/posts/meta/category/delete', { data: { category } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  renameTag: async (oldTag, newTag) => {
    try {
      const response = await api.put('/posts/meta/tag/rename', { oldTag, newTag });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteTag: async (tag) => {
    try {
      const response = await api.delete('/posts/meta/tag/delete', { data: { tag } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFollowingPosts: async () => {
    try {
      const response = await api.get('/posts/following');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default postService;
