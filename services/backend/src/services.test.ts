import faker from "faker";
import {
  removeUserFromDb,
  addUserToDb,
  emailAlreadyExists,
  comparePasswords,
  findUserByEmailQuery,
  hashPassword,
  signToken,
  verifyToken,
} from "./services";

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

describe("Test services's", () => {
  describe("hash password", () => {
    it("Should return true", async () => {
      const password = "test1234%";
      const hashedPassword = await hashPassword(password);
      const isSamePassword = await comparePasswords(
        password,
        hashedPassword as string
      );

      expect(isSamePassword).toBeDefined();
      expect(isSamePassword).toBe(true);
    });
  });

  describe("Token signing", () => {
    it("Should return true", async () => {
      const token = signToken(["admin"]);
      const isValidToken = verifyToken(token);

      expect(token).toBeDefined();
      expect(isValidToken).toBeDefined();
    });
  });
});
