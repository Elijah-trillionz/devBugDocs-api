const axios = require("axios");
const jwt = require("jsonwebtoken");
const Users = require("../../models/Users.js");
const db = require("../../config/firebase");
const { getUsersDocuments } = require("./documents.js");

const getUserHandler = async (req, reply) => {
  const { id } = req.params;

  try {
    const userRef = await Users.findOne({ id });

    if (!userRef) {
      reply.status(404).send(new Error("User not found"));
    }

    reply.send(userRef);
  } catch (err) {
    reply.status(500).send(new Error("There has been a server error"));
  }
};

const getUsersHandler = async (req, reply) => {
  try {
    const usersRef = await Users.find({});

    reply.send(usersRef);
  } catch (err) {
    reply.status(500).send(new Error("There has been a server error"));
  }
};

const githubSigninHandler = async (req, reply) => {
  const { code } = req.body;

  try {
    const token = await getGithubAccessToken(code);
    if (token.err) throw token.err;

    const githubUser = await verifyGithubToken(token);
    if (githubUser.err) throw githubUser.err;

    const userRef = await Users.findOne({ id: githubUser.id });
    if (!userRef) {
      await Users.create({
        id: githubUser.id,
        name: githubUser.fullname,
        imgUri: githubUser.avatar_url,
        hearts: [],
      });
    }

    jwt.sign(
      { id: githubUser.id, token },
      process.env.JWT_SECRET,
      { expiresIn: 365 * 86400 }, // expires in 1 year
      (err, jwtToken) => {
        if (err) throw err;

        reply.send({
          token: jwtToken,
        });
      }
    );

    await reply;
  } catch (err) {
    console.log(err);
    reply
      .status(500)
      .send(new Error("There has been a server error. Try logging in again"));
  }
};

const signJWTToken = (payload) => {};

const getGithubAccessToken = async (code) => {
  try {
    const res = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (res.data.error) {
      return {
        err: res.data.error_description,
      };
    }

    return res.data.access_token;
  } catch (err) {
    return {
      err: "There has been a server error",
    };
  }
};

const verifyGithubToken = async (token) => {
  try {
    const res = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    if (!res.data.login) {
      return {
        err: "Sign in error, authentication failed",
      };
    }

    const { name, id, avatar_url } = res.data;

    return {
      fullname: name,
      id,
      avatar_url,
    };
  } catch (err) {
    return {
      err: "Sign in error, authentication failed",
    };
  }
};

const getSignedInUserHandler = async (req, reply) => {
  const { id } = req.user;
  const { page } = req.query;

  try {
    const userRef = await Users.findOne({ id });

    if (!userRef) {
      return reply
        .status(401)
        .send(new Error("User not found. Authentication error"));
    }

    const userDocuments = await getUsersDocuments(id.toString(), page);

    const userData = {
      user: userRef,
      documents: userDocuments,
    };

    reply.send(userData);
  } catch (err) {
    reply.status(500).send(new Error("There has been a server error"));
  }
};

module.exports = {
  getUserHandler,
  getUsersHandler,
  githubSigninHandler,
  getSignedInUserHandler,
};
