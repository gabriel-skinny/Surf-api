import { Controller, Get } from '@overnightjs/core';
import { BeachDb } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';

const forecast = new Forecast();

@Controller('forecast')
export class ForeCastController {
  @Get('')
  public async getForecastForeLoggedUser(_: Request, res: Response): Promise<void> {
    try {
      const beaches = await BeachDb.find({});
      const forecastData = await forecast.processForeCastForBeaches(beaches);

      res.status(200).send(forecastData);
    }catch(err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  }
}
