const express = require('express');
const { body } = require('express-validator');
const subjectsController = require('../controllers/subjects.controller');
const { validateRequest } = require('../middleware/validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Validation middleware
const createSubjectValidation = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('description').optional().trim(),
  body('color').optional().isHexColor().withMessage('Invalid color format'),
];

const updateSubjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Subject name cannot be empty'),
  body('description').optional().trim(),
  body('color').optional().isHexColor().withMessage('Invalid color format'),
];

const createTopicValidation = [
  body('name').trim().notEmpty().withMessage('Topic name is required'),
  body('description').optional().trim(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
];

const updateTopicValidation = [
  body('name').optional().trim().notEmpty().withMessage('Topic name cannot be empty'),
  body('description').optional().trim(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
];

// Routes
router
  .route('/')
  .get(subjectsController.getAllSubjects)
  .post(createSubjectValidation, validateRequest, subjectsController.createSubject);

router
  .route('/:id')
  .get(subjectsController.getSubject)
  .patch(updateSubjectValidation, validateRequest, subjectsController.updateSubject)
  .delete(subjectsController.deleteSubject);

router
  .route('/:id/topics')
  .post(createTopicValidation, validateRequest, subjectsController.createTopic);

router
  .route('/:id/topics/:topicId')
  .patch(updateTopicValidation, validateRequest, subjectsController.updateTopic)
  .delete(subjectsController.deleteTopic);

router
  .route('/:id/topics/:topicId/progress')
  .patch(
    body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    validateRequest,
    subjectsController.updateTopicProgress
  );

module.exports = router; 