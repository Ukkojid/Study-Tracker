const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'File must belong to a user'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'File must belong to a subject'],
    },
    topic: {
      type: String,
      required: [true, 'Topic name is required'],
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'File type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    path: {
      type: String,
      required: [true, 'File path is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    downloads: {
      type: Number,
      default: 0,
    },
    lastAccessed: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
fileSchema.index({ user: 1, subject: 1 });
fileSchema.index({ user: 1, topic: 1 });
fileSchema.index({ tags: 1 });

// Update lastAccessed timestamp
fileSchema.methods.updateLastAccessed = function() {
  this.lastAccessed = new Date();
  this.downloads += 1;
  return this.save();
};

// Virtual for file size in MB
fileSchema.virtual('sizeInMB').get(function() {
  return (this.size / (1024 * 1024)).toFixed(2);
});

// Virtual for file type
fileSchema.virtual('fileType').get(function() {
  return this.mimeType.split('/')[0];
});

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

const File = mongoose.model('File', fileSchema);

module.exports = File; 