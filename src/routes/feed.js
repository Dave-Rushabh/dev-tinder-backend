import express from "express";
import { userAuth } from "../middlewares/authMiddleware.js";
import userModel from "../models/user.js";

const feedRouter = express.Router();

feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error, "error fetching feed");
    res.status(500).send(`Error fetching feed => ${error.message}`);
  }
});

export { feedRouter };
