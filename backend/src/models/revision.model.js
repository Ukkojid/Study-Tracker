const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Revision must belong to a user'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Revision must belong to a subject'],
    },
    topic: {
      type: String,
      required: [true, 'Topic name is required'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    completedDate: Date,
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed'],
      default: 'scheduled',
    },
    performance: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty level is required'],
    },
    spacedRepetition: {
      interval: {
        type: Number,
        default: 1, // days
      },
      easeFactor: {
        type: Number,
        default: 2.5,
      },
      repetitions: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
revisionSchema.index({ user: 1, scheduledDate: 1 });
revisionSchema.index({ subject: 1, topic: 1 });
revisionSchema.index({ status: 1 });

// Calculate next revision date based on spaced repetition
revisionSchema.methods.calculateNextRevision = function() {
  if (this.status !== 'completed') return null;

  const { interval, easeFactor, repetitions } = this.spacedRepetition;
  const newInterval = interval * easeFactor;
  const nextDate = new Date(this.completedDate);
  nextDate.setDate(nextDate.getDate() + newInterval);

  return nextDate;
};

// Update spaced repetition data after completion
revisionSchema.methods.updateSpacedRepetition = function(performance) {
  const { interval, easeFactor, repetitions } = this.spacedRepetition;
  
  // Update ease factor based on performance
  const newEaseFactor = easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
  
  // Update interval based on ease factor
  const newInterval = interval * newEaseFactor;
  
  this.spacedRepetition = {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: repetitions + 1,
  };
};

const Revision = mongoose.model('Revision', revisionSchema);

module.exports = Revision; 