import React from 'react';
import { useSubjects } from '../../context/SubjectContext';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { toast } from 'react-toastify';

const Revisions = () => {
  const { subjects, loading, error, updateTopicProgress } = useSubjects();
  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = React.useState(false);
  const [revisionRating, setRevisionRating] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getRevisionStatus = (topic) => {
    if (!topic.nextRevision) return 'Not started';
    const now = new Date();
    const nextRev = new Date(topic.nextRevision);
    if (isPast(nextRev)) return 'Overdue';
    if (isToday(nextRev)) return 'Due today';
    if (isTomorrow(nextRev)) return 'Due tomorrow';
    return `Due in ${Math.ceil((nextRev - now) / (24 * 60 * 60 * 1000))} days`;
  };

  const getRevisionStatusColor = (status) => {
    switch (status) {
      case 'Overdue': return 'text-red-500';
      case 'Due today': return 'text-yellow-500';
      case 'Due tomorrow': return 'text-blue-500';
      case 'Not started': return 'text-gray-500';
      default: return 'text-green-500';
    }
  };

  const handleStartRevision = (subject, topic) => {
    if (!subject || !topic) {
      toast.error('Invalid subject or topic data');
      return;
    }
    setSelectedTopic({ subject, topic });
    setIsRevisionModalOpen(true);
  };

  const handleCompleteRevision = async () => {
    if (!selectedTopic || !selectedTopic.subject || !selectedTopic.topic) {
      toast.error('Invalid topic data');
      return;
    }

    if (!revisionRating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUpcomingRevisions = () => {
    if (!subjects || subjects.length === 0) {
      return [];
    }

    const now = new Date();
    const twoDaysFromNow = addDays(now, 2);
    const revisions = [];

    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (topic.nextRevision) {
          const nextRev = new Date(topic.nextRevision);
          if (nextRev <= twoDaysFromNow) {
            revisions.push({
              subject,
              topic,
              nextRevision: nextRev
            });
          }
        }
      });
    });

    return revisions.sort((a, b) => a.nextRevision - b.nextRevision);
  };

  const upcomingRevisions = getUpcomingRevisions();
  const pendingRevisions = upcomingRevisions.filter(rev => isPast(rev.nextRevision));
  const futureRevisions = upcomingRevisions.filter(rev => !isPast(rev.nextRevision));

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Revisions</h1>

      {/* Pending Revisions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Revisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRevisions.map(({ subject, topic, nextRevision }) => (
            <div
              key={`${subject._id}-${topic._id}`}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{topic.name}</p>
                </div>
                <span className="text-sm text-red-500 font-medium">Overdue</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Due: {format(nextRevision, 'MMM d, yyyy')}
              </div>
              <button
                onClick={() => handleStartRevision(subject, topic)}
                className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Revise Now
              </button>
            </div>
          ))}
          {pendingRevisions.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No pending revisions
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Revisions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Revisions (Next 2 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {futureRevisions.map(({ subject, topic, nextRevision }) => (
            <div
              key={`${subject._id}-${topic._id}`}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{topic.name}</p>
                </div>
                <span className={`text-sm font-medium ${getRevisionStatusColor(getRevisionStatus(topic))}`}>
                  {getRevisionStatus(topic)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                Due: {format(nextRevision, 'MMM d, yyyy')}
              </div>
              <button
                onClick={() => handleStartRevision(subject, topic)}
                className="w-full bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Revise Now
              </button>
            </div>
          ))}
          {futureRevisions.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No upcoming revisions in the next 2 days
            </div>
          )}
        </div>
      </div>

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
                disabled={isSubmitting}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRevision}
                disabled={!revisionRating || isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Completing...' : 'Complete Revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revisions; 