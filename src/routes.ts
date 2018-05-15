import { Router } from 'express';
import AuthController from './controllers/auth.ctrl';
import UserController from './controllers/user.ctrl';

const AuthRouter = Router();
AuthRouter.post('/login', AuthController.login);
AuthRouter.post('/register', AuthController.register);
AuthRouter.get('/activate/:activationToken', AuthController.activate);
export { AuthRouter };

const UserRouter = Router();
UserRouter.get('/', UserController.getAll);
export { UserRouter };

const SwaggerAPIRouter = Router();
export { SwaggerAPIRouter };