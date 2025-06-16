const Subject = require('../models/subject.model');
const Revision = require('../models/revision.model');
const AppError = require('../utils/appError');

exports.getProgressOverview = async (req, res, next) => {
  try {
    const totalSubjects = await Subject.countDocuments({ user: req.user.id });
    const upcomingRevisions = await Revision.countDocuments({
      user: req.user.id,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() }
    });
    const completedToday = await Revision.countDocuments({
      user: req.user.id,
      status: 'completed',
      completedDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    // Calculate study streak
    const streak = await calculateStudyStreak(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        totalSubjects,
        upcomingRevisions,
        completedToday,
        streak
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubjectProgress = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).select('name totalProgress');

    res.status(200).json({
      status: 'success',
      data: {
        subjects
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopicProgress = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).select('name topics');
    const topicsProgress = subjects.reduce((acc, subject) => {
      subject.topics.forEach(topic => {
        acc.push({
          subject: subject.name,
          topic: topic.name,
          progress: topic.progress
        });
      });
      return acc;
    }, []);

    res.status(200).json({
      status: 'success',
      data: {
        topics: topicsProgress
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStudyStreak = async (req, res, next) => {
  try {
    const streak = await calculateStudyStreak(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        streak
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStudyTime = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    const revisions = await Revision.find({
      user: req.user.id,
      status: 'completed',
      completedDate: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).select('duration completedDate');

    const studyTimeByDay = Array(7).fill(0);
    revisions.forEach(revision => {
      const day = new Date(revision.completedDate).getDay();
      studyTimeByDay[day] += revision.duration;
    });

    res.status(200).json({
      status: 'success',
      data: {
        studyTimeByDay
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getPerformanceMetrics = async (req, res, next) => {
  try {
    const revisions = await Revision.find({
      user: req.user.id,
      status: 'completed'
    }).select('performance difficulty');

    const performanceByDifficulty = {
      easy: { total: 0, count: 0 },
      medium: { total: 0, count: 0 },
      hard: { total: 0, count: 0 }
    };

    revisions.forEach(revision => {
      performanceByDifficulty[revision.difficulty].total += revision.performance;
      performanceByDifficulty[revision.difficulty].count += 1;
    });

    // Calculate averages
    Object.keys(performanceByDifficulty).forEach(difficulty => {
      const { total, count } = performanceByDifficulty[difficulty];
      performanceByDifficulty[difficulty] = count > 0 ? Math.round(total / count) : 0;
    });

    res.status(200).json({
      status: 'success',
      data: {
        performanceByDifficulty
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to calculate study streak
const calculateStudyStreak = async userId => {
  const revisions = await Revision.find({
    user: userId,
    status: 'completed'
  })
    .select('completedDate')
    .sort('-completedDate');

  if (revisions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < revisions.length; i++) {
    const revisionDate = new Date(revisions[i].completedDate);
    revisionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - revisionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && i === 0) {
      streak = 1;
    } else if (diffDays === streak) {
      streak++;
    } else {
      break;
    }

    currentDate = revisionDate;
  }

  return streak;
}; 