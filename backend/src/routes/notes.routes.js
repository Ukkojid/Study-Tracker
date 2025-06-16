const express = require('express');
const { body } = require('express-validator');
const notesController = require('../controllers/notes.controller');
const { validateRequest } = require('../middleware/validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Validation middleware
const createNoteValidation = [
  body('subject').isMongoId().withMessage('Invalid subject ID'),
  body('topic').trim().notEmpty().withMessage('Topic name is required'),
  body('content').trim().notEmpty().withMessage('Note content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

const updateNoteValidation = [
  body('content').optional().trim().notEmpty().withMessage('Note content cannot be empty'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

// Routes
router
  .route('/')
  .get(notesController.getAllNotes)
  .post(createNoteValidation, validateRequest, notesController.createNote);

router
  .route('/:id')
  .get(notesController.getNote)
  .patch(updateNoteValidation, validateRequest, notesController.updateNote)
  .delete(notesController.deleteNote);

router
  .route('/subject/:subjectId')
  .get(notesController.getNotesBySubject);

router
  .route('/topic/:topic')
  .get(notesController.getNotesByTopic);

module.exports = router; 