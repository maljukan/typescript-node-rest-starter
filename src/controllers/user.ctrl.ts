import { Request, Response, Router } from 'express';
import UserModel from '../model/user';

class UserController {

  constructor(private router: Router) {

    router.get('/users', async (req: Request, resp: Response) => {
      try {
        const users = UserModel.find().exec();
        resp.status(200).send(users);
      } catch (error) {
        resp.send({
          msg: 'Not found',
          status: 404
        });
      }
    });

  }

}

export default UserController;