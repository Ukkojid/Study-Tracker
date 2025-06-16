import React, { createContext, useContext, useState, useEffect } from 'react';
import subjectService from '../services/subject.service';
import { toast } from 'react-toastify';

const SubjectContext = createContext();

export const useSubjects = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubjects must be used within a SubjectProvider');
  }
  return context;
};

export const SubjectProvider = ({ children, user }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  // Create new subject
  const createSubject = async (subjectData) => {
    try {
      const newSubject = await subjectService.createSubject(subjectData);
      setSubjects(prev => [...prev, newSubject]);
      toast.success('Subject created successfully');
      return newSubject;
    } catch (err) {
      toast.error(err.message || 'Failed to create subject');
      throw err;
    }
  };

  // Update subject
  const updateSubject = async (id, subjectData) => {
    try {
      const updatedSubject = await subjectService.updateSubject(id, subjectData);
      setSubjects(prev => prev.map(subject => 
        subject._id === id ? updatedSubject : subject
      ));
      toast.success('Subject updated successfully');
      return updatedSubject;
    } catch (err) {
      toast.error(err.message || 'Failed to update subject');
      throw err;
    }
  };

  // Delete subject
  const deleteSubject = async (id) => {
    try {
      await subjectService.deleteSubject(id);
      setSubjects(prev => prev.filter(subject => subject._id !== id));
      toast.success('Subject deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete subject');
      throw err;
    }
  };

  // Update topic progress
  const updateTopicProgress = async (subjectId, topicId, progress) => {
    try {
      const updatedSubject = await subjectService.updateTopicProgress(subjectId, topicId, progress);
      setSubjects(prev => prev.map(subject => 
        subject._id === subjectId ? updatedSubject : subject
      ));
      return updatedSubject;
    } catch (err) {
      toast.error(err.message || 'Failed to update topic progress');
      throw err;
    }
  };

  // Add study time
  const addStudyTime = async (subjectId, minutes) => {
    try {
      const updatedSubject = await subjectService.addStudyTime(subjectId, minutes);
      setSubjects(prev => prev.map(subject => 
        subject._id === subjectId ? updatedSubject : subject
      ));
      return updatedSubject;
    } catch (err) {
      toast.error(err.message || 'Failed to add study time');
      throw err;
    }
  };

  const value = {
    subjects,
    loading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    updateTopicProgress,
    addStudyTime
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
}; 