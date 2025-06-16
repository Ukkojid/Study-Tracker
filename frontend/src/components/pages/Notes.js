import React, { useState } from 'react';
import { useSubjects } from '../../context/SubjectContext';
import { toast } from 'react-toastify';

const Notes = () => {
  const { subjects } = useSubjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject: '',
    topic: '',
    tags: [],
  });

  // Mock data for notes (replace with actual data from backend)
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Newton\'s Laws of Motion',
      content: '1. First Law: An object at rest stays at rest...',
      subject: 'Physics',
      topic: 'Mechanics',
      tags: ['laws', 'motion', 'physics'],
      createdAt: '2024-03-15',
      updatedAt: '2024-03-15',
    },
    {
      id: 2,
      title: 'Chemical Bonding',
      content: 'Ionic bonds form between metals and non-metals...',
      subject: 'Chemistry',
      topic: 'Chemical Bonds',
      tags: ['bonds', 'chemistry', 'atoms'],
      createdAt: '2024-03-14',
      updatedAt: '2024-03-14',
    },
    // Add more mock notes as needed
  ]);

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setNoteForm({
      title: '',
      content: '',
      subject: '',
      topic: '',
      tags: [],
    });
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      topic: note.topic,
      tags: note.tags,
    });
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        // Implement note update logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setNotes(notes.map(note =>
          note.id === editingNote.id
            ? { ...noteForm, id: note.id, updatedAt: new Date().toISOString().split('T')[0] }
            : note
        ));
        toast.success('Note updated successfully');
      } else {
        // Implement note creation logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const newNote = {
          id: notes.length + 1,
          ...noteForm,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        setNotes([...notes, newNote]);
        toast.success('Note created successfully');
      }
      setIsCreatingNote(false);
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        subject: '',
        topic: '',
        tags: [],
      });
    } catch (error) {
      toast.error('Failed to save note');
      console.error('Note save error:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      // Implement note deletion logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Note deletion error:', error);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!noteForm.tags.includes(newTag)) {
        setNoteForm(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setNoteForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and organize your study notes
              </p>
            </div>
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Note
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search notes
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by title, content, or tags"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Filter by subject
              </label>
              <select
                id="subject"
                name="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Subjects</option>
                {subjects?.map((subject) => (
                  <option key={subject._id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Note Form Modal */}
        {(isCreatingNote || editingNote) && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={noteForm.subject}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a subject</option>
                      {subjects?.map((subject) => (
                        <option key={subject._id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                      Topic
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      value={noteForm.topic}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a topic</option>
                      {noteForm.subject && subjects
                        ?.find(s => s.name === noteForm.subject)
                        ?.topics.map(topic => (
                          <option key={topic._id} value={topic.name}>
                            {topic.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={6}
                      value={noteForm.content}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2 mb-2">
                      {noteForm.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      onKeyPress={handleTagInput}
                      placeholder="Press Enter to add a tag"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNote(false);
                    setEditingNote(null);
                    setNoteForm({
                      title: '',
                      content: '',
                      subject: '',
                      topic: '',
                      tags: [],
                    });
                  }}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{note.subject} • {note.topic}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="text-gray-400 hover:text-indigo-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes; 