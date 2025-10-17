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
    const MANDATORY_FIELDS = [
      "firstName",
      "lastName",
      "emailId",
      "password",
      "age",
      "gender",
    ];

    const isAllMandatoryFieldsPresent = MANDATORY_FIELDS.every((item) =>
      Object.keys(dummyUser).includes(item)
    );

    if (!isAllMandatoryFieldsPresent) {
      return res
        .status(400)
        .send(`All mandatory fields are required => ${MANDATORY_FIELDS}`);
    }

    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error, "error creating user");
    res.status(500).send(`Error creating user => ${error.message}`);
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
    res.status(500).send(`Error fetching users => ${error.message}`);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error(error, "error fetching feed");
    res.status(500).send(`Error fetching feed => ${error.message}`);
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
    console.error(error, "error deleting user");
    res.status(500).send(`Error deleting user => ${error.message}`);
  }
});

app.patch("/user/:userId", async (req, res) => {
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
