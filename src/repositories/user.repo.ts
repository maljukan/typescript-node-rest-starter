import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  username: String,
  password: String,
  role: String,

  active: Boolean,

  passwordResetToken: String,
  passwordResetExpires: Date,

  activationToken: String,
  activationExpires: Date,

  profile: {
    fname: String,
    lname: String,
    info: String
  }
}, {timestamps: true});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const UserRepository = mongoose.model('User', userSchema);
export default UserRepository;