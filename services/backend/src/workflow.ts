import { ifElse, not, pipe, unless } from "ramda";
import { IRegisterUser, IDBRole, ILoginUser } from "./interfaces";
import {
  findUserByEmailQuery,
  emailAlreadyExists,
  hashPassword,
  addUserToDb,
  comparePasswords,
  signToken,
} from "./services";
import {
  ifUndefinedReturnError,
  ifErrorFoundThrowError,
  returnErrorDataObject,
  mapIRoleToDbRole,
  mapDbRoleToIRole,
} from "./utils";

/**
 * Register User Workflow
 *
 * 1. Check if a user is trying to re-register.
 * 2. Hash password.
 * 3. Persist user to database.
 * 4. Returns true if successful.
 */
export const registerWorkflow = async (data: IRegisterUser) => {
  // Check input
  ifErrorFoundThrowError(ifUndefinedReturnError(data));

  // 1. Check if email exists in db
  pipe(
    async () => await findUserByEmailQuery(data.email),
    (user: any) => {
      ifErrorFoundThrowError(ifUndefinedReturnError(user));
      // return the error data object
      // unless the email does not already exist
      unless(
        () => not(emailAlreadyExists(user)),
        () =>
          returnErrorDataObject("User already exists.")({
            message: "User already exists.",
          })
      );
    }
  );

  // 2.
  const hashedPassword = await hashPassword(data.password);
  ifErrorFoundThrowError(hashedPassword);

  const rolesList: IDBRole[] = data.roles.map(mapIRoleToDbRole);

  // 3.
  const response = await addUserToDb({
    email: data.email,
    hashedPassword: hashedPassword as string,
    roles: rolesList,
  });

  ifErrorFoundThrowError(response);

  // 4.
  return true;
};

export const loginWorkflow = async (
  data: ILoginUser
): Promise<string | boolean> => {
  // Check input
  ifErrorFoundThrowError(ifUndefinedReturnError(data));

  const user = await findUserByEmailQuery(data.email);
  ifErrorFoundThrowError(ifUndefinedReturnError(user));

  const samePassword = await comparePasswords(data.password, user.password.S);

  ifErrorFoundThrowError(ifUndefinedReturnError(samePassword));

  const response = ifElse(
    (samePassword: boolean) => samePassword,
    () => signToken(user.roles.L.map(mapDbRoleToIRole)),
    () => false
  )(samePassword);

  return response;
};