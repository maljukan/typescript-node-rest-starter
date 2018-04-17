import { default as UserRepository } from '../repositories/user.repo';
import { UserType } from '../types/user';
import * as bcrypt from 'bcrypt-nodejs';
import * as util from 'util';

/**
 * @class UserService
 */
class UserService {

  /**
   * @description Fetches single user from the storage by email
   * @param email
   * @returns {Promise<UserType>}
   */
  async findByEmail(email): Promise<UserType> {
    return await UserRepository.findOne({email: email}).lean().exec() as UserType;
  }

  /**
   * @description Fetches single user from the storage by email or username
   * @param username
   * @param email
   * @returns {Promise<UserType>}
   */
  async findByUsernameOrEmail(username, email): Promise<UserType> {
    return await UserRepository.findOne({$or: [{email: email}, {username: username}]}).lean().exec() as UserType;
  }

  /**
   * @description Saves the user in the storage
   * @param {UserType} user
   * @returns {Promise<UserType>}
   */
  async save(user: UserType): Promise<UserType> {
    return (await new UserRepository(user).save()).toObject();
  }

  /**
   * @description Fetches single user by activationToken and sets active flag
   * @param activationToken
   * @returns {Promise<UserType>}
   */
  async findOneAndUpdate(activationToken): Promise<UserType> {
    return await UserRepository.findOneAndUpdate({activationToken: activationToken}, {active: true}, {new: true}).lean().exec() as UserType;
  }

  /**
   * @description Fetches all users from the storage
   * @returns {Promise<UserType[]>}
   */
  async findAll(): Promise<UserType[]> {
    return (await UserRepository.find().lean().exec()) as UserType[];
  }

  /**
   * @description Compares encrypted and decrypted passwords
   * @param {string} candidatePassword
   * @param storedPassword
   * @returns {boolean}
   */
  comparePassword(candidatePassword: string, storedPassword): boolean {
    const qCompare = (util as any).promisify(bcrypt.compare);
    return qCompare(candidatePassword, storedPassword);
  }
}

export default new UserService();