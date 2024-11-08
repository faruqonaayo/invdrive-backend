// import 3rd party modules
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// import User model
import User from "../models/user.js";

export async function signUp(req, res, next) {
  try {
    //   checking for validation errors
    const { errors } = validationResult(req);
    // console.log(errors);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0].msg, statusCode: 400 });
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

export async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    // checking if the user exists
    const userExists = await User.findOne({ email: email });

    // if the user does not exist
    if (!userExists) {
      return res
        .status(401)
        .json({ message: "Invalid email Or password", statusCode: 401 });
    }

    //  comparing the password if the user exists
    const isPasswordValid = await bcrypt.compare(password, userExists.password);

    // if the password is not valid
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Wrong password", statusCode: 401 });
    }

    //  if the user exists and the password is valid
    //  create a token and send it to the client

    const token = jwt.sign({ userId: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: 60 * 10,
    });

    // console.log(token);

    return res.status(200).json({
      message: "Login successful",
      token: token,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
}

export function checkAuth(req, res, next) {
  if (req.user) {
    return res
      .status(200)
      .json({ message: "User is authenticated", statusCode: 200 });
  }
  return res
    .status(401)
    .json({ message: "User is not authenticated", statusCode: 401 });
}
