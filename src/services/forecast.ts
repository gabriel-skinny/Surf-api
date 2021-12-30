import { ForeCastPoint, StormGlass } from "@src/clients/stormGlass";
import { InternalError } from "@src/util/internal-errors";

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

export interface TimeForecast {
  time: string;
  forecast: BeachWithPoints[];
}


export interface BeachWithPoints extends Omit<Beach, 'user'>, ForeCastPoint {
  rating: number;
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    const internalMessage = "Unexpected error durring the forecast processing";
    super(`${internalMessage}: ${message}`);
  }
}


export class Forecast {
  constructor(private stormGlass = new StormGlass()) {};

  async processForeCastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    let pointsWithCorrectSources:BeachWithPoints[] = [];

    try {
      for(const beach of beaches) {
        const stormGlassPoints = await this.stormGlass.fetchPoints(beach.lat, beach.lng);

        pointsWithCorrectSources.push(...this.enrichData(stormGlassPoints, beach));
    }

    return this.mapForecastByTime(pointsWithCorrectSources);
  }catch(err: any){
      throw new ForecastProcessingInternalError(err.message);
    }

  }

  private enrichData(points: ForeCastPoint[], beach: Beach): BeachWithPoints[] {
    return points.map(point => (
      {...point, ... {
        lat: beach.lat,
        lng: beach.lng,
        position: beach.position,
        name: beach.name,
        rating: 1,
      }
    }))
  }

  private mapForecastByTime(forecast: BeachWithPoints[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find(field => field.time === point.time);

      if(timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }

    return forecastByTime;
  }
}