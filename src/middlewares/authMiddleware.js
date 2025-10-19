/**
 * read the token from the request cookies
 * validate the given token
 * find the user associated with the token
 */

const { isTokenValid } = require("../utils/validations");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const { isValid, decoded } = await isTokenValid(token);
    if (!isValid) {
      return res.status(401).send("Unauthorized");
    }

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).send(`Authentication failed: ${error.message}`);
  }
};

module.exports = {
  userAuth,
};
