import express from "express";
import { userAuth } from "../middlewares/authMiddleware.js";
import connectionRequestModel from "../models/connectionRequest.js";
import mongoose from "mongoose";
import userModel from "../models/user.js";

const connectionsRouter = express.Router();

connectionsRouter.use(userAuth);

connectionsRouter.post("/send/:status/:userId", async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.userId;
    const status = req.params.status;

    /**
     * fromUserId and toUserId should not be the same
     */
    if (fromUserId.equals(toUserId)) {
      return res
        .status(400)
        .send("You cannot send a connection request to yourself");
    }

    /**
     * if the toUserId is valid or not
     */

    const isToUserExist = await userModel.findById(toUserId);

    if (!isToUserExist) {
      return res
        .status(400)
        .send("Could not send the connection request to unknown user");
    }

    // only allow "ignored" and "interested" statuses while sending connection requests
    const EXPECTED_STATUSES = ["ignored", "interested"];

    if (!EXPECTED_STATUSES.includes(status)) {
      return res.status(400).send("Invalid status for connection request");
    }

    /**
     * if connection request already sent from user A to user B, then do not allow sending another request
     * OR
     * check if whom you want to send connection request, has already sent you a request
     */
    const isExist = await connectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (isExist) {
      return res
        .status(400)
        .send("Connection request already exists between the users");
    }

    const connectionObj = {
      fromUserId,
      toUserId,
      status,
    };

    const newConnectionRequest = await connectionRequestModel.create(
      connectionObj
    );

    if (!newConnectionRequest) {
      return res.status(400).send("Failed to create connection request");
    }

    return res.status(201).send("Connection request sent successfully");
  } catch (error) {
    console.error("Error sending connection request:", error);
    return res
      .status(500)
      .send("Internal Server Error, please try again later");
  }
});

export { connectionsRouter };
