import { Request, Response, NextFunction, Router } from 'express';
import { default as UserModel, UserType } from '../model/user';
import * as jwt from 'jsonwebtoken';
import * as util from 'util';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

class AuthController {

  constructor(private router: Router) {

    router.post('/auth/login', async (req: Request, resp: Response) => {
      req.assert('email', 'Email is not valid').isEmail();
      req.assert('password', 'Password cannot be blank').notEmpty();
      req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

      const errors = req.validationErrors();

      if (errors) {
        return resp.status(401).send({
          msg: errors,
          code: 406
        });
      }
      try {
        const user: any = await UserModel.findOne({email: req.body.email}).exec();
        if (!user) {
          return resp.status(404).send({
            msg: 'User not found',
            code: 404
          });
        }
        const isSamePass = await (user as UserType).comparePassword(req.body.password, (user.password));
        if (isSamePass) {
          const token = jwt.sign({
            email: user.email,
            role: user.role,
            username: user.username
          }, process.env.JWT_SECRET, {expiresIn: '1h'});
          return resp.status(200).send(token);
        } else {
          return resp.status(401).send({
            msg: 'Unauthorized',
            status: 401
          });
        }
      } catch (error) {
        return resp.status(400).send({
          msg: error,
          code: 400
        });
      }
    });

    router.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
      req.assert('password', 'Password cannot be blank').notEmpty();
      req.assert('fname', 'First name must be specified').notEmpty();
      req.assert('lname', 'Last name must be specified').notEmpty();
      req.assert('username', 'Username must be specified').notEmpty();
      req.assert('role', 'Role must be specified').notEmpty();

      req.assert('email', 'Email is not valid').isEmail();
      req.sanitize('email').normalizeEmail({gmail_remove_dots: false});

      const errors = req.validationErrors();

      if (errors) {
        return res.status(401).send({
          msg: errors,
          status: 401
        });
      }

      const user: any = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        role: req.body.role,
        profile: {
          fname: req.body.fname,
          lname: req.body.lname,
          info: req.body.info,
        }
      };

      try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({$or: [{email: req.body.email}, {username: req.body.username}]}).exec();
        if (existingUser) {
          return res.status(409).send({
            msg: 'User already exists',
            status: 409
          });
        }
        // Generate activation token
        const qRandomBytes = (util as any).promisify(crypto.randomBytes);
        const cryptedValue = await qRandomBytes(16);
        user.activationToken = cryptedValue.toString('hex');
        user.activationExpires = new Date(Date.now() + 3600000); // 1 hour
        const userDocument = new UserModel(user);
        // Save new user
        const savedUser = await userDocument.save();
        console.log('User saved!', savedUser);
        // Send activation email
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true,
          socketTimeout: 5000,
          logger: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
        const mailOptions = {
          to: req.body.email,
          from: process.env.SMTP_USER,
          subject: 'Account activation',
          text: `You are receiving this email because you (or someone else) have requested account activation.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/activation/${req.body.activationToken}\n\n
          If you did not request this, please ignore this email\n`
        };
        transporter.sendMail(mailOptions).then((sentMessage: SentMessageInfo) => {
          res.status(200).send(sentMessage);
        }, (error) => {
          console.log(error);
          return res.status(401).send({
            msg: error,
            status: 400
          });
        });
      } catch (error) {
        return next(error);
      }
    });

    router.get('/auth/activate/:activationToken', async (req: Request, res: Response) => {
      try {
        const user: any = UserModel.findOneAndUpdate({activationToken: req.params.activationToken}, {active: true}, {new: true}).exec();
        const token = jwt.sign({
          email: user.email,
          role: user.role,
          username: user.username
        }, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).send(token);
      } catch (error) {
        console.log(error);
        res.status(400).send({
          msg: 'Activation token expired, please register again',
          status: 400
        });
      }
    });

  }

}

export default AuthController;