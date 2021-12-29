import { ForeCastPoint, StormGlass } from "@src/clients/stormGlass";

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

    for(const beach of beaches) {
      const stormGlassPoints = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

      stormGlassPoints.map(point => {
        pointsWithCorrectSources.push({...point, ... {
          lat: beach.lat,
          lng: beach.lng,
          position: beach.position,
          name: beach.name,
          rating: 1,
        }});
      })
  }

    return pointsWithCorrectSources;
  }
}