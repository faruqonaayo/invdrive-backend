// importing 3rd party modules
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import expressSession from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import mongoDBsession from "connect-mongodb-session";
import bcrypt from "bcrypt";

// importing custom modules
import authRoutes from "./routes/auth.js";
import User from "./models/user.js";

// creating express app
const app = express();
const PORT = 3000;

// setting up the environment variables
dotenv.config();

// connecting to the database
mongoose.connect(process.env.DB_URI, { dbName: process.env.DB_NAME });

// setting up the session store
const MongoDBStore = mongoDBsession(expressSession);
const DBStore = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
  databaseName: process.env.DB_NAME,
});

// setting up the middlewares
app.use(express.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 5 * 60 * 1000,
    },
    store: DBStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// setting up the routes
app.use("/auth", authRoutes);

// setting up the 404 error handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found", statusCode: 404 });
});

// setting up the error handler
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ message: "Server error", statusCode: 500 });
});

// setting up the passport strategy
passport.use(
  "local",
  new LocalStrategy(async (username, password, cb) => {
    try {
      // checking if the user exists
      const userExists = await User.findOne({ email: username });

      // if the user does not exist, return false
      if (!userExists) {
        return cb(null, false);
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        userExists.password
      );

      // if the password is invalid, return false
      if (!isPasswordValid) {
        return cb(null, false);
      }

      // if the user exists and the password is valid, return the user
      cb(null, userExists);
    } catch (error) {
      cb(error);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// setting up the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
