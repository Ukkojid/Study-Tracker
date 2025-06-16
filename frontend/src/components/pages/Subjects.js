import React, { useState, useEffect } from 'react';
import { useSubjects } from '../../context/SubjectContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import RevisionCharts from '../charts/RevisionCharts';
import { Line } from 'react-chartjs-2';

const Subjects = () => {
  const { subjects, loading, error, createSubject, updateSubject, deleteSubject, updateTopicProgress } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db',
    topics: []
  });
  const [newTopic, setNewTopic] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionRating, setRevisionRating] = useState(0);
  const [dueTopics, setDueTopics] = useState([]);

  // Check for due topics every minute
  useEffect(() => {
    const checkDueTopics = () => {
      const now = new Date();
      const dueTopicsList = [];

      subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          if (topic.nextRevision && new Date(topic.nextRevision) <= now) {
            dueTopicsList.push({
              subjectId: subject._id,
              subjectName: subject.name,
              topicId: topic._id,
              topicName: topic.name,
              nextRevision: topic.nextRevision
            });
          }
        });
      });

      setDueTopics(dueTopicsList);
    };

    // Initial check
    checkDueTopics();

    // Check every minute
    const interval = setInterval(checkDueTopics, 60000);

    return () => clearInterval(interval);
  }, [subjects]);

  // Show notifications for due topics
  useEffect(() => {
    dueTopics.forEach(topic => {
      const toastId = `due-topic-${topic.topicId}`;
      
      // Only show if not already shown
      if (!toast.isActive(toastId)) {
        toast.info(
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Revision Due!</p>
            <p>{topic.subjectName} - {topic.topicName}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setSelectedTopic({ subject: { _id: topic.subjectId }, topic: { _id: topic.topicId } });
                  setIsRevisionModalOpen(true);
                  toast.dismiss(toastId);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Revise Now
              </button>
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Later
              </button>
            </div>
          </div>,
          {
            toastId,
            autoClose: false,
            closeOnClick: false,
            closeButton: false
          }
        );
      }
    });
  }, [dueTopics]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, formData);
        toast.success('Subject updated successfully');
      } else {
        await createSubject(formData);
        toast.success('Subject created successfully');
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '', color: '#3498db', topics: [] });
      setNewTopic('');
      setIsAddingTopic(false);
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    }
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTopic.trim()) {
      toast.error('Topic name is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, {
        name: newTopic.trim(),
        description: '',
        difficulty: 'medium',
        progress: 0,
        lastRevised: null,
        nextRevision: null,
        revisionCount: 0,
        notes: []
      }]
    }));
    setNewTopic('');
    setIsAddingTopic(false);
  };

  const handleDeleteTopic = (index) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const handleEditTopic = (index) => {
    const topic = formData.topics[index];
    setEditingTopic({ index, ...topic });
    setNewTopic(topic.name);
    setIsAddingTopic(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      color: subject.color,
      topics: subject.topics || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        toast.success('Subject deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete subject');
      }
    }
  };

  const handleProgressUpdate = async (subjectId, topicId, progress) => {
    try {
      await updateTopicProgress(subjectId, topicId, progress);
      toast.success('Progress updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update progress');
    }
  };

  const handleStartRevision = (subject, topic) => {
    setSelectedTopic({ subject, topic });
    setIsRevisionModalOpen(true);
  };

  const handleCompleteRevision = async () => {
    try {
      if (!selectedTopic || !selectedTopic.subject || !selectedTopic.topic) {
        throw new Error('Invalid topic data');
      }

      await updateTopicProgress(
        selectedTopic.subject._id,
        selectedTopic.topic._id,
        revisionRating
      );

      toast.success('Revision completed successfully');
      setIsRevisionModalOpen(false);
      setSelectedTopic(null);
      setRevisionRating(0);
    } catch (error) {
      console.error('Revision error:', error);
      toast.error(error.message || 'Failed to complete revision');
    }
  };

  const getRevisionStatus = (topic) => {
    if (!topic.nextRevision) return 'Not started';
    const now = new Date();
    const nextRev = new Date(topic.nextRevision);
    if (now > nextRev) return 'Overdue';
    if (now.getTime() + 24 * 60 * 60 * 1000 > nextRev.getTime()) return 'Due today';
    return `Due in ${Math.ceil((nextRev - now) / (24 * 60 * 60 * 1000))} days`;
  };

  const getRevisionStatusColor = (status) => {
    switch (status) {
      case 'Overdue': return 'text-red-500';
      case 'Due today': return 'text-yellow-500';
      case 'Not started': return 'text-gray-500';
      default: return 'text-green-500';
    }
  };

  const calculateUserStats = () => {
    // Calculates total study time, revisions, topics, etc.
    // Tracks study streak using lastRevised dates
  };

  const getUpcomingRevisions = () => {
    // Get revisions due in next 2 days
  };

  const getSubjectsNeedingAttention = () => {
    // Get subjects with low progress
  };

  const getStudyHabits = () => {
    // Identifies most studied subject/topic
    // Tracks best performing subject
    // Monitors most revisited topic
  };

  const getAchievements = () => {
    // Awards achievements based on:
    // - Study streaks
    // - Total study time
    // - Number of revisions
    // - Progress levels
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ name: '', description: '', color: '#3498db', topics: [] });
            setNewTopic('');
            setIsAddingTopic(false);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Subject
        </button>
      </div>

      {/* Subjects and Topics Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              style={{ borderLeft: `4px solid ${subject.color}` }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{subject.name}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{subject.description}</p>
              
              {/* Topics List */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Topics</h3>
                <div className="space-y-2">
                  {subject.topics.map((topic, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium">{topic.name}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className={getRevisionStatusColor(getRevisionStatus(topic))}>
                              {getRevisionStatus(topic)}
                            </span>
                            {topic.nextRevision && (
                              <span className="ml-2">
                                Next: {format(new Date(topic.nextRevision), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartRevision(subject, topic)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Revise
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={topic.progress}
                          onChange={(e) => handleProgressUpdate(subject._id, topic._id, parseInt(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                        <span className="text-xs text-gray-500">{topic.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Progress</span>
                  <span className="text-sm font-medium">{subject.totalProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.totalProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Topics: {subject.topics.length}</span>
                  <span>Study Time: {subject.studyTime} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
        <RevisionCharts subjects={subjects} />
      </div>

      {/* Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-full rounded cursor-pointer"
                />
              </div>

              {/* Topics Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-bold">
                    Topics
                  </label>
                  {!isAddingTopic && (
                    <button
                      type="button"
                      onClick={() => setIsAddingTopic(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      + Add Topic
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1 text-sm">{topic.name}</span>
                      <button
                        type="button"
                        onClick={() => handleEditTopic(index)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {isAddingTopic && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Enter topic name"
                        className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddTopic}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm"
                      >
                        {editingTopic ? 'Update' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTopic(false);
                          setEditingTopic(null);
                          setNewTopic('');
                        }}
                        className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isRevisionModalOpen && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Revision</h2>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{selectedTopic.topic.name}</h3>
              <p className="text-gray-600">How well did you remember this topic?</p>
            </div>
            <div className="flex justify-center space-x-4 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setRevisionRating(rating * 20)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-colors duration-200 ${
                    revisionRating === rating * 20
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRevision}
                disabled={!revisionRating}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects; 