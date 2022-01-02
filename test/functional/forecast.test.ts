import { BeachDb } from '@src/models/beach';
import nock from 'nock';
import stormGlassWeather3HourseFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse from '@test/fixtures/api_forecast_response_1.json';
import { User } from '@src/models/user';
import { Auth } from '@src/services/auth';

describe('Beach forecast functional tests', () => {
  const defaultUser = {
    name: "Gabriel",
    email: "gabriel@gmail.com",
    password: "12312"
  };

  let token: string;
  beforeEach(async () => {
    await BeachDb.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();

    const beach = new BeachDb({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: 'E',
      user: user.id
    });

    await beach.save();

    token = Auth.generateToken(user.toJSON());
  });

  it('Should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        params:
          'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed',
        source: 'noaa',
        lat: '-33.792726',
        lng: '151.289824',
      })
      .reply(200, stormGlassWeather3HourseFixture);

    const { body, status } = await global.testRequest.get('/forecast')
    .set({ "x-access-token": token})

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse);
  });

  it('Should return status code 500 when some error occurred during processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        params:
          'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed',
        source: 'noaa',
        lat: '-33.792726',
        lng: '151.289824',
      })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest.get('/forecast')
    .set({ "x-access-token": token});

    expect(status).toBe(500);
  });
});
