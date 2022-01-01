import { User } from "@src/models/user"
import { Auth } from "@src/services/auth";

describe("User functional test", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  })

  describe("When creating a new user", () => {
    it("should successfully create a new user with encrypted password", async () => {
      const newUser = {
        name: "Gabriel",
        email:"gabriel@gmail.com",
        password: "1231"
      };

      const response = await global.testRequest.post("/users").send(newUser);


      expect(response.status).toBe(201);
      await expect(Auth.comparePassword(newUser.password, response.body.password)).resolves.toBeTruthy();
      expect(response.body).toEqual(expect.objectContaining({...newUser, password: expect.any(String)}));
    })

    it("should throw 422 when there is a validation error", async () => {
      const newUser = {
        email:"gabriel@gmail.com",
        password: "1231"
      };

      const response = await global.testRequest.post("/users").send(newUser);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: "User validation failed: name: Path `name` is required."
      });
    })

    it("Should return 409 when the email already exists", async () => {
      const newUser = {
        name: "Gabriel2",
        email:"gabriel@gmail.com",
        password: "1231"
      };

      await global.testRequest.post("/users").send(newUser);
      const response = await global.testRequest.post("/users").send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: "User validation failed: email: already exists in the database."
      });
    })
  });

  describe("When authenticating a new user", () => {
    it("Should generate a token for a valid user", async () => {
      const newUser = {
        name: "Gabriel",
        email:"gabriel@gmail.com",
        password: "1231"
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post("/users/authenticate")
        .send({ email: newUser.email, password: newUser.password});
      
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String)})
      )
    })

    it("Should return UNAUTHORIZED if the user does not exists", async () => {
      
      const response = await global.testRequest
        .post("/users/authenticate")
        .send({ email: "non-existing@gmail.com", password: "none"});
      
      expect(response.status).toBe(401);
    })

    it.only("Should return UNAUTHORIZED if the password does not match with the existing user", async () => {
      const newUser = {
        name: "Gabriel",
        email:"gabriel@gmail.com",
        password: "1231"
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post("/users/authenticate")
        .send({ email: newUser.email, password: "otherpassword"});
      
      expect(response.status).toBe(401);
    })
  })
})