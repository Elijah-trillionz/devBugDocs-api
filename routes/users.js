const {
  getUserSchema,
  getUsersSchema,
  githubSigninSchema,
  getSignedInUserSchema,
} = require("../controllers/schemas/users");

const {
  getUserHandler,
  githubSigninHandler,
  getUsersHandler,
  getSignedInUserHandler,
} = require("../controllers/handlers/users");

const getUserOpts = {
  schema: getUserSchema,
  handler: getUserHandler,
};

const getUsersOpts = {
  schema: getUsersSchema,
  handler: getUsersHandler,
};

const githubSigninOpts = {
  schema: githubSigninSchema,
  handler: githubSigninHandler,
};

const getSignedInUserOpts = {
  schema: getSignedInUserSchema,
  handler: getSignedInUserHandler,
};

const usersRoute = (fastify, opts, done) => {
  // get users
  fastify.get("/users", getUsersOpts);

  // get user (admin)
  fastify.get("/users/:id", getUserOpts);

  // register user
  fastify.post("/users/register", githubSigninOpts);

  // register private routes
  fastify
    .register(require("fastify-auth"))
    .after(() => usersPrivateRoutes(fastify));

  done();
};

const usersPrivateRoutes = (fastify) => {
  // get signed in user
  fastify.get("/user", {
    preHandler: fastify.auth([fastify.verifyToken]),
    ...getSignedInUserOpts,
  });
};

module.exports = usersRoute;
