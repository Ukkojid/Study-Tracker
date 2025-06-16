const Subject = require('../models/subject.model');
const AppError = require('../utils/appError');

exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.id });
    res.status(200).json({
      status: 'success',
      results: subjects.length,
      data: {
        subjects
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subject) {
      return next(new AppError('No subject found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        subject
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const newSubject = await Subject.create({
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
      topics: req.body.topics || [],
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        subject: newSubject
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!subject) {
      return next(new AppError('No subject found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        subject
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subject) {
      return next(new AppError('No subject found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.createTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subject) {
      return next(new AppError('No subject found with that ID', 404));
    }

    subject.topics.push({
      name: req.body.name,
      description: req.body.description,
      difficulty: req.body.difficulty
    });

    await subject.save();

    res.status(201).json({
      status: 'success',
      data: {
        subject
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.id,
      'topics._id': req.params.topicId
    });

    if (!subject) {
      return next(new AppError('No subject or topic found with that ID', 404));
    }

    const topic = subject.topics.id(req.params.topicId);
    Object.assign(topic, req.body);
    await subject.save();

    res.status(200).json({
      status: 'success',
      data: {
        subject
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!subject) {
      return next(new AppError('No subject found with that ID', 404));
    }

    subject.topics.pull(req.params.topicId);
    await subject.save();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTopicProgress = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      user: req.user.id,
      'topics._id': req.params.topicId
    });

    if (!subject) {
      return next(new AppError('No subject or topic found with that ID', 404));
    }

    const topic = subject.topics.id(req.params.topicId);
    const progress = parseInt(req.body.progress);

    if (isNaN(progress) || progress < 0 || progress > 100) {
      return next(new AppError('Invalid progress value', 400));
    }

    // Update progress and revision data
    topic.progress = progress;
    topic.lastRevised = new Date();
    topic.revisionCount += 1;

    // Calculate next revision date based on performance
    const daysToAdd = progress >= 80 ? 7 : progress >= 60 ? 3 : 1;
    topic.nextRevision = new Date();
    topic.nextRevision.setDate(topic.nextRevision.getDate() + daysToAdd);

    await subject.save();

    res.status(200).json({
      status: 'success',
      data: {
        subject
      }
    });
  } catch (err) {
    next(err);
  }
}; 