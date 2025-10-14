const express = require("express");
const connectToDatabase = require("./src/config/database");
const app = express();
require("dotenv").config();
const userModel = require("./src/models/user");

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
  const dummyUser = {
    firstName: "virat",
    lastName: "Doe",
    emailId: "john.do22e@example2.com",
    password: "password123",
    age: 30,
    gender: "Male",
  };

  const newUser = new userModel(dummyUser);

  try {
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});
