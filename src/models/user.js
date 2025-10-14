const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      message: "First name is required",
    },
    lastName: {
      type: String,
      required: true,
      message: "Last name is required",
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      message: "Email ID is required",
    },
    password: { type: String, required: true, message: "Password is required" },
    age: { type: Number, required: true, message: "Age is required" },
    gender: { type: String, required: true, message: "Gender is required" },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
