import express from "express";
import {
  validateSignUpData,
  validateSignInData,
} from "../utils/validations.js";
import bcrypt from "bcrypt";
import userModel from "../models/user.js";

const authRouter = express.Router();

authRouter.post("/sign-up", async (req, res) => {
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

authRouter.post("/login", async (req, res) => {
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
        maxAge: 3600000, // 1 hour in milliseconds
      });
      res.status(200).send("User signed in successfully");
    }
  } catch (error) {
    console.error(error, "error logging in user");
    res.status(500).send(`Error logging in user => ${error.message}`);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
  } catch (error) {
    console.error(error, "error logging out user");
    res.status(500).send(`Error logging out user => ${error.message}`);
  }
});

export { authRouter };
