import { BeachDb } from '@src/models/beach';
import { User } from '@src/models/user';
import { Auth } from '@src/services/auth';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: "Gabriel",
    email: "gabriel@gmail.com",
    password: "12312"
  };

  let token: string;
  beforeEach(async () => {
    await BeachDb.deleteMany({})
    await User.deleteMany({});

    const user = await new User(defaultUser).save();
    token = Auth.generateToken(user.toJSON());
  })

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
      .post('/beaches')
      .set({ "x-access-token": token})
      .send(newBeach);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when passing a field that is not valid', async () => {
      const newBeach = {
        lat: 'invalid-field',
        lng: 151.13123,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
      .post('/beaches')
      .set({ "x-access-token": token})
      .send(newBeach);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid-field" (type string) at path "lat"',
      });
    });

    it('should return 500 when error is not an instance of Mongoose Internal Error', async () => {
      const newBeach = {
        lat: 'invalid-field',
        lng: 151.13123,
        name: 'Manly',
        position: 'E',
      };

      const mockFn = jest.spyOn(BeachDb.prototype, 'save');
      mockFn.mockRejectedValue(() => {});

      const response = await global.testRequest
      .post('/beaches')
      .set({ "x-access-token": token})
      .send(newBeach);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        error: 'Internal error',
      });
    });
  });
});
