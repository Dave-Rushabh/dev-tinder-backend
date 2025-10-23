/**
 * read the token from the request cookies
 * validate the given token
 * find the user associated with the token
 */

import userModel from "../models/user.js";
import { isTokenValid } from "../utils/validations.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("You are not authorized to access this resource");
    }

    const { isValid, decoded } = await isTokenValid(token);
    if (!isValid) {
      throw new Error("You are not authorized to access this resource");
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

export { userAuth };
