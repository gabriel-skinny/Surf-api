import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HourseFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedWeather3HourseFixture from '@test/fixtures/stormglass_normalized_weather_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    mockedAxios.get.mockResolvedValue({
      data: stormGlassWeather3HourseFixture,
    });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalizedWeather3HourseFixture);
  });

  it("It should exclude incomplete data points", async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    const incompleteResponse = {
      hours: [{
        windDirection: {
          noaa: 303,
        },
        time: '2020-05-26T03:50:05-50'
      }]
    }

    mockedAxios.get.mockResolvedValue({
      data: incompleteResponse,
    });

    const stormGlass = new StormGlass(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  })

  it("Should get a generic error when cant reach StormGlass service", async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    mockedAxios.get.mockRejectedValue({ message: 'Network Error'});

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it("Should get an StormGlassResponseError when stormGlass respond with error", async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'] 
        }
      }
    });

    const stormGlass = new StormGlass(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by StormGlass service: Error {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
});
