import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HourseFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalizedWeather3HourseFixture from '@test/fixtures/stormglass_normalized_weather_3_hours.json';
import * as HTTPUtil from "@src/util/request";

jest.mock('@src/util/request');

describe('StormGlass client', () => {

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;

  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    mockedRequest.get.mockResolvedValue({
      data: stormGlassWeather3HourseFixture,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
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

    mockedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  })

  it("Should get a generic error when cant reach StormGlass service", async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error'});

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it("Should get an StormGlassResponseError when stormGlass respond with error", async () => {
    const lat = -33.412312;
    const lng = 151.13213;

    MockedRequestClass.isRequestError.mockReturnValue(true);

    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: {
          errors: ['Rate Limit reached'] 
        }
      }
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by StormGlass service: Error {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
});
