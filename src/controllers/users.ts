import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Auth } from '@src/services/auth';
import { Request, Response } from 'express';
import { BaseController } from '.';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();

      res.status(201).send(newUser);
    } catch (err: any) {
      this.sendCreatedUpdateErrorResponse(res, err);
    }
  }

  @Post("authenticate")
  public async authenticate(req: Request, res: Response): Promise<Response | undefined> {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({
        code: 401,
        error: "User not found"
      });
    }

    if(!(await Auth.comparePassword(password, user.password))) {
      return res.status(401).send({
        code: 401,
        error: "Password does not match"
      });
    }

    const token = Auth.generateToken(user.toJSON());

    return res.status(200).send({token: "Fake-token"});
  }
}
