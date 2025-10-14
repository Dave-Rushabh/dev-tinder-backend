const mongoose = require("mongoose");

const connectToDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
};

module.exports = connectToDatabase;
