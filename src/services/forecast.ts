import { ForeCastPoint, StormGlass } from "@src/clients/stormGlass";
import { nextTick } from "process";

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface Beach {
  lat: number;
  lng: number;
  name: string;
  position: BeachPosition;
  user: string;
}

export interface BechWithPoints extends Omit<Beach, 'user'>, ForeCastPoint {
  rating: number;
}

export class Forecast {
  constructor(private stormGlass = new StormGlass()) {};

  async processForeCastForBeaches(beaches: Beach[]): Promise<BechWithPoints[]> {
    let pointsWithCorrectSources:BechWithPoints[] = [];

    beaches.map(async beach => {
      const stormGlassPoints = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

      stormGlassPoints.map(point => {
        pointsWithCorrectSources.push({...point, ...beach, rating: 1});
      })

      console.log("AQUI 2");
    }) 

    console.log("AQUI")

    return pointsWithCorrectSources;
  }
}