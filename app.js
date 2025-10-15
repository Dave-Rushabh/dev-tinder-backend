const express = require("express");
const connectToDatabase = require("./src/config/database");
const app = express();
require("dotenv").config();
const userModel = require("./src/models/user");
app.use(express.json());

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
  const newUser = new userModel(dummyUser);

  try {
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Error creating user");
  }
});

app.get("/user", async (req, res) => {
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
    res.status(500).send("Error fetching users");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Error fetching feed");
  }
});

app.delete("/user", async (req, res) => {
  try {
    const { userId } = req.body;

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Error deleting user");
  }
});

app.patch("/user", async (req, res) => {
  try {
    const { userId, updatedData } = req.body;

    console.log(userId, updatedData, "userId, updatedData");
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: userId },
      updatedData,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    } else {
      return res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Error updating user");
  }
});
