const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  docid: {
    type: String,
    required: true,
  },
  testid: {
    type: String,
    required: true,
  },

  patient_email: {
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
  confirmAppointment: { type: Boolean, default: false, required: true },
  visited: { type: Boolean, default: false, required: true },
  appointmentSchedule:[ {
    appointmentDate:{type:String, required:true},
    appointmentTime:{type:String, required:true}
  }]
});

appointmentSchema.methods.addSchedule = async function (appointmentDate,appointmentTime) {
  try {
    this.appointmentSchedule = this.appointmentSchedule.concat({ appointmentDate, appointmentTime });
    
    await this.save()
    return this.appointmentSchedule;
  } catch (error) {
    console.log("error in add schedule" +error);
  }
}

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;