import fastify, { FastifyRequest } from "fastify";
import { fastifyExpress } from "fastify-express";
import { JwtPayload } from "jsonwebtoken";
import { ifElse, pipe, unless } from "ramda";
import { RBACMap } from "./rbac";
import { verifyToken } from "./services";
import {
  getBodyFromRequest,
  ifErrorFoundThrowError,
  isNotEmptyOrNil,
  matchRuleShort,
  notSuccessfulResponse,
} from "./utils";
import { loginWorkflow, registerWorkflow } from "./workflow";
import fastifyCors from "fastify-cors";

const PORT = process.env.PORT || 80;

export function build() {
  const server = fastify({
    logger: {
      level: process.env.ENV === "DEV" ? "debug" : "info",
      prettyPrint: true,
    },
  });

  server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "PUT", "POST"],
  });

  server.register(fastifyExpress);

  server.get("/", async (request, reply) => {
    return "hello world";
  });

  server.get("/health", async (request, reply) => {
    return "pong\n";
  });

  server.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "roles"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
            roles: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = getBodyFromRequest(request);
        await registerWorkflow(data);

        return { message: "Successfully registered!" };
      } catch (error) {
        notSuccessfulResponse(reply)(error);
      }
    }
  );

  server.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = getBodyFromRequest(request);
        const jwtOrFalse = await loginWorkflow(data);
        return ifElse(
          () => Boolean(jwtOrFalse),
          () => {
            return {
              data: {
                accessToken: jwtOrFalse,
              },
            };
          },
          () => notSuccessfulResponse(reply)("Email or password is incorrect.")
        )(jwtOrFalse);
      } catch (error) {
        notSuccessfulResponse(reply)(error);
      }
    }
  );

  server.register(async function (protectedRoutes) {
    protectedRoutes.addHook("onRequest", async (request, reply, done) => {
      const getTokenFromHeader = (request: FastifyRequest) => {
        return request.headers.authorization?.split(" ")[1];
      };

      const token = getTokenFromHeader(request);
      // Check token is not undefined
      unless(
        () => isNotEmptyOrNil(token),
        () => notSuccessfulResponse(reply)({ message: "No token in header." })
      )(token);

      const validToken = verifyToken(token as string) as JwtPayload;

      unless(
        () => isNotEmptyOrNil(validToken),
        () => notSuccessfulResponse(reply)({ message: "Invalid token" })
      )(validToken);

      function roleHasAccess() {
        const role = RBACMap.filter((r) => validToken.roles.includes(r.name));
        unless(
          () => isNotEmptyOrNil(role),
          () =>
            notSuccessfulResponse(reply)({
              message: "You do not have permission to access this resource.",
            })
        )(role);
        unless(
          () => {
            const isValid = role.flatMap((r) =>
              r.allowed.filter(
                (a) =>
                  a.methods.includes(request.routerMethod) &&
                  (a.route === request.routerPath ||
                    matchRuleShort(request.routerPath, a.route))
              )
            );
            return isValid.length > 0;
          },
          () =>
            notSuccessfulResponse(reply)({
              message: "You do not have permission to access this resource.",
            })
        )(role);
      }
      roleHasAccess();

      // done();
      return;
    });

  });

  return server;
}

export async function run() {
  try {
    await build().listen(PORT, "0.0.0.0");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
