const fastify = require('fastify');
const connectDB = require('./config/db.js');
const verifyToken = require('./controllers/auth/users');
const fs = require('fs');
require('dotenv').config();

const createServiceAccountJSONFile = () => {
  const fileExists = fs.existsSync("./config/untitledweb.json");
  if (!fileExists) {
    fs.writeFileSync(
      "./config/untitledweb.json",
      atob(process.env.SERVICE_ACCOUNT_KEY)
    );
  }
};
createServiceAccountJSONFile();
const app = fastify({logger: true});
const PORT = process.env.PORT || 5000;

connectDB();

app.decorate('verifyToken', verifyToken);

app.register(require('fastify-cors'), {
  origin: true,
});

app.register(require('./routes/users'), {
  prefix: '/api',
});

app.register(require('./routes/documents'), {
  prefix: '/api/documents',
});

app.get('/', (req, reply) => {
  reply.send('Hello world');
});

const startServer = async () => {
  try {
    await app.listen(PORT, '0.0.0.0');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();

// this app can serve as a replacer for comments
// when you feel like commenting what you were thinking while solving a problem, adding a feature. easily document it

// add pagination

// TODO: add bookmarks and seen docs to users module
