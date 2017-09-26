import mongoose, { Schema } from 'mongoose';
import { hashSync, compareSync } from 'bcrypt-nodejs';
import jwt from 'jsonwebtoken';

import constants from '../config/constants';

const UserSchema = new Schema ({
  username: {
    type: String,
    unique: true
  },
  firstName: String,
  lastName: String,
  avatar: String, // link to an avatar
  password: String,
  email: String
}, { timestamps: true });

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = this._hashPassword(this.password);
    return next()
  }
  return next();
});

UserSchema.methods = {
  _hashPassword(password) {
    return hashSync(password);
  },
  _authenticateUser(password) {
    return compareSync(password, this.password); // this.password is the hashed version
  },
  _createToken() {
    return jwt.sign(
      {
        _id: this._id // creates encrypted token from _id of user
      },
      constants.JWT_SECRET
    );
  }
};

export default mongoose.model('User', UserSchema);
