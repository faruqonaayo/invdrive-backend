// importing 3rd party modules
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

// importing custom modules
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import User from "./models/user.js";

// creating express app
const app = express();
const PORT = 3000;

// setting up the environment variables
dotenv.config();

// connecting to the database
mongoose.connect(process.env.DB_URI, { dbName: process.env.DB_NAME });

// setting up the middlewares
app.use(cors());
app.use(express.json());

// setting up a middleware to check if the user is authenticated
app.use(async (req, res, next) => {
  try {
    // getting the authorization header
    const authHeader = req.headers.authorization;
    let decoded;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    // if a user is found, set the user in the request object
    if (decoded) {
      // console.log(decoded);
      const userExists = await User.findOne({ _id: decoded.userId });

      // if the user exists, set the user in the request object
      if (userExists) {
        req.user = userExists;
        req.isAuthenticated = true;
      }
    } else {
      req.isAuthenticated = false;
      req.user = null;
    }
  } catch (error) {
    // if there is an error, set the user to null and isAuthenticated to false
    req.isAuthenticated = false;
    req.user = null;
  }

  next();
});

// get "/"
app.get("/", (req, res, next) => {
  res.status(200).send("<h1>Api is Running</h1>");
});

// setting up the routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// setting up the 404 error handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found", statusCode: 404 });
});

// setting up the error handler
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ message: "Server error", statusCode: 500 });
});

// setting up the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
