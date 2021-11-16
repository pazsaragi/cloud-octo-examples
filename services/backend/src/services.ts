import { db } from "./aws";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isEmpty, isNil, not, or, pipe, pipeP, tryCatch, when } from "ramda";
import { ifErrorFoundThrowError, returnErrorDataObject } from "./utils";
import { ICreateUser, IDeleteUser, IUser } from "./interfaces";
import { ENV } from "./constants";

export const findUserByEmailQuery = async (email: string): Promise<IUser> => {
  return await db
    .getItem({
      Key: {
        pk: { S: email },
        sk: { S: email },
      },
      TableName: process.env.DB_TABLE_NAME || "auth-table",
    })
    .promise()
    .then((data: any) => {
      return {
        ...data.Item,
      };
    });
};

/**
 * Checks input is not empty
 *
 * @param data
 * @returns
 */
export const emailAlreadyExists = (data: any) => not(isEmpty(data));

export const addUserToDb = async ({
  email,
  hashedPassword,
  roles,
}: ICreateUser) => {
  return await db
    .putItem({
      Item: {
        pk: { S: email },
        sk: { S: email },
        password: { S: hashedPassword },
        roles: { L: roles },
      },
      TableName: process.env.DB_TABLE_NAME || "auth-table",
    })
    .promise()
    .then((r) => r.$response)
    .catch((e: Error) => returnErrorDataObject("Failed to find user")(e));
};

export const removeUserFromDb = async ({ email }: IDeleteUser) => {
  return await db
    .deleteItem({
      Key: {
        pk: {
          S: email,
        },
        sk: {
          S: email,
        },
      },
      TableName: process.env.DB_TABLE_NAME || "auth-table",
    })
    .promise()
    .then((r) => r.$response)
    .catch((e: Error) => returnErrorDataObject("Failed to remove user")(e));
};

/**
 * Hashes password or returns an error
 *
 * @param password
 * @returns
 */
export const hashPassword = async (password: string) => {
  return await bcrypt
    .hash(password, 10)
    .then((hash) => hash)
    .catch((e: Error) => returnErrorDataObject(e.message)(e));
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword).then((r) => r);
};

export const signToken = (roles: string[]): string | any => {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
      iat: Math.floor(Date.now() / 1000) + 60 * 5,
      iss: "apig",
      sub: "apig",
      aud: ["apig"],
      roles: roles,
    },
    "secretsquirrel"
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, "secretsquirrel");
};

export const storeRefreshToken = async (
  tokenId: string
): Promise<any | Error> => {
  return await db
    .putItem({
      Item: {
        pk: { S: tokenId },
        sk: { S: tokenId },
      },
      TableName: process.env.DB_TABLE_NAME || "token-table",
    })
    .promise()
    .then((data: any) => data);
};