const Note = require('../models/note.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get all notes for the current user
exports.getAllNotes = catchAsync(async (req, res, next) => {
  const notes = await Note.find({ user: req.user.id })
    .populate('subject', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes }
  });
});

// Get a single note
exports.getNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user.id
  }).populate('subject', 'name');

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { note }
  });
});

// Create a new note
exports.createNote = catchAsync(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  const note = await Note.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { note }
  });
});

// Update a note
exports.updateNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { note }
  });
});

// Delete a note
exports.deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!note) {
    return next(new AppError('No note found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get notes by subject
exports.getNotesBySubject = catchAsync(async (req, res, next) => {
  const notes = await Note.find({
    user: req.user.id,
    subject: req.params.subjectId
  })
    .populate('subject', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes }
  });
});

// Get notes by topic
exports.getNotesByTopic = catchAsync(async (req, res, next) => {
  const notes = await Note.find({
    user: req.user.id,
    topic: req.params.topic
  })
    .populate('subject', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes }
  });
}); 