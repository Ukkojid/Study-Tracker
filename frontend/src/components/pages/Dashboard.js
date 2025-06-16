import React from 'react';
import { useSubjects } from '../../context/SubjectContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import RevisionCharts from '../charts/RevisionCharts';

const Dashboard = () => {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { user } = useAuth();

  // Calculate statistics
  const calculateStats = () => {
    if (!subjects || subjects.length === 0) {
      return {
        totalSubjects: 0,
        totalTopics: 0,
        completedTopics: 0,
        averageProgress: 0
      };
    }

    const totalSubjects = subjects.length;
    const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
    const completedTopics = subjects.reduce((acc, subject) => 
      acc + subject.topics.filter(topic => topic.progress >= 100).length, 0);
    const averageProgress = subjects.reduce((acc, subject) => 
      acc + subject.topics.reduce((topicAcc, topic) => topicAcc + (topic.progress || 0), 0) / subject.topics.length, 0) / totalSubjects || 0;

    return {
      totalSubjects,
      totalTopics,
      completedTopics,
      averageProgress: Math.round(averageProgress)
    };
  };

  const stats = calculateStats();

  // Get upcoming revisions
  const getUpcomingRevisions = () => {
    if (!subjects || subjects.length === 0) return [];
    
    const today = new Date();
    const revisions = [];
    
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (topic.nextRevision && new Date(topic.nextRevision) >= today) {
          revisions.push({
            subject: subject.name,
            topic: topic.name,
            date: new Date(topic.nextRevision),
            progress: topic.progress || 0
          });
        }
      });
    });

    return revisions
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  };

  const upcomingRevisions = getUpcomingRevisions();

  // Show loading state
  if (subjectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="mt-2 text-indigo-100">Track your study progress and manage your revisions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Subjects Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Subjects</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSubjects}</p>
              </div>
            </div>
          </div>

          {/* Total Topics Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Total Topics</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTopics}</p>
              </div>
            </div>
          </div>

          {/* Completed Topics Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Completed Topics</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedTopics}</p>
              </div>
            </div>
          </div>

          {/* Average Progress Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Average Progress</h2>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Analytics</h2>
          <RevisionCharts subjects={subjects} />
        </div>

        {/* Upcoming Revisions and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Revisions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Revisions</h2>
              <Link to="/revisions" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingRevisions.length > 0 ? (
                upcomingRevisions.map((revision, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{revision.topic}</h3>
                      <p className="text-sm text-gray-500">{revision.subject}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${revision.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {`${revision.date.getDate().toString().padStart(2, '0')}-${(revision.date.getMonth() + 1).toString().padStart(2, '0')}-${revision.date.getFullYear()}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming revisions</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/subjects"
                className="flex items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
              >
                <div className="text-center">
                  <svg className="h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-medium text-indigo-600">Manage Subjects</span>
                </div>
              </Link>

              <Link
                to="/revisions"
                className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <div className="text-center">
                  <svg className="h-8 w-8 text-purple-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-600">Start Revision</span>
                </div>
              </Link>

              <Link
                to="/files"
                className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <div className="text-center">
                  <svg className="h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-green-600">Study Materials</span>
                </div>
              </Link>

              <Link
                to="/profile"
                className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="text-center">
                  <svg className="h-8 w-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600">Profile Settings</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 