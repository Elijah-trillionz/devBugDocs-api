const { DocumentSchema } = require("./documents");

const typeString = { type: "string" };

const TokenResSchema = {
  type: "object",
  properties: {
    token: typeString,
  },
};

const UserSchema = {
  type: "object",
  properties: {
    name: typeString,
    id: typeString,
    imgUri: typeString,
    hearts: {
      type: "array",
      items: typeString,
    },
  },
};

const HeaderAccessSchema = {
  type: "object",
  required: ["access_token"],
  properties: {
    access_token: typeString,
  },
};

const getUserSchema = {
  params: {
    id: typeString,
  },
  response: {
    200: UserSchema,
  },
};

const getUsersSchema = {
  response: {
    200: {
      type: "array",
      items: UserSchema,
    },
  },
};

const githubSigninSchema = {
  body: {
    type: "object",
    required: ["code"],
    properties: {
      code: typeString,
    },
  },
  response: {
    200: TokenResSchema,
  },
};

const getSignedInUserSchema = {
  headers: HeaderAccessSchema,
  response: {
    200: {
      type: "object",
      properties: {
        user: UserSchema,
        documents: {
          type: "array",
          items: DocumentSchema,
        },
      },
    },
  },
};

module.exports = {
  getUserSchema,
  getUsersSchema,
  githubSigninSchema,
  getSignedInUserSchema,
  UserSchema,
};
