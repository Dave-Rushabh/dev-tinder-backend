import bcrypt from "bcrypt";
import express from "express";
import validator from "validator";
import otpModel from "../models/otp.js";
import userModel from "../models/user.js";
import { sendOtpEmail } from "../utils/email.js";
import {
  validateSignInData,
  validateSignUpData,
} from "../utils/validations.js";
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
    res.status(201).json({
      message: "Sign Up Successful !",
      data: newUser,
    });
  } catch (error) {
    console.error(error, "error creating user");
    res.status(500).send(`${error.message}`);
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
      res.status(200).json({
        message: "Login successful",
        data: user,
      });
    }
  } catch (error) {
    console.error(error, "error logging in user");
    res.status(500).send(`Error logging in user => ${error.message}`);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send("User logged out successfully");
  } catch (error) {
    console.error(error, "error logging out user");
    res.status(500).send(`Error logging out user => ${error.message}`);
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    // delete the previous stored OTP for given email address
    await otpModel.deleteMany({ email });

    const savedOtp = await otpModel.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 minutes
    });

    if (!savedOtp) {
      throw new Error("Could not send OTP, please try again");
    }

    // send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email address" });
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error sending OTP => ${error.message}`);
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password: newPasswordFromUser } = req.body;

    const storedOtpEntry = await otpModel.findOne({ email });
    if (!storedOtpEntry) {
      throw new Error("something went wrong, please request a new OTP");
    }

    const isOtpValid = await bcrypt.compare(otp, storedOtpEntry.otp);
    if (!isOtpValid) {
      throw new Error("Invalid OTP");
    }

    if (storedOtpEntry.expiresAt < new Date()) {
      throw new Error("OTP has expired, please request a new one");
    }

    // check if the password is strong or not
    if (!validator.isStrongPassword(newPasswordFromUser)) {
      throw new Error("Password must be strong");
    }

    // OTP is valid, proceed with password reset
    const hashedPassword = await bcrypt.hash(newPasswordFromUser, 10);
    await userModel.updateOne(
      { emailId: email },
      { password: hashedPassword },
      { runValidators: true }
    );
    await otpModel.deleteMany({ email });

    res.status(200).send("Password reset successfully");
  } catch (error) {
    console.error(error, "error verifying OTP");
    res.status(500).send(`Error verifying OTP => ${error.message}`);
  }
});

export { authRouter };
