import express from "express";
import { userAuth } from "../middlewares/authMiddleware.js";
import userModel from "../models/user.js";

const profileRouter = express.Router();

profileRouter.use(userAuth);

profileRouter.get("/view", async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error, "error fetching user profile");
    res.status(500).send(`Error fetching user profile => ${error.message}`);
  }
});

profileRouter.patch("/edit", async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("User not found");
    }

    const dataToBeUpdated = req.body;

    const ALLOWED_UPDATES = ["photoURL", "about", "skills"];
    const requestedUpdates = Object.keys(dataToBeUpdated);
    const isValidOperation = requestedUpdates.every((update) =>
      ALLOWED_UPDATES.includes(update)
    );

    if (!isValidOperation) {
      return res
        .status(400)
        .send(
          `Invalid updates! => only ${ALLOWED_UPDATES} are allowed to update`
        );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      dataToBeUpdated,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("Error updating user profile");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error, "error updating user profile");
    res.status(500).send(`Error updating user profile => ${error.message}`);
  }
});

export { profileRouter };
