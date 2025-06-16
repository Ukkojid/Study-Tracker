const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    studyStreak: {
      type: Number,
      default: 0
    },
    lastStudyDate: Date,
    totalStudyTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
userSchema.virtual('subjects', {
  ref: 'Subject',
  foreignField: 'user',
  localField: '_id'
});

userSchema.virtual('revisions', {
  ref: 'Revision',
  foreignField: 'user',
  localField: '_id'
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update passwordChangedAt property when password is changed
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Only find active users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Instance method to update study streak
userSchema.methods.updateStudyStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastStudyDate) {
    this.studyStreak = 1;
  } else {
    const lastStudy = new Date(this.lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already studied today, no change in streak
      return;
    } else if (diffDays === 1) {
      // Studied yesterday, increment streak
      this.studyStreak += 1;
    } else {
      // Missed a day, reset streak
      this.studyStreak = 1;
    }
  }

  this.lastStudyDate = today;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 