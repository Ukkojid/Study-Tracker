const express = require('express');
const progressController = require('../controllers/progress.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes
router
  .route('/overview')
  .get(progressController.getProgressOverview);

router
  .route('/subjects')
  .get(progressController.getSubjectProgress);

router
  .route('/topics')
  .get(progressController.getTopicProgress);

router
  .route('/study-streak')
  .get(progressController.getStudyStreak);

router
  .route('/study-time')
  .get(progressController.getStudyTime);

router
  .route('/performance')
  .get(progressController.getPerformanceMetrics);

module.exports = router; 