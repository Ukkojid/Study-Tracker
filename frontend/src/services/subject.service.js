import api from './api';

const subjectService = {
  // Get all subjects
  getAllSubjects: async () => {
    try {
      const response = await api.get('/subjects');
      return response.data.data.subjects;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Get a single subject
  getSubject: async (id) => {
    try {
      const response = await api.get(`/subjects/${id}`);
      return response.data.data.subject;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Create a new subject
  createSubject: async (subjectData) => {
    try {
      const response = await api.post('/subjects', subjectData);
      return response.data.data.subject;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update a subject
  updateSubject: async (id, subjectData) => {
    try {
      const response = await api.patch(`/subjects/${id}`, subjectData);
      return response.data.data.subject;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Delete a subject
  deleteSubject: async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update topic progress
  updateTopicProgress: async (subjectId, topicId, progress) => {
    try {
      const response = await api.patch(`/subjects/${subjectId}/topics/${topicId}/progress`, {
        progress
      });
      return response.data.data.subject;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update topic progress');
    }
  },

  // Add study time
  addStudyTime: async (subjectId, minutes) => {
    try {
      const response = await api.patch(`/subjects/${subjectId}/study-time`, {
        minutes
      });
      return response.data.data.subject;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }
};

export default subjectService; 