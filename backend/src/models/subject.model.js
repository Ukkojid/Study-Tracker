const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A topic must have a name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastRevised: Date,
    nextRevision: Date,
    revisionCount: {
      type: Number,
      default: 0
    },
    notes: [
      {
        content: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A subject must have a name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      default: '#3498db', // Default blue color
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A subject must belong to a user']
    },
    topics: [topicSchema],
    totalProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastStudied: Date,
    studyTime: {
      type: Number,
      default: 0 // Total study time in minutes
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
subjectSchema.virtual('revisions', {
  ref: 'Revision',
  foreignField: 'subject',
  localField: '_id'
});

// Index for better query performance
subjectSchema.index({ user: 1, name: 1 });

// Calculate total progress before saving
subjectSchema.pre('save', function(next) {
  if (this.topics.length === 0) {
    this.totalProgress = 0;
  } else {
    const totalProgress = this.topics.reduce((sum, topic) => sum + topic.progress, 0);
    this.totalProgress = Math.round(totalProgress / this.topics.length);
  }
  next();
});

// Update lastStudied when a topic is revised
subjectSchema.methods.updateLastStudied = function() {
  this.lastStudied = new Date();
};

// Add study time
subjectSchema.methods.addStudyTime = function(minutes) {
  this.studyTime += minutes;
  this.lastStudied = new Date();
};

// Update topic progress
subjectSchema.methods.updateTopicProgress = function(topicId, progress) {
  const topic = this.topics.id(topicId);
  if (!topic) throw new Error('Topic not found');

  topic.progress = progress;
  topic.lastRevised = new Date();
  topic.revisionCount += 1;

  // Calculate next revision date based on performance
  const daysToAdd = progress >= 80 ? 7 : progress >= 60 ? 3 : 1;
  topic.nextRevision = new Date();
  topic.nextRevision.setDate(topic.nextRevision.getDate() + daysToAdd);
};

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject; 