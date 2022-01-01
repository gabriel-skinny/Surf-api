import { Controller, Post } from '@overnightjs/core';
import { BeachDb } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseController } from '.';

@Controller('beaches')
export class BeachController extends BaseController {
  @Post('')
  public async createBeach(req: Request, res: Response): Promise<void> {
    try {
      const beach = new BeachDb(req.body);
      const result = await beach.save();

      res.status(201).send(result);
    } catch (error: any) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
