import { Beach } from '@src/models/beach';
import nock from "nock";
import stormGlassWeather3HourseFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse from "@test/fixtures/api_forecast_response_1.json";

describe('Beach forecast functional tests', () => {
  beforeAll(async() => {
    await Beach.deleteMany({})

    const beach = new Beach({
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: "E"
    })

    await beach.save();
  });
  
  it('Should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', 
    {
      "encodedQueryParams":true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
  })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({"params":"swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed","source":"noaa","end":"1592111","lat":"-33.792726","lng":"151.289824"
    })
      .reply(200, stormGlassWeather3HourseFixture);


    const { body, status } = await global.testRequest.get('/forecast');

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse);
  });

  it("Should return status code 500 when some error occurred during processing", async () => {
    nock('https://api.stormglass.io:443', 
    {
      "encodedQueryParams":true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
   }).defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({"params":"swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed","source":"noaa","end":"1592111","lat":"-33.792726","lng":"151.289824"
    }).replyWithError("Something went wrong");
 

  const { status } = await global.testRequest.get("/forecast");
  
  expect(status).toBe(500);
  })
});
