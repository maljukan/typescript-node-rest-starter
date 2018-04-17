import { Request, Response, Router } from 'express';
import UserService from '../services/user.srvc';

class UserController {

  constructor(private router: Router) {

    router.get('/users', async (req: Request, resp: Response) => {
      try {
        const users = await UserService.findAll();
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