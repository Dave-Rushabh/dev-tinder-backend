const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxLength: [30, "First name must be at most 30 characters long"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxLength: [30, "Last name must be at most 30 characters long"],
    },
    emailId: {
      type: String,
      unique: [true, "Email ID is already registered, use another email ID"],
      required: [true, "Email ID is required"],
      lowercase: [true, "Email ID must be in lowercase"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      validate(val) {
        if (!["male", "female", "other"].includes(val.toLowerCase().trim())) {
          throw new Error("Gender must be either 'male', 'female', or 'other'");
        }
      },
    },
    photoURL: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    },
    about: {
      type: String,
      default: "This is a default about of the user",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
