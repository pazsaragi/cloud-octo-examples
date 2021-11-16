import { FastifyReply, FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { Server, IncomingMessage, ServerResponse } from "http";
import {
  isNil,
  isEmpty,
  not,
  or,
  propEq,
  propOr,
  any,
  unless,
  ifElse,
} from "ramda";
import { IDBRole } from "./interfaces";

export const getBodyFromRequest = (
  request: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>
): any => {
  return request.body;
};

export const getParamsFromRequest = (
  request: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>
): any => {
  return request.params;
};

export const matchRuleShort = (str: string, rule: string) => {
  var escapeRegex = (str: string) =>
    str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(
    "^" + rule.split("*").map(escapeRegex).join(".*") + "$"
  ).test(str);
};

export const hasError = propEq("error", true);

export const anyResponseReturnedError = any(hasError);

export const isNotEmptyOrNil = (data: any) =>
  not(or(isNil(data), isEmpty(data)));

export const isEmptyOrNil = (data: any) => or(isNil(data), isEmpty(data));

export const ifEmptyThrowError = (data: any) => {
  return ifElse(isEmptyOrNil, returnErrorDataObject, () => data)(data);
};

export const waitFor = async (time: number) =>
  await new Promise((r) => setTimeout(r, time));

export const hasProperty = (data: any, property: string) =>
  not(data.hasOwnProperty(property));

export const notSuccessfulResponse =
  (
    reply: FastifyReply<
      Server,
      IncomingMessage,
      ServerResponse,
      RouteGenericInterface,
      unknown
    >
  ) =>
  (message: any) => {
    return reply.code(400).send({
      message,
    });
  };

export const returnErrorDataObject = (message: string) => (data: any) => ({
  error: true,
  message,
  data,
});

/**
 * unless the input is empty
 * return error object
 */
export const ifUndefinedReturnError = unless(isNotEmptyOrNil, () =>
  returnErrorDataObject("Undefined")("Undefined")
);

export const ifErrorFoundThrowError = (data: any) => {
  if (hasError(data)) {
    const errorMessage: string = propOr(
      "An Unknown Error occurred!",
      "message",
      data
    );
    throw new Error(errorMessage);
  }
};

export const mapIRoleToDbRole = (role: string): IDBRole => {
  return {
    S: role,
  };
};

export const mapDbRoleToIRole = (role: IDBRole): string => {
  return role.S;
};
