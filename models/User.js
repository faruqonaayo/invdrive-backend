// importing 3rd party modules
import mongoose from "mongoose";

// importing custom modules

// creating a schema
const Schema = mongoose.Schema;

// creating a user schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//  exporting the model
export default mongoose.model("User", userSchema);
