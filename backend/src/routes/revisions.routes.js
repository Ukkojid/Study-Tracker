const express = require('express');
const { body } = require('express-validator');
const revisionsController = require('../controllers/revisions.controller');
const { validateRequest } = require('../middleware/validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Validation middleware
const createRevisionValidation = [
  body('subject').isMongoId().withMessage('Invalid subject ID'),
  body('topic').trim().notEmpty().withMessage('Topic name is required'),
  body('scheduledDate').isISO8601().withMessage('Invalid date format'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
];

const updateRevisionValidation = [
  body('scheduledDate').optional().isISO8601().withMessage('Invalid date format'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('status').optional().isIn(['scheduled', 'completed', 'missed']).withMessage('Invalid status'),
  body('performance').optional().isInt({ min: 0, max: 100 }).withMessage('Performance must be between 0 and 100'),
  body('notes').optional().trim(),
];

// Routes
router
  .route('/')
  .get(revisionsController.getAllRevisions)
  .post(createRevisionValidation, validateRequest, revisionsController.createRevision);

router
  .route('/:id')
  .get(revisionsController.getRevision)
  .patch(updateRevisionValidation, validateRequest, revisionsController.updateRevision)
  .delete(revisionsController.deleteRevision);

router
  .route('/upcoming')
  .get(revisionsController.getUpcomingRevisions);

router
  .route('/completed')
  .get(revisionsController.getCompletedRevisions);

router
  .route('/:id/complete')
  .patch(revisionsController.completeRevision);

module.exports = router; 