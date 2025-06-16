const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must belong to a user']
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'A note must belong to a subject']
    },
    topic: {
      type: String,
      required: [true, 'A note must have a topic'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'A note must have content'],
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    lastEdited: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
noteSchema.index({ user: 1, subject: 1 });
noteSchema.index({ user: 1, topic: 1 });
noteSchema.index({ tags: 1 });

// Update lastEdited timestamp before saving
noteSchema.pre('save', function(next) {
  this.lastEdited = new Date();
  next();
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note; 