import api from './api';

const commentService = {
  getCommentsByPostId: async (postId) => {
    try {
      const response = await api.get(`/comments/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/comments/${postId}`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/delete/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  likeComment: async (commentId) => {
    try {
      const response = await api.post(`/comments/like/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default commentService;
