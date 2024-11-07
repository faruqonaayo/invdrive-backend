// importing 3rd party modules
import express from "express";
import { body } from "express-validator";
import passport from "passport";

// importing custom modules
import * as authControllers from "../controllers/auth.js";
import User from "../models/user.js";

// creating a router
const router = express.Router();

// setting up the routes
router.put(
  "/signup",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First Name must be a minimum of 2 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last Name must be a minimum of 2 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        const userExists = await User.findOne({ email: value });
        if (userExists) {
          throw new Error("User already exists");
        }
        return true;
      })
      .withMessage("User already exists"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be a minimum of 6 characters"),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
      .withMessage("Passwords do not match"),
  ],
  authControllers.signUp
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed",
  })
);

router.get("/login/success", (req, res, next) => {
  res.status(200).json({ message: "Login successful", statusCode: 200 });
});

router.get("/login/failed", (req, res, next) => {
  res.status(401).json({ message: "Login failed", statusCode: 401 });
});

// exporting the router
export default router;
