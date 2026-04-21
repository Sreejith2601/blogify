import api from './api';

const uploadService = {
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data; // Should return { url: '...' }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default uploadService;
