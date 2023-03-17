const typeString = { type: "string" };

const SimpleResSchema = {
  type: "object",
  properties: {
    msg: typeString,
  },
};

const DocumentSchema = {
  type: "object",
  properties: {
    title: typeString,
    document: typeString,
    hearts: { type: "number" },
    views: { type: "number" },
    meta: {
      type: "object",
      properties: {
        date: typeString,
      },
    },
    author: {
      type: "object",
      properties: {
        name: typeString,
        id: typeString,
        imgUri: typeString,
      },
    },
    tag: typeString,
    category: typeString,
    id: typeString,
    createdAt: { type: "number" },
    draft: { type: "boolean" },
  },
};

const HeaderAccessSchema = {
  type: "object",
  required: ["access_token"],
  properties: {
    access_token: typeString,
  },
};

const IdParamSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: typeString,
  },
};

const getDocumentSchema = {
  params: IdParamSchema,
  response: {
    200: DocumentSchema,
  },
};

const getDocumentsSchema = {
  response: {
    200: {
      type: "array",
      items: DocumentSchema,
    },
  },
};

const getCategoryDocumentsSchema = {
  params: {
    category: typeString,
  },
  response: {
    200: {
      type: "array",
      items: DocumentSchema,
    },
  },
};

const getTagDocumentsSchema = {
  params: {
    tag: typeString,
  },
  response: {
    200: {
      type: "array",
      items: DocumentSchema,
    },
  },
};

const addDocumentSchema = {
  headers: HeaderAccessSchema,
  body: {
    type: "object",
    required: ["title", "category", "document", "date", "tag", "draft"],
    properties: {
      title: typeString,
      document: typeString,
      date: typeString,
      tag: typeString,
      category: typeString,
      draft: { type: "boolean" },
    },
  },
  response: {
    200: SimpleResSchema,
  },
};

// updating everything once called, should be changed
const updateDocumentSchema = {
  headers: HeaderAccessSchema,
  params: IdParamSchema,
  body: {
    type: "object",
    required: ["title", "category", "document", "date", "tag", "draft"],
    properties: {
      title: typeString,
      document: typeString,
      date: typeString,
      tag: typeString,
      category: typeString,
      draft: { type: "boolean" },
    },
  },
  response: {
    200: SimpleResSchema,
  },
};

const delDocumentSchema = {
  headers: HeaderAccessSchema,
  params: IdParamSchema,
  response: {
    200: SimpleResSchema,
  },
};

const updateDocumentHeartsSchema = {
  headers: HeaderAccessSchema,
  params: IdParamSchema,
  response: {
    200: SimpleResSchema,
  },
};

const updateDocumentViewsSchema = {
  params: IdParamSchema,
  response: {
    200: SimpleResSchema,
  },
};

const getUserDocumentSchema = {
  params: IdParamSchema,
  response: {
    200: {
      type: "array",
      items: DocumentSchema,
    },
  },
};

module.exports = {
  getDocumentSchema,
  getDocumentsSchema,
  getCategoryDocumentsSchema,
  addDocumentSchema,
  updateDocumentSchema,
  updateDocumentHeartsSchema,
  updateDocumentViewsSchema,
  getUserDocumentSchema,
  delDocumentSchema,
  getTagDocumentsSchema,

  // consts
  DocumentSchema,
};
