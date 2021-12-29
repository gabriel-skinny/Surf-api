import { InternalError } from '@src/util/internal-errors';
import config, { IConfig } from "config";
import * as HTTPUTIL from "@src/util/request";

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForeCastPoint {
  readonly time: string;
  readonly waveHeight: number;
  readonly waveDirection: number;
  readonly swellDirection: number;
  readonly swellHeight: number;
  readonly swellPeriod: number;
  readonly windDirection: number;
  readonly windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error when trying to communicate to StormGlass'
    super(`${internalMessage}: ${message}`);
  }
}

export class ServiceResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error returned by StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass')

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed';
  readonly source = 'noaa';

  constructor(protected request = new HTTPUTIL.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForeCastPoint[]> {
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get("apiUrl")}/weather/point?params=${this.stormGlassAPIParams}&source=${this.source}&end=1592111&lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get("apiToken"),
          },
        }
      );
      
      return this.normalizeResponse(response.data);
    }catch(err: any) {
      if (HTTPUTIL.Request.isRequestError(err)) {
        throw new ServiceResponseError(`Error ${JSON.stringify(err.response.data)} Code: ${err.response.status}`)
      }
      throw new ClientRequestError(err.message);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForeCastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      waveHeight: point.waveHeight[this.source],
      waveDirection: point.waveDirection[this.source],
      swellDirection: point.swellDirection[this.source],
      swellHeight: point.swellHeight[this.source],
      swellPeriod: point.swellPeriod[this.source],
      windDirection: point.windDirection[this.source],
      windSpeed: point.windSpeed[this.source],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.source] &&
      point.swellHeight?.[this.source] &&
      point.swellPeriod?.[this.source] &&
      point.waveDirection?.[this.source] &&
      point.waveHeight?.[this.source] &&
      point.windDirection?.[this.source] &&
      point.windSpeed?.[this.source]
    );
  }
}
