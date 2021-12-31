import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { ForeCastController } from './controllers/forecast';
import './util/module-alias';
import * as database from "@src/database";
import { BeachController } from './controllers/beaches';

export class SetupServer extends Server {
  constructor(private port = 3333) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupController();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupController(): void {
    const forecastController = new ForeCastController();
    const beachesController = new BeachController();
    this.addControllers([forecastController, beachesController]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
