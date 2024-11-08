// importing 3rd party modules
import mongoose from "mongoose";

// importing custom modules

// creating a schema
const Schema = mongoose.Schema;

// creating a user schema
const habitSchema = new Schema({
  habit: {
    type: String,
    required: true,
  },
  days: {
    type: [Number],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: new Date().toISOString(),
  },
  completionDates: {
    type: [Date],
    default: [],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

//  exporting the model
export default mongoose.model("habit", habitSchema);
