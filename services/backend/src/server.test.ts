import { build } from "./server";

describe("Server", () => {
  it("Should return server instance", async () => {
    const app = build();

    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
