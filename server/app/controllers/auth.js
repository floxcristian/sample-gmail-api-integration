"use strict";
const jwt = require("jsonwebtoken");
const { config } = require("../config");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const login = async (req, res, next) => {
  const { code, scope } = req.query;
  console.log("code: ", code);
  console.log("scope: ", scope);
  return res.send({
    ok: true,
  });
};

const renewToken = async (req, res, next) => {
  const { grant_type, refresh_token, scope } = req.body;
  /*
  const { email, username, name } = req.body;
  console.log(email, username, name);
  const token = jwt.sign({ sub: username, email, name }, config.authJwtSecret);
  res.json({ access_token: token });
  */

  return res.send({
    access_token: "",
    token_type: "",
    expires_in: "",
    refresh_token: "",
    scope: "",
  });
};

const verify = async (req, res, next) => {
  const { access_token } = req.query;
  try {
    const decode = jwt.verify(access_token, config.authJwtSecret);
    console.log(decode);
    res.json({
      message: "access token is valid",
      username: decode.sub,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  renewToken,
  verify,
};
