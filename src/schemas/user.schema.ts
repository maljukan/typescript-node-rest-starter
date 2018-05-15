import * as mongoose from 'mongoose';
import { AuthToken } from '../models/auth-token';
import { Profile } from '../models/profile';
import * as bcrypt from 'bcrypt-nodejs';
import * as util from 'util';
import { User } from '../models/user';

export type UserType = mongoose.Document & {

  email: string,
  username: string,
  password: string,
  role: string,

  active: boolean,

  passwordResetToken: string,
  passwordResetExpires: Date,

  activationToken: string,
  activationExpires: Date,

  tokens: Array<AuthToken>,

  profile: Profile,

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void
};

const UserSchema = new mongoose.Schema({
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
UserSchema.pre('save', function save(next) {
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

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  const qCompare = (util as any).promisify(bcrypt.compare);
  return qCompare(candidatePassword, this.password);
};

type UserType = User & mongoose.Document;
const UserRepository = mongoose.model<UserType>('User', UserSchema);
export default UserRepository;