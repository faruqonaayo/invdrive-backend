// importing 3rd party modules
import express from "express";
import { body } from "express-validator";

// importing custom modules
import * as adminControllers from "../controllers/admin.js";

// creating a router
const router = express.Router();

// setting up the routes
// this route is used to add a habit
router.put(
  "/habit",
  [
    body("habit")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Habit must be a minimum of 2 characters"),
    body("days").isArray({ min: 1 }).withMessage("Days must not be empty"),
    body("startTime").isTime().withMessage("Start time must be a valid time"),
    body("endTime").isTime().withMessage("End time must be a valid time"),
  ],
  adminControllers.putHabit
);

// this route is used to get today's habits
router.get("/todayHabits", adminControllers.getTodayHabits);

// this route is used to get all the habits of a user
router.get("/allHabits", adminControllers.getAllHabits);

// this route is used to delete a habit of a user
router.delete("/habit/:habitId", adminControllers.deleteHabit);

// this route is used to check off a habit of a user
router.post("/check/:habitId", adminControllers.postCheckHabit);

// exporting the router
export default router;
