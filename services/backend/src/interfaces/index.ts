export type Modify<T, R> = Omit<T, keyof R> & R;

export interface IDBRole {
  S: string;
}

export interface IUser {
  email: { S: string };
  password: { S: string };
  roles: { L: IDBRole[] };
}

export interface IRegisterUser {
  email: string;
  password: string;
  roles: string[];
}

export interface ICreateUser
  extends Omit<
    Modify<
      IRegisterUser,
      {
        roles: IDBRole[];
      }
    >,
    "password"
  > {
  hashedPassword: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IDeleteUser {
  email: string;
}
