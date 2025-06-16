import React from 'react';
import { useSubjects } from '../../context/SubjectContext';
import { format, subDays } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Progress = () => {
  const { subjects, loading, error } = useSubjects();

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (!subjects || subjects.length === 0) {
      return {
        totalTopics: 0,
        averageProgress: 0,
        totalStudyTime: 0,
        totalRevisions: 0,
        averageRevisionsPerTopic: 0
      };
    }

    let totalTopics = 0;
    let totalProgress = 0;
    let totalStudyTime = 0;
    let totalRevisions = 0;

    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        totalTopics++;
        totalProgress += topic.progress || 0;
        totalStudyTime += topic.studyTime || 0;
        totalRevisions += topic.revisionCount || 0;
      });
    });

    return {
      totalTopics,
      averageProgress: totalTopics > 0 ? Math.round(totalProgress / totalTopics) : 0,
      totalStudyTime,
      totalRevisions,
      averageRevisionsPerTopic: totalTopics > 0 ? Math.round(totalRevisions / totalTopics) : 0
    };
  };

  // Prepare data for progress over time chart
  const getProgressOverTimeData = () => {
    if (!subjects || subjects.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const datasets = subjects.map(subject => ({
      label: subject.name,
      data: last7Days.map(date => {
        const topic = subject.topics.find(t => 
          t.lastRevised && format(new Date(t.lastRevised), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return topic ? topic.progress : null;
      }),
      borderColor: subject.color || '#4D96FF',
      backgroundColor: subject.color || '#4D96FF',
      tension: 0.4,
      fill: false
    }));

    return {
      labels: last7Days.map(date => format(date, 'MMM dd')),
      datasets
    };
  };

  // Prepare data for topic distribution chart
  const getTopicDistributionData = () => {
    if (!subjects || subjects.length === 0) {
      return {
        labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72AA']
        }]
      };
    }

    const progressRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };

    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        const progress = topic.progress || 0;
        if (progress <= 20) progressRanges['0-20%']++;
        else if (progress <= 40) progressRanges['21-40%']++;
        else if (progress <= 60) progressRanges['41-60%']++;
        else if (progress <= 80) progressRanges['61-80%']++;
        else progressRanges['81-100%']++;
      });
    });

    return {
      labels: Object.keys(progressRanges),
      datasets: [{
        data: Object.values(progressRanges),
        backgroundColor: [
          '#FF6B6B',
          '#FFD93D',
          '#6BCB77',
          '#4D96FF',
          '#9B72AA'
        ]
      }]
    };
  };

  // Prepare data for study time chart
  const getStudyTimeData = () => {
    if (!subjects || subjects.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Study Time (minutes)',
          data: [],
          borderColor: '#4D96FF',
          backgroundColor: '#4D96FF',
          tension: 0.4
        }]
      };
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const studyTimeData = last7Days.map(date => {
      let totalTime = 0;
      subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          if (topic.lastRevised && 
              format(new Date(topic.lastRevised), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
            totalTime += topic.studyTime || 0;
          }
        });
      });
      return totalTime;
    });

    return {
      labels: last7Days.map(date => format(date, 'MMM dd')),
      datasets: [{
        label: 'Study Time (minutes)',
        data: studyTimeData,
        borderColor: '#4D96FF',
        backgroundColor: '#4D96FF',
        tension: 0.4
      }]
    };
  };

  const overallStats = calculateOverallStats();
  const progressData = getProgressOverTimeData();
  const distributionData = getTopicDistributionData();
  const studyTimeData = getStudyTimeData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progress Over Time'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Topic Progress Distribution'
      }
    }
  };

  const studyTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Study Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Progress Overview</h1>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Topics</h3>
          <p className="text-2xl font-bold text-gray-900">{overallStats.totalTopics}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Progress</h3>
          <p className="text-2xl font-bold text-gray-900">{overallStats.averageProgress}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Study Time</h3>
          <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudyTime} min</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revisions</h3>
          <p className="text-2xl font-bold text-gray-900">{overallStats.totalRevisions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Line options={chartOptions} data={progressData} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Doughnut options={doughnutOptions} data={distributionData} />
        </div>
      </div>

      {/* Study Time Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Line options={studyTimeOptions} data={studyTimeData} />
      </div>

      {/* Subject-wise Progress */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Subject-wise Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div
              key={subject._id}
              className="bg-white rounded-lg shadow-md p-4"
              style={{ borderLeft: `4px solid ${subject.color}` }}
            >
              <h3 className="font-semibold text-gray-800 mb-2">{subject.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{subject.totalProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.totalProgress}%`, backgroundColor: subject.color }}
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
    </div>
  );
};

export default Progress; 