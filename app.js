import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./src/config/database.js";
import { authRouter } from "./src/routes/auth.js";
import { connectionsRouter } from "./src/routes/connections.js";
import { feedRouter } from "./src/routes/feed.js";
import { profileRouter } from "./src/routes/profile.js";
import cors from "cors";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
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

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/connections/request", connectionsRouter);
app.use("/api/feed", feedRouter);
