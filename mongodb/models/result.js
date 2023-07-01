const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  testid: {
    type: String,
    required: true,
  },

  patient_name: {
    type: String,
    required: true,
  },
  patient_age: {
    type: String,
    required: true,
  },
  patient_contact: {
    type: String,
    required: true,
  },
  patient_dob: {
    type: String,
    required: true,
  },
  patient_gender: {
    type: String,
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  result: { type: String, required: true },
  autismScore: { type: String, required: true },
  autismPercentage: { type: String, required: true },
  autismStage: { type: String, required: true },
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
