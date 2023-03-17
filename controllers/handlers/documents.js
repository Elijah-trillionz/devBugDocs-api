const { firestore } = require('firebase-admin');
const db = require('../../config/firebase');
const Users = require('../../models/Users');

const getDocumentHandler = async (req, reply) => {
  const { id } = req.params;

  try {
    const documentRef = await db.collection('documents').doc(id).get();

    if (!documentRef.exists || documentRef?.data()?.draft) {
      return reply.status(404).send(new Error('Document not found'));
    }

    const author = await getDocumentUser(documentRef.data().meta.userId);
    const newDoc = { ...documentRef.data(), author };

    reply.send(newDoc);
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const getDocumentsHandler = async (req, reply) => {
  const { page } = req.query;

  try {
    const documentsRef = await db.collection('documents').get();
    const refinedDocs = await refineDoc(documentsRef, page);

    reply.send(refinedDocs);
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const getCategoryDocumentsHandler = async (req, reply) => {
  const { category } = req.params;

  try {
    const documentsLangRef = await db
      .collection('documents')
      .where('category', '==', category)
      .get();

    if (documentsLangRef.empty) {
      return reply
        .status(404)
        .send(new Error('There is no document on this category yet'));
    }

    const refinedLangDocs = await refineDoc(documentsLangRef, 'all');

    reply.send(refinedLangDocs);
  } catch (err) {
    reply.status(500).send(new Error('There has been a server error'));
  }
};

// we may add for frameworks
const getTagDocumentsHandler = async (req, reply) => {
  const { tag } = req.params;

  try {
    const documentsTagRef = await db
      .collection('documents')
      .where('tag', '==', tag)
      .get();

    if (documentsTagRef.empty) {
      return reply
        .status(404)
        .send(new Error('There is no document on this tag yet'));
    }

    const refinedTagDocs = await refineDoc(documentsTagRef, 'all');

    reply.send(refinedTagDocs);
  } catch (err) {
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const addDocumentHandler = async (req, reply) => {
  const { title, document, category, date, tag, draft } = req.body;
  const { id: userId } = req.user;

  try {
    const documentRef = await db.collection('documents').add({
      id: '',
      meta: {
        date,
        userId: userId.toString(),
      },
      title,
      document,
      category,
      tag,
      hearts: 0,
      views: 0,
      createdAt: Date.now(),
      draft,
    });

    if (documentRef.id) {
      await db
        .collection('documents')
        .doc(documentRef.id)
        .update({ id: documentRef.id });

      reply.send({
        msg: 'Added new document',
      });
    }

    await reply;
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

// when a user want's to publish a draft, call update and switch draft to false
const updateDocumentHandler = async (req, reply) => {
  const { id } = req.params;
  const { title, document, category, date, tag, draft } = req.body;
  const { id: userId } = req.user;

  try {
    const docRef = await checkForDocExistence(id);
    if (docRef.err) throw err;

    if (!docRef) {
      return reply.status(404).send(new Error('Document not found'));
    }

    await docRef.update({
      meta: {
        date,
        userId: userId.toString(),
      },
      title,
      document,
      tag,
      category,
      draft,
    });

    reply.send({
      msg: 'Document updated',
    });
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const delDocumentHandler = async (req, reply) => {
  const { id } = req.params;

  try {
    const docRef = await checkForDocExistence(id);
    if (docRef.err) throw err;

    if (!docRef) {
      return reply.status(404).send(new Error('Document not found'));
    }

    await docRef.delete();

    reply.send({
      msg: 'Document deleted',
    });
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const updateDocumentHeartsHandler = async (req, reply) => {
  const { id: userId } = req.user;
  const { id } = req.params;

  try {
    const docRef = await checkForDocExistence(id);
    if (docRef.err) throw docRef.err;

    if (!docRef) {
      return reply.status(404).send(new Error('Document not found'));
    }

    const userData = await Users.findOne({ id: userId });
    const alreadyLikedDocument = userData.hearts.find((docId) => docId === id);

    if (alreadyLikedDocument)
      return reply
        .status(400)
        .send(new Error('You cannot undo what has been done :)'));

    await docRef.update({
      hearts: firestore.FieldValue.increment(1),
    });

    const docData = await docRef.get();

    await Users.findOneAndUpdate({ id: userId }, { $push: { hearts: id } });

    reply.send({
      msg: `${docData.data().hearts}`,
    });
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const updateDocumentViewsHandler = async (req, reply) => {
  const { id } = req.params;

  try {
    const docRef = await checkForDocExistence(id);
    if (docRef.err) throw err;

    if (!docRef) {
      return reply.status(404).send(new Error('Document not found'));
    }

    await docRef.update({
      views: firestore.FieldValue.increment(1),
    });

    reply.send({
      msg: "Document's views updated",
    });
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

const getUserDocumentHandler = async (req, reply) => {
  const { id } = req.params;

  try {
    const userDocuments = await getUsersDocuments(id);

    if (userDocuments.err) throw userDocuments.err;

    reply.send(userDocuments);
  } catch (err) {
    console.log(err);
    reply.status(500).send(new Error('There has been a server error'));
  }
};

// gets the documents of a user
const getUsersDocuments = async (userId) => {
  try {
    const documentsRef = await db
      .collection('documents')
      .where('meta.userId', '==', userId)
      .get();

    return await refineDoc(documentsRef, 'all');
  } catch (err) {
    return {
      err,
    };
  }
};

const checkForDocExistence = async (id) => {
  try {
    const documentRef = db.collection('documents').doc(id);
    const snapshot = await documentRef.get();
    if (!snapshot.exists) {
      return false;
    }

    return documentRef;
  } catch (err) {
    return {
      err: 'Server error',
    };
  }
};

// this gets the author of a document through userId from mongodb
const getDocumentUser = async (userId) => {
  try {
    return await Users.findOne({ id: userId });
  } catch (err) {
    return {
      err: 'Server error',
    };
  }
};

const refineDoc = async (documentsRef, page) => {
  const documentsData = [];

  documentsRef.forEach((doc) => {
    const author = getDocumentUser(doc.data().meta.userId);
    documentsData.push({ ...doc.data(), author });
  });

  const newDocsData = [];

  for (let i = 0; i < documentsData.length; i++) {
    documentsData[i].author = await documentsData[i].author;

    // do not include drafts
    if (!documentsData[i].draft) {
      newDocsData.push(documentsData[i]);
    }
  }

  return filterDocs(
    newDocsData,
    page === 'all' ? Math.floor(newDocsData.length / 20) : page
  );
};

// this filter docs based on pages to return to client
const filterDocs = (docs, page) => {
  const docPerPage = 20;

  const defPage = page ? page : 1;
  const docsLength = docPerPage * defPage;
  return docs.filter((doc, index) => index + 1 <= docsLength);
};

module.exports = {
  getDocumentHandler,
  getDocumentsHandler,
  getCategoryDocumentsHandler,
  addDocumentHandler,
  updateDocumentHandler,
  updateDocumentHeartsHandler,
  updateDocumentViewsHandler,
  getUserDocumentHandler,
  delDocumentHandler,
  getTagDocumentsHandler,

  // const
  getUsersDocuments,
};
