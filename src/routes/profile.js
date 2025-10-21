import express from "express";
import { userAuth } from "../middlewares/authMiddleware.js";

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await userModel.findById(_id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error, "error fetching user profile");
    res.status(500).send(`Error fetching user profile => ${error.message}`);
  }
});

profileRouter.get("/user", userAuth, async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await userModel.findOne({ emailId });

    if (!user) {
      return res.status(404).send("User not found");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error(error, "error");
    res.status(500).send(`Error fetching users => ${error.message}`);
  }
});

profileRouter.delete("/user", userAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error(error, "error deleting user");
    res.status(500).send(`Error deleting user => ${error.message}`);
  }
});

profileRouter.patch("/user/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params?.userId || null;

    if (!userId) {
      return res.status(400).send("User ID is required in params");
    }

    const updatedData = req.body;

    const ALLOWED_UPDATES = ["photoURL", "about", "skills"];
    const requestedUpdates = Object.keys(updatedData);
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
      { _id: userId },
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    } else {
      return res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.error(error, "error updating user");
    res.status(500).send(`Error updating user => ${error.message}`);
  }
});

export { profileRouter };
