const Revision = require('../models/revision.model');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

exports.getAllRevisions = async (req, res, next) => {
  try {
    const revisions = await Revision.find({ user: req.user.id })
      .populate('subject', 'name')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      status: 'success',
      results: revisions.length,
      data: {
        revisions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('subject', 'name');

    if (!revision) {
      return next(new AppError('No revision found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        revision
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createRevision = async (req, res, next) => {
  try {
    const newRevision = await Revision.create({
      subject: req.body.subject,
      topic: req.body.topic,
      scheduledDate: req.body.scheduledDate,
      duration: req.body.duration,
      difficulty: req.body.difficulty,
      priority: req.body.priority,
      user: req.user.id
    });

    // Send email notification
    await sendEmail.sendRevisionReminder(
      req.user.email,
      newRevision.topic,
      newRevision.scheduledDate,
      newRevision.duration,
      newRevision.priority
    );

    res.status(201).json({
      status: 'success',
      data: {
        revision: newRevision
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!revision) {
      return next(new AppError('No revision found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        revision
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!revision) {
      return next(new AppError('No revision found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.getUpcomingRevisions = async (req, res, next) => {
  try {
    const revisions = await Revision.find({
      user: req.user.id,
      status: 'scheduled',
      scheduledDate: { $gte: new Date() }
    })
      .populate('subject', 'name')
      .sort({ scheduledDate: 1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      results: revisions.length,
      data: {
        revisions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCompletedRevisions = async (req, res, next) => {
  try {
    const revisions = await Revision.find({
      user: req.user.id,
      status: 'completed'
    })
      .populate('subject', 'name')
      .sort({ completedDate: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      results: revisions.length,
      data: {
        revisions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.completeRevision = async (req, res, next) => {
  try {
    const revision = await Revision.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!revision) {
      return next(new AppError('No revision found with that ID', 404));
    }

    revision.status = 'completed';
    revision.completedDate = Date.now();
    revision.performance = req.body.performance;
    revision.notes = req.body.notes;

    // Update spaced repetition data
    revision.updateSpacedRepetition(req.body.performance);
    await revision.save();

    res.status(200).json({
      status: 'success',
      data: {
        revision
      }
    });
  } catch (err) {
    next(err);
  }
}; 