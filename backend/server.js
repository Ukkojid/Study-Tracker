const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent parameter pollution

// Rate limiting
// const limiter = rateLimit({
//   max: 100, // Limit each IP to 100 requests per windowMs
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// Compression middleware
app.use(compression());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.FILE_UPLOAD_PATH)));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
// app.use('/api/user', require('./src/routes/user.routes'));
app.use('/api/subjects', require('./src/routes/subjects.routes'));
app.use('/api/revisions', require('./src/routes/revisions.routes'));
app.use('/api/notes', require('./src/routes/notes.routes'));
app.use('/api/files', require('./src/routes/files.routes'));
app.use('/api/progress', require('./src/routes/progress.routes'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build/index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

  

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
}); 
