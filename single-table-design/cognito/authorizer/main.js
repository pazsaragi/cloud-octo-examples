const { promisify } = require("util");
const Axios = require("axios");
const jsonwebtoken = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");

const region = process.env.REGION;
const endpoint = process.env.ENDPOINT; // e.g. arn:aws:execute-api:us-1:abc:123/prod
const userPoolId = process.env.USER_POOL_ID;
if (!userPoolId) {
  throw new Error("env var required for cognito pool");
}
const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

let cacheKeys;
const getPublicKeys = async () => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await Axios.default.get(url);
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {});
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

const createTestGroupDetails = () => {
  const inMemoryDetails = [
    {
      groupName: "rootusers",
      fullAccess: true,
      resources: "*",
    },
    {
      groupName: "admins",
      fullAccess: false,
      resources: [
        `${endpoint}/*/orgs/*`,
        `${endpoint}/*/tables`,
        `${endpoint}/*/tables/*`,
        `${endpoint}/*/menus`,
        `${endpoint}/*/menus/*`,
        `${endpoint}/*/menus/*/detail/*`,
        `${endpoint}/*/sections`,
        `${endpoint}/*/sections/*`,
        `${endpoint}/*/sections/*/detail/*`,
        `${endpoint}/*/sections/*/menu/*`,
        `${endpoint}/*/products`,
        `${endpoint}/*/products/*`,
        `${endpoint}/*/products/*/detail/*`,
        `${endpoint}/*/products/*/section/*`,
      ],
    },
    {
      groupName: "chef",
      fullAccess: false,
      resources: [`${endpoint}/*/orders/*`, `${endpoint}/*/tables/*`],
    },
    {
      groupName: "waiter",
      fullAccess: false,
      resources: [`${endpoint}/*/orders/*`, `${endpoint}/*/tables/*`],
    },
  ];
  return inMemoryDetails;
};

const generatePolicy = (effect, resources, stringKey = "stringval") => {
  var authResponse = {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: [...resources],
        },
      ],
    },
    context: {
      stringKey,
      numberKey: 123,
      booleanKey: true,
    },
  };
  return authResponse;
};

const handler = async (event, context, callback) => {
  try {
    const token = event.authorizationToken;
    if (!token) {
      throw new Error(
        `The token is null, please provide a token. See event: ${event}`
      );
    }
    const tokenSections = (token || "").split(".");
    if (tokenSections.length < 2) {
      throw new Error(`The requested token is invalid ${token}`);
    }
    const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
    const header = JSON.parse(headerJSON);
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw new Error("claim made for unknown kid");
    }
    const claim = await verifyPromised(token, key.pem);
    const currentSeconds = Math.floor(new Date().valueOf() / 1000);
    console.log("CLAIM", claim);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error("claim is expired or invalid");
    }
    if (claim.iss !== cognitoIssuer) {
      throw new Error("claim issuer is invalid");
    }
    const inMemoryDetails = claim["cognito:groups"].map((grp) =>
      createTestGroupDetails().find((g) => g.groupName === grp)
    ); //select groups based on the incoming token.

    const policy = generatePolicy(
      "Allow",
      inMemoryDetails.map((r) => r.resources).flat()
    );
    callback(null, policy);
  } catch (error) {
    switch (error.constructor) {
      case jsonwebtoken.TokenExpiredError:
        callback(
          null,
          generatePolicy("Deny", [event.methodArn], "Your token has expired.")
        );
        console.error("TokenExpiredError: The token has expired.");
        break;
      case jsonwebtoken.JsonWebTokenError:
        callback("Unauthorized", null);
        console.error(`JsonWebTokenError: ${error}`);
        break;
      default:
        callback("Deny", null);
        console.error(`GenericError: ${error}`);
        break;
    }
  }
};

(async () => {
  await handler(
    {
      authorizationToken:
        "eyJraWQiOiJMRlB2NFVOQlBzNDFaWGhUXC9Tdkk2XC9UcHBjTHB2K0ZOK3BVQ1RnRytGZDQ9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI4MTExNThiNy03OWU2LTQxODQtYjZjMy1hYzZjZjdkN2QwMjUiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbnMiXSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMi5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTJfcWJoSVZoVnBRIiwiY2xpZW50X2lkIjoiM2lkdHUyYzFic2I4aXIxZXB2bWdlMzQ4a3IiLCJvcmlnaW5fanRpIjoiYWM1NDVjNTEtZjNhMi00NTAzLTkwMWEtNWEwZWUwNGFiNDRhIiwiZXZlbnRfaWQiOiIzMzE2ZjBlYS05NGJmLTQzM2YtOWZjOC1jZDA0Y2VjNGEwOTEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjMwMDY3Nzg5LCJleHAiOjE2MzAwNzEzODksImlhdCI6MTYzMDA2Nzc4OSwianRpIjoiZjcwODNjOWItNjI5ZS00MTVlLTlhNDItYmY5Y2UxODNiMmE4IiwidXNlcm5hbWUiOiI4MTExNThiNy03OWU2LTQxODQtYjZjMy1hYzZjZjdkN2QwMjUifQ.lBoe6eTMvpbcNTnosP5IMBL_nLIZYps6_7vc5u7vSMxUFIqhCptyrF5_Vd4QUm8YlKNLGNQZ-H4_kBWNNe4wrcGXMhT4a8njqzHthiLPsdnLTbXP0_McYDXrxKxMaZXck9OY4mi0hvlV0mS-LZFsNn08x-X2VDMVZcg4Zf2Tl3ue-exf6MjHspvfq3y2_XYvBnLuwCdIs5v20RDSWogq8egKodjfhBkmC1UWPxL0LbgbC5-z1YpCslLIvqF_uIhnrTii2K3qoINWSSg334l5du-iG9l4fNobjIf7ElFuPz2SBDGQ11V8fnbq7eXREkeZi-NYoIsMCzG5iOfVxT9cGA",
    },
    null,
    (err, policy) => console.log("Error is", err, "Policy is", policy)
  );
})();

exports.handler = handler;
