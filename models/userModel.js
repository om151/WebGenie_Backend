import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: [2, 'Username must be at least 2 characters long'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, 'Email must be at least 5 characters long'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
  ],
});

// Instance method to generate JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Instance method to compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

export default User;
