import { User } from "@src/models/user"

describe("User functional test", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  })

  describe("When creating a new user", () => {
    it("should successfully create a new user", async () => {
      const newUser = {
        name: "Gabriel",
        email:"gabriel@gmail.com",
        passowrd: "1231"
      };

      const response = await global.testRequest.post("/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    })
  })
})