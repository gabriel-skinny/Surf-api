import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { BeachDb } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForeCastController {
  @Get('')
  public async getForecastForeLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await BeachDb.find({user: req.decoded?.id});
      const forecastData = await forecast.processForeCastForBeaches(beaches);

      res.status(200).send(forecastData);
    } catch (err) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
