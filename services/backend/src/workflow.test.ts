import { loginWorkflow, registerWorkflow } from "./workflow";
import faker from "faker";
import { removeUserFromDb } from "./services";
import { waitFor } from "./utils";

const validUser1 = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  roles: ["admin", "root"],
};

const validUser2 = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  roles: ["admin", "root"],
};

beforeAll(async () => {
  await registerWorkflow(validUser2);
});

afterAll(async () => {
  console.log("Removing user(s)...");
  await removeUserFromDb(validUser1);
  await removeUserFromDb(validUser2);
});

describe("Test workflow's", () => {
  it("Should return a success message", async () => {
    const response = await registerWorkflow(validUser1);

    expect(response).toBeDefined();
    expect(response).toBe(true);
  });

  it("Should return a jwt", async () => {
    const response = await loginWorkflow(validUser2);

    expect(response).toBeDefined();
  });
});
