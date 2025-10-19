const express = require("express");
const connectToDatabase = require("./src/config/database");
const app = express();
require("dotenv").config();
const userModel = require("./src/models/user");
const {
  validateSignUpData,
  validateSignInData,
  isTokenValid,
} = require("./src/utils/validations");
app.use(express.json());
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./src/middlewares/authMiddleware");

app.use(cookieParser());

connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

app.post("/sign-up", async (req, res) => {
  const dummyUser = req.body;

  try {
    // validation of the data
    const { isValid, error } = validateSignUpData(req.body);
    if (!isValid) {
      return res.status(400).send(error);
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(dummyUser.password, 10);

    // Save the user to the database
    const newUser = new userModel({
      firstName: dummyUser.firstName,
      lastName: dummyUser.lastName,
      emailId: dummyUser.emailId,
      password: hashedPassword,
      age: dummyUser.age,
      gender: dummyUser.gender,
    });

    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error, "error creating user");
    res.status(500).send(`Error creating user => ${error.message}`);
  }
});

app.post("/sign-in", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const {
      isValid,
      error,
      isUserExist: user,
    } = await validateSignInData({
      emailId,
      password,
    });
    if (!isValid) {
      return res.status(400).send(error);
    } else {
      /**
       * create a JWT token
       * Add the token to cookie
       * Send the response back to the user
       */

      const token = await user.getJWTToken();
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
      });
      res.status(200).send("User signed in successfully");
    }
  } catch (error) {
    console.error(error, "error logging in user");
    res.status(500).send(`Error logging in user => ${error.message}`);
  }
});

app.get("/user", userAuth, async (req, res) => {
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

app.delete("/user", userAuth, async (req, res) => {
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

app.patch("/user/:userId", userAuth, async (req, res) => {
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

app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error, "error fetching feed");
    res.status(500).send(`Error fetching feed => ${error.message}`);
  }
});

app.get("/profile", userAuth, async (req, res) => {
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
