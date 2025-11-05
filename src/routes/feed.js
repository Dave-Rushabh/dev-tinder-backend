import express from "express";
import { userAuth } from "../middlewares/authMiddleware.js";
import userModel from "../models/user.js";
import connectionRequestModel from "../models/connectionRequest.js";

const feedRouter = express.Router();

feedRouter.get("/", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (limit > 20) {
      return res
        .status(400)
        .send("can't process the data with given pagination limit");
    }

    /**
     * get the existing connection requests where logged in user is either at from or at to
     * then, query users collection where the above IDs are not present
     * Also, remove the logged in user from the feed
     */

    const loggedInUser = req.user;
    const loggedInUserConnectionRequests = await connectionRequestModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");
    const notToBeDisplayedUsers = new Set();
    loggedInUserConnectionRequests.forEach((connection) => {
      notToBeDisplayedUsers.add(connection.fromUserId.toString());
      notToBeDisplayedUsers.add(connection.toUserId.toString());
    });

    const users = await userModel
      .find({
        $and: [
          { _id: { $nin: Array.from(notToBeDisplayedUsers) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
      .select([
        "firstName",
        "lastName",
        "age",
        "gender",
        "photoURL",
        "about",
        "skills",
      ])
      .skip(skip)
      .limit(limit);

    res.status(200).json(users);
  } catch (error) {
    console.error(error, "error fetching feed");
    res.status(500).send(`Error fetching feed => ${error.message}`);
  }
});

export { feedRouter };
