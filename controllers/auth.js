// import 3rd party modules
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

// import User model
import User from "../models/user.js";

export async function signUp(req, res, next) {
  try {
    //   checking for validation errors
    const { errors } = validationResult(req);
    // console.log(errors);

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: errors, statusCode: 400 });
    }

    const { firstName, lastName, email, password } = req.body;

    //   hashing the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();

    // sending the response to the client
    return res.status(201).json({
      message: "User created successfully",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
}

