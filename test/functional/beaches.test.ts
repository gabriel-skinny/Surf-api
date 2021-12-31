import { Beach } from "@src/models/beach"

describe("Beaches functional tests", () => {
  beforeAll(async () => await Beach.deleteMany({}))
  
  describe("When creating a beach", () => {
    it("should create a beach with success", async() => {
      const newBeach =  {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: "E"
      }

      const response = await global.testRequest.post("/beaches").send(newBeach);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    })

    it("should return 422 when passing a field that is not valid", async () => {
      const newBeach = {
        lat: "invalid-field",
        lng: 151.13123,
        name: "Manly",
        position: "E"
      }

      const response = await global.testRequest.post("/beaches").send(newBeach);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 
        "Beach validation failed: lat: Cast to Number failed for value \"invalid-field\" (type string) at path \"lat\""
      })

    })

    it("should return 500 when error is not an instance of Mongoose Internal Error", async () => {
      const newBeach = {
        lat: "invalid-field",
        lng: 151.13123,
        name: "Manly",
        position: "E"
      }

      const mockFn = jest.spyOn(Beach.prototype, "save");
      mockFn.mockRejectedValue(() => {});

      const response = await global.testRequest.post("/beaches").send(newBeach);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({error: "Internal error"});

    })
  })
})