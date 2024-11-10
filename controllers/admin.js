// import 3rd party modules
import { validationResult } from "express-validator";
// import custom modules
import Habit from "../models/habit.js";
import User from "../models/user.js";

export async function putHabit(req, res, next) {
  try {
    if (req.isAuthenticated) {
      const { errors } = validationResult(req);
      const { habit, days, startTime, endTime, note } = req.body;
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ message: errors[0].msg, statusCode: 400 });
      }
      // checking if the user has enough habit tokens
      if (req.user.habitTokens < 5000) {
        return res
          .status(400)
          .json({ message: "Not enough habit tokens", statusCode: 400 });
      }

      // creating a new habit
      const newHabit = new Habit({
        habit: habit,
        days: days,
        startTime: startTime,
        endTime: endTime,
        note: note,
        userId: req.user._id,
      });

      // updating the user's habit tokens
      const user = await User.findById(req.user._id);
      user.habitTokens -= 5000;

      // saving the habit and the user
      await newHabit.save();
      await user.save();

      return res
        .status(201)
        .json({ message: "Habit created successfully", statusCode: 201 });
    }
    //   sending the response to the client if the user is not authenticated
    return res
      .status(401)
      .json({ message: "User is not authenticated", statusCode: 401 });
  } catch (error) {
    next(error);
  }
}

export async function getTodayHabits(req, res, next) {
  try {
    if (req.isAuthenticated) {
      const day = new Date().getDay();

      // getting all the habits of the user
      const habits = await Habit.find({ userId: req.user._id });

      // getting the habits that are to be done today
      const todayHabits = habits.filter((habit) => {
        if (habit.days.includes(day)) {
          return habit;
        }
      });

      return res.status(200).json({
        message: "Today's habit fetched sucessfully",
        habits: todayHabits,
        statusCode: 200,
      });
    }

    //   sending the response to the client if the user is not authenticated
    return res
      .status(401)
      .json({ message: "User is not authenticated", statusCode: 401 });
  } catch (error) {
    next(error);
  }
}

export async function getAllHabits(req, res, next) {
  try {
    if (req.isAuthenticated) {
      const habits = await Habit.find({ userId: req.user._id });
      return res.status(200).json({ habits: habits, statusCode: 200 });
    }
    //   sending the response to the client if the user is not authenticated
    return res
      .status(401)
      .json({ message: "User is not authenticated", statusCode: 401 });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(req, res, next) {
  try {
    if (req.isAuthenticated) {
      const habitId = req.params.habitId;

      // checking if the habit exists and belongs to the user
      const habitExists = await Habit.findOne({
        _id: habitId,
        userId: req.user._id,
      });

      if (!habitExists) {
        return res
          .status(404)
          .json({ message: "Habit does not exist", statusCode: 404 });
      }

      // deleting the habit
      await Habit.findByIdAndDelete(habitId);

      // updating the user's habit tokens
      const user = await User.findById(req.user._id);
      user.habitTokens += 5000;
      await user.save();

      return res
        .status(200)
        .json({ message: "Habit deleted successfully", statusCode: 200 });
    }
    //   sending the response to the client if the user is not authenticated
    return res
      .status(401)
      .json({ message: "User is not authenticated", statusCode: 401 });
  } catch (error) {
    next(error);
  }
}

export async function postCheckHabit(req, res, next) {
  try {
    if (req.isAuthenticated) {
      const habitId = req.params.habitId;

      // checking if the habit exists and belongs to the user
      const habitExists = await Habit.findOne({
        _id: habitId,
        userId: req.user._id,
      });

      const user = await User.findById(req.user._id);

      if (!habitExists) {
        return res
          .status(404)
          .json({ message: "Habit does not exist", statusCode: 404 });
      }

      // updating the habit
      const today = new Date().toISOString().split("T")[0];

      // checking if the habit has already been completed today
      const isDateCompleted = habitExists.completionDates.find(
        (date) => date.toISOString().split("T")[0] === today
      );

      if (isDateCompleted) {
        // removing the completion date if the habit has already been completed today
        const newCompletionDates = habitExists.completionDates.filter(
          (date) => date.toISOString().split("T")[0] !== today
        );
        habitExists.completionDates = newCompletionDates;

        // removing the habit tokens if the habit has already been completed today
        user.habitTokens -= 500;

        // saving the habit and the user
        await habitExists.save();
        await user.save();

        //   sending the response to the client
        return res
          .status(200)
          .json({ message: "Habit unchecked successfully", statusCode: 200 });
      } else {
        // adding the completion date if the habit has not been completed today
        habitExists.completionDates.push(new Date().toISOString());

        // giving the user 500 habit tokens for completing the habit
        user.habitTokens += 500;

        // saving the habit and the user
        await habitExists.save();
        await user.save();

        //   sending the response to the client
        return res
          .status(200)
          .json({ message: "Habit checked successfully", statusCode: 200 });
      }
    }
    //   sending the response to the client if the user is not authenticated
    return res
      .status(401)
      .json({ message: "User is not authenticated", statusCode: 401 });
  } catch (error) {
    next(error);
  }
}
