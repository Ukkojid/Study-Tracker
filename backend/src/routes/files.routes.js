const express = require('express');
const multer = require('multer');
const path = require('path');
const filesController = require('../controllers/files.controller');
const authController = require('../controllers/auth.controller');
const AppError = require('../utils/appError');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', process.env.UPLOAD_PATH));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only specific file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PDF, JPEG, PNG, and DOC files are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) // 5MB
  }
});

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes
router
  .route('/')
  .get(filesController.getAllFiles)
  .post(upload.single('file'), filesController.uploadFile);

router
  .route('/:id')
  .get(filesController.getFile)
  .delete(filesController.deleteFile);

router
  .route('/:id/download')
  .get(filesController.downloadFile);

router
  .route('/subject/:subjectId')
  .get(filesController.getFilesBySubject);

router
  .route('/topic/:topic')
  .get(filesController.getFilesByTopic);

module.exports = router; 