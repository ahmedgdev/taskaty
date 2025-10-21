import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    photoUrl: {
      type: String,
      default: 'default.jpg',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    password: {
      type: String,
      minlength: 8,
      required: function () {
        return !this.oauth?.provider;
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    oauth: {
      provider: {
        type: String,
        enum: ['google', 'facebook', 'github'],
      },
      id: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.active;
        delete ret.passwordChangedAt;
      },
    },
  },
);

// PRE-SAVE HOOK TO HASH PASSWORD & UPDATE passwordChangedAt
// NOTE: no need for next() in async hook
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// INSTANCE METHOD TO CHECK IF PASSWORD CHANGED AFTER TOKEN ISSUED
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const jwtTimestampMs = jwtTimestamp * 1000;
  return this.passwordChangedAt.getTime() > jwtTimestampMs;
};

// INSTANCE METHOD TO VERIFY PASSWORD
userSchema.methods.isCorrectPassword = async function (candidatePassword) {
  console.log('this.password: ', this.password);
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  // Create plain random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // store hash token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // update passwordResetExpires
  this.passwordResetExpires = Date.now() + 6 * 60 * 1000;

  // return plain token
  return resetToken;
};
const User = mongoose.model('User', userSchema);
export default User;
