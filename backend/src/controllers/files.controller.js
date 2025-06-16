const File = require('../models/file.model');
const AppError = require('../utils/appError');
const fs = require('fs').promises;
const path = require('path');

exports.getAllFiles = async (req, res, next) => {
  try {
    const files = await File.find({ user: req.user.id })
      .populate('subject', 'name')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: files.length,
      data: {
        files
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('subject', 'name');

    if (!file) {
      return next(new AppError('No file found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        file
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const newFile = await File.create({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      subject: req.body.subject,
      topic: req.body.topic,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        file: newFile
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!file) {
      return next(new AppError('No file found with that ID', 404));
    }

    // Delete file from filesystem
    await fs.unlink(file.path);

    // Delete file from database
    await file.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!file) {
      return next(new AppError('No file found with that ID', 404));
    }

    // Update last accessed and downloads count
    await file.updateLastAccessed();

    res.download(file.path, file.originalName);
  } catch (err) {
    next(err);
  }
};

exports.getFilesBySubject = async (req, res, next) => {
  try {
    const files = await File.find({
      subject: req.params.subjectId,
      user: req.user.id
    })
      .populate('subject', 'name')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: files.length,
      data: {
        files
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getFilesByTopic = async (req, res, next) => {
  try {
    const files = await File.find({
      topic: req.params.topic,
      user: req.user.id
    })
      .populate('subject', 'name')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: files.length,
      data: {
        files
      }
    });
  } catch (err) {
    next(err);
  }
}; 