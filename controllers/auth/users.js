const jwt = require('jsonwebtoken');

const verifyToken = (req, reply, done) => {
  const {access_token: token} = req.headers;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err?.name === 'TokenExpiredError') {
      done(new Error('Your session has expired'));
    } else if (err) {
      console.log(err)
      done(new Error('You are not authorized for this'));
    }

    req.user = {
      id: decoded.id,
      token: decoded.token, // only needed if we want to access the user's profile from their providers
    };
  });

  done();
};

module.exports = verifyToken;
