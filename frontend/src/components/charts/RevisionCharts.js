import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
// import { useSubjects } from '../../context/SubjectContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement );

const RevisionCharts = ({ subjects = [] }) => {
  // Memoize chart data to prevent unnecessary recalculations
  const progressData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const datasets = subjects.map(subject => ({
      label: subject?.name ?? 'Unknown Subject',
      data: last7Days.map(date => {
        const topic = subject?.topics?.find(t => 
          t?.lastRevised && format(new Date(t.lastRevised), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        const progress = topic?.progress ?? 0;
        return progress;
      }),
      borderColor: subject?.color ?? '#4D96FF',
      backgroundColor: subject?.color ?? '#4D96FF',
      tension: 0.4,
      fill: false
    }));

    return {
      labels: last7Days.map(date => format(date, 'MMM dd')),
      datasets
    };
  }, [subjects]);

  const distributionData = useMemo(() => {
    const progressRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };

    subjects.forEach(subject => {
      if (!Array.isArray(subject?.topics)) return;
      
      subject.topics.forEach(topic => {
        const progress = topic?.progress ?? 0;
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
        backgroundColor: [ '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72AA' ]
      }]
    };
  }, [subjects]);

  const frequencyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    const revisionCounts = last7Days.map(date => {
      let count = 0;
      subjects.forEach(subject => {
        if (!Array.isArray(subject?.topics)) return;
        
        subject.topics.forEach(topic => {
          if (topic?.lastRevised && 
              format(new Date(topic.lastRevised), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
            count++;
          }
        });
      });
      return count;
    });

    return {
      labels: last7Days.map(date => format(date, 'dd MMM')),
      datasets: [{
        label: 'Revisions',
        data: revisionCounts,
        borderColor: '#4D96FF',
        backgroundColor: '#4D96FF',
        tension: 0.4
      }]
    };
  }, [subjects]);

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

  const frequencyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Revision Frequency'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Validate subjects data after all hooks are called
  if (!Array.isArray(subjects)) {
    console.error('Subjects must be an array');
    return null;
  }

  // Log data for debugging
  // console.log('Subjects:', subjects);
  // console.log('Progress Data:', progressData);
  // console.log('Distribution Data:', distributionData);
  // console.log('Frequency Data:', frequencyData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Progress Over Time Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Line options={chartOptions} data={progressData} />
      </div>

      {/* Topic Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Doughnut options={doughnutOptions} data={distributionData} />
      </div>

      {/* Revision Frequency Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
        <Line options={frequencyOptions} data={frequencyData} />
      </div>
    </div>
  );
};

export default RevisionCharts; 