import * as express from 'express';
import * as compression from 'compression';  // compresses requests
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as lusca from 'lusca';
import * as dotenv from 'dotenv';
import * as mongo from 'connect-mongo';
import * as mongoose from 'mongoose';
import * as expressValidator from 'express-validator';
import * as bluebird from 'bluebird';
import * as expressJwt from 'express-jwt';
import AuthController from './controllers/auth.ctrl';
import UserController from './controllers/user.ctrl';

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: '.env.example'});

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true}).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  },
).catch(err => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
  // process.exit();
});

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.use(expressJwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
  requestProperty: 'auth',
  getToken: function fromHeader(req: express.Request) {
    if (req.headers.Authorization && (req.headers.Authorization as string).split(' ')[0] === 'Bearer') {
      return (req.headers.Authorization as string).split(' ')[1];
    }
  }
}));

const router: express.Router = express.Router();
new AuthController(router);
new UserController(router);

app.use(router);
app.use((req: express.Request, resp: express.Response) => {
  resp.status(404).send({
    msg: 'Not Found!'
  });
});


module.exports = app;