const {
  getDocumentSchema,
  getDocumentsSchema,
  getCategoryDocumentsSchema,
  getTagDocumentsSchema,
  addDocumentSchema,
  updateDocumentSchema,
  updateDocumentHeartsSchema,
  updateDocumentViewsSchema,
  getUserDocumentSchema,
  delDocumentSchema,
} = require("../controllers/schemas/documents");

const {
  getDocumentHandler,
  getDocumentsHandler,
  getCategoryDocumentsHandler,
  getTagDocumentsHandler,
  addDocumentHandler,
  updateDocumentHandler,
  updateDocumentHeartsHandler,
  updateDocumentViewsHandler,
  getUserDocumentHandler,
  delDocumentHandler,
} = require("../controllers/handlers/documents");

const getDocumentOpts = {
  schema: getDocumentSchema,
  handler: getDocumentHandler,
};

const getDocumentsOpts = {
  schema: getDocumentsSchema,
  handler: getDocumentsHandler,
};

const getCategoryDocumentsOpts = {
  schema: getCategoryDocumentsSchema,
  handler: getCategoryDocumentsHandler,
};

const getTagDocumentsOpts = {
  schema: getTagDocumentsSchema,
  handler: getTagDocumentsHandler,
};

const addDocumentOpts = {
  schema: addDocumentSchema,
  handler: addDocumentHandler,
};

const updateDocumentOpts = {
  schema: updateDocumentSchema,
  handler: updateDocumentHandler,
};

const delDocumentOpts = {
  schema: delDocumentSchema,
  handler: delDocumentHandler,
};

const updateDocumentHeartsOpts = {
  schema: updateDocumentHeartsSchema,
  handler: updateDocumentHeartsHandler,
};

const updateDocumentViewsOpts = {
  schema: updateDocumentViewsSchema,
  handler: updateDocumentViewsHandler,
};

const getUserDocumentOpts = {
  schema: getUserDocumentSchema,
  handler: getUserDocumentHandler,
};

const documentsRoute = (fastify, opts, done) => {
  // get all documents
  fastify.get("/", getDocumentsOpts);

  // get a document
  fastify.get("/:id", getDocumentOpts);

  // get all documents by category
  fastify.get("/category/:category", getCategoryDocumentsOpts);

  // get all documents by tags
  fastify.get("/tags/:tag", getTagDocumentsOpts);

  // get a user's documents (all)
  fastify.get("/users/:id", getUserDocumentOpts);

  // incrementing views
  fastify.put("/views/:id", updateDocumentViewsOpts);

  fastify
    .register(require("fastify-auth"))
    .after(() => documentsPrivateRoutes(fastify));

  done();
};

const documentsPrivateRoutes = (fastify) => {
  // add a new document
  fastify.post("/new", {
    preHandler: fastify.auth([fastify.verifyToken]),
    ...addDocumentOpts,
  });

  // update a document
  fastify.put("/:id", {
    preHandler: fastify.auth([fastify.verifyToken]),
    ...updateDocumentOpts,
  });

  // delete a document
  fastify.delete("/del/:id", {
    preHandler: fastify.auth([fastify.verifyToken]),
    ...delDocumentOpts,
  });

  // incrementing hearts
  fastify.put("/hearts/:id", {
    preHandler: fastify.auth([fastify.verifyToken]),
    ...updateDocumentHeartsOpts,
  });
};

// language should be called tags: issue, observation, new innovation (feature), language (javascript, react)

module.exports = documentsRoute;
