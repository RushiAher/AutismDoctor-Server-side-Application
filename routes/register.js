const express = require("express");
const router = express.Router();
const User = require("../mongodb/models/user");
const Doctor = require("../mongodb/models/doctor");
const Result = require("../mongodb/models/result");
const Appointment = require("../mongodb/models/appointment");
const Blogs = require("../mongodb/models/blogs");
const Questions = require("../mongodb/models/questions");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/authenticate");
const fetch = require("cross-fetch");

// router.get("/doctor", auth, (req, res) => {
//   res.send(req.user);
// });

router.get("/getdata", auth, (req, res) => {
  res.status(200).json({ token: req.token, user: req.user });
});

// get in touch
router.post("/contact", auth, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(422).send("please provide neccessary fields");
    }
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(422).send("Invalid User");
    }
    console.log(user);
    const userMessage = await user.addMessage(name, email, phone, message);
    res.status(201).json({ message: "success", data: userMessage });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "error", error: error });
  }
});

// register doctor
router.post("/registerdoc", async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      email,
      phone,
      address,
      password,
      cpassword,
      experiance,
      degree,
    } = req.body;
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !cpassword ||
      !experiance ||
      !degree
    ) {
      return res
        .status(422)
        .jsaon({ errormsg: "please provide neccessary fields" });
    }

    if (req.query.docid != "null") {
      const dpassword = await bcrypt.hash(password, 12);
      const dcpassword = await bcrypt.hash(cpassword, 12);
      const data = await Doctor.updateOne(
        { _id: req.query.docid },
        {
          $set: {
            name,
            email,
            phone,
            address,
            password: dpassword,
            cpassword: dcpassword,
            experiance,
            degree,
          },
        }
      );

      if (data) {
        res.status(201).json({
          success: true,
          message: "Doctor's info updated successfully!",
        });
      }
    } else {
      const isAlreadyRegister = await Doctor.findOne({ email });
      console.log(isAlreadyRegister);
      if (!isAlreadyRegister) {
        const newDoctor = Doctor(req.body);
        await newDoctor.save();
        res.status(201).json({
          message: "Doctor's info added successfully!",
          data: newDoctor,
        });
      } else {
        return res.status(403).json({ errormsg: "email alredy exists!" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error });
  }
});

router.delete("/registerdoc", async (req, res) => {
  try {
    const docid = req.query.docid;
    if (!docid) {
      return res.status(401).json({ success: false, error: "no docid" });
    } else {
      const data = await Doctor.deleteOne({ _id: docid });
      if (data.acknowledged) {
        res
          .status(200)
          .json({ success: true, message: "deleted successfully" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});
// get doctors data
router.get("/getdoctordata", async (req, res) => {
  try {
    if (req.query.docid) {
      const doctors = await Doctor.find({ _id: req.query.docid });
      // console.log(doctors);
      res.status(200).json({ data: doctors });
    } else {
      const doctors = await Doctor.find();
      // console.log(doctors);
      res.status(200).json({ data: doctors });
    }
  } catch (error) {
    console.log(error);
  }
});

// register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, address, password, cpassword } = req.body;
    if (!name || !email || !phone || !address || !password || !cpassword) {
      return res.status(422).send("please provide neccessary fields");
    }
    const newUser = User(req.body);

    await newUser.save();
    res.status(201).json({ message: "success", data: req.body });
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error });
  }
});

// get test histoy
router.get("/gettesthistory", auth, async (req, res) => {
  try {
    const data = await Result.find({ uid: req.userId });
    // console.log(data);
    res.status(200).json({ success: true, testHistory: data });
  } catch (error) {
    console.log(error);
  }
});

// get test result
router.get("/gettestresult", auth, async (req, res) => {
  try {
    console.log(">>>>>>>>" + req.params);
    console.log(">>>>>>>>>>>>>>" + req.query.testid);
    const data = await Result.find({
      uid: req.userId,
      testid: req.query.testid,
    });
    // console.log(data);
    res.status(200).json({ data: data });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password, pateintTab, doctorTab } = req.body;
    // console.log(req.body);
    if (!email || !password) {
      return res.status(422).send("please provide neccessary fields");
    }
    console.log(req.body);
    if (pateintTab) {
      var userEmail = await User.findOne({ email });
    } else if (doctorTab) {
      var userEmail = await Doctor.findOne({ email });
    }
    if (!userEmail) {
      return res.status(401).json({ error: "Invalid creadentials" });
    } else {
      const token = await userEmail.generateToken();
      // console.log(token);
      res.cookie("usertoken", token, {
        expires: new Date(Date.now() + 6000000),
        httpOnly: true,
      });
      const isMatch = await bcrypt.compare(password, userEmail.password);
      if (isMatch) {
        res.status(200).json({ success: true, message: "successfully login!" });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials!" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: "Invalid credentials!" });
  }
});

//logout
router.get("/logout", (req, res) => {
  res.clearCookie("usertoken", { path: "/" });
  res.status(200).send("user logout");
});

// get all messages
router.get("/getusermessages", async (req, res) => {
  try {
    const users = await User.find();
    const data = [];
    if (users) {
      users.forEach((user) => {
        if (user.messages.length > 0) {
          const temp = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            uid: user._id,
            messages: user.messages,
          };
          data.push(temp);
        }
      });
    }
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/deeptestresult", auth, async (req, res) => {
  try {
    console.log(req.body);
    var totalScore = 0;
    for (let [key, value] of Object.entries(req.body)) {
      if (key != "remark") {
        totalScore = totalScore + Math.round(value);
      }
    }
    var autismPercentage;
    if (totalScore <= 70) {
      autismPercentage = "40%";
    } else if (totalScore >= 71 && totalScore <= 88) {
      var autismPercentage = "50%";
    } else if (totalScore >= 89 && totalScore <= 105) {
      var autismPercentage = "60%";
    } else if (totalScore >= 106 && totalScore <= 123) {
      var autismPercentage = "70%";
    } else if (totalScore >= 124 && totalScore <= 140) {
      var autismPercentage = "80%";
    } else if (totalScore >= 141 && totalScore <= 158) {
      var autismPercentage = "90%";
    } else if (totalScore > 158) {
      var autismPercentage = "100%";
    }

    var autismStage;
    if (totalScore < 70) {
      autismStage = "No Autism";
    } else if (totalScore >= 70 && totalScore <= 106) {
      autismStage = "Mild Autism";
    } else if (totalScore >= 107 && totalScore <= 153) {
      autismStage = "Moderate Autism";
    } else if (totalScore > 153) {
      autismStage = "Severe Autism";
    }
    // console.log(totalScore);
    // console.log(autismPercentage);
    // console.log(autismStage);
    return res.status(200).json({
      success: true,
      result: {
        totalScore: totalScore,
        autismPercentage: autismPercentage,
        autismStage: autismStage,
      },
    });
  } catch (error) {
    console.log(erroe);
  }
});

// view result
router.post("/result", auth, async (req, res) => {
  try {
    // console.log(req.body);
    // console.log("******result" + JSON.stringify(req.body));
    const { patient_contact } = req.body;
    const re = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await re.json();
    if (!data || re.status !== 200) {
      alert("some error has occur please try again!");
    } else {
      const user = await User.findOne({ _id: req.userId });
      // console.log("data>>>>>" + JSON.stringify(data));

      if (!user) {
        return res.status(422).send("Invalid User");
      } else {
        const ques = Object.keys(data["user_response"]);
        const questions = [];
        ques.forEach((question) => {
          const newObj = {
            question: question,
            answer: data["user_response"][question],
          };
          questions.push(newObj);
        });

        const testId = Math.floor(Math.random() * 1000000);

        const testResult = Result({
          uid: user._id,
          testid: testId,
          questions: questions,
          patient_name: data["patient_data"].name,
          patient_dob: data["patient_data"].DOB,
          patient_age: data["patient_data"].age,
          patient_gender: data["patient_data"].gender,
          patient_contact: req.body.patient_contact,
          result: data["result"],
          autismScore: data["autism_score"],
          autismPercentage: data["autism_percentage"],
          autismStage: data["autism_stage"],
        });
        await testResult.save();
        return res
          .status(200)
          .json({ testId: testId, success: true, message: testResult });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// question route
router.get("/questions", async (req, res) => {
  const questions = await Questions.find(question);
  console.log(questions);
  res.status(200).json({ success: true, questions: questions });
});

router.post("/questions", async (req, res) => {
  try {
    const newQuestion = Questions(req.body);
    await newQuestion.save();
    res.status(201).json({ message: "success", data: req.body });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
});

// book appointment
router.post("/bookappointment", auth, async (req, res) => {
  try {
    const {
      testid,
      patient_name,
      patient_age,
      patient_dob,
      patient_gender,
      patient_contact,
      questions,
      result,
      autismScore,
      autismPercentage,
      autismStage,
      docid,
    } = req.body;
    // console.log("appointment data" + req.body);
    // console.log(">>>>>>>>>query" + req.query.testid + req.query.docid);

    if (req.query.docid && req.query.testid) {
      // console.log("inside null");
      const data = await Appointment.updateOne(
        { docid: req.query.docid, testid: req.query.testid },
        {
          $set: {
            confirmAppointment: true,
          },
        }
      );
      // console.log(data);
      if (data) {
        // console.log("update appointment");

        const user = await Appointment.findOne({
          docid: req.query.docid,
          testid: req.query.testid,
        });
        // console.log(user);
        // console.log("re"+req.query.reschedule);
        if (req.query.visited) {
          const dataVisited = await Appointment.updateOne(
            { docid: req.query.docid, testid: req.query.testid },
            {
              $set: {
                visited: true,
              },
            }
          );
        }
        if (req.query.reschedule) {
          // console.log("inside true");
          const data = await Appointment.updateOne(
            { docid: req.query.docid, testid: req.query.testid },
            {
              $set: {
                [`appointmentSchedule.${0}.appointmentDate`]: req.body.date,
                [`appointmentSchedule.${0}.appointmentTime`]: req.body.time,
              },
            }
          );
          console.log(data);
          if (data) {
            return res.status(200).json({
              success: true,
              message: "appointment rescheduled successfully!",
            });
          }
        } else {
          // console.log("inside false");
          const appointmentSchedule = await user.addSchedule(
            req.body.date,
            req.body.time
          );
        }
        // console.log("><<<<date"+appointmentDate);
        res.status(200).json({
          success: true,
          message: "appointment scheduled successfully!",
        });
      }
    } else {
      console.log("new appointment");
      const data = await Appointment({
        docid,
        testid,
        patient_name,
        patient_age,
        patient_dob,
        patient_gender,
        patient_contact,
        questions,
        result,
        autismScore,
        autismPercentage,
        autismStage,
        patient_email: req.userEmail,
      });
      await data.save();
      return res
        .status(200)
        .json({ testId: testid, success: true, message: data });
    }
  } catch (error) {
    res.status(401).json({ success: false, error: error });
    console.log(error);
  }
});

router.delete("/bookappointment", auth, async (req, res) => {
  try {
    const docid = req.query.docid;
    const testid = req.query.testid;
    if (!docid || !testid) {
      return res
        .status(401)
        .json({ success: false, error: "no docid and testid" });
    }
    const data = await Appointment.deleteOne({
      docid,
      testid,
    });
    if (data.acknowledged) {
      res.status(200).json({ success: true, message: "deleted successfully" });
    }
  } catch (error) {
    console.log("error in deleting " + error);
  }
});

// get appointments
router.get("/getappointmentdata", auth, async (req, res) => {
  try {
    if (req.query.confirmAppointment != "null") {
      if (req.query.confirmAppointment && !req.query.visited) {
        // console.log("inside confirm");
        const data = await Appointment.find({
          docid: req.userId,
          confirmAppointment: req.query.confirmAppointment,
        });
        if (!data) {
          return res.status(401).json({ success: false, error: error });
        }
        return res.status(200).json({ success: true, data: data });
      } else if (req.query.confirmAppointment && req.query.visited) {
        // console.log("inside visited");

        const visitedData = await Appointment.find({
          docid: req.userId,
          confirmAppointment: req.query.confirmAppointment,
          visited: req.query.visited,
        });
        // console.log("visit "+visitedData);
        if (!visitedData) {
          return res.status(401).json({ success: false, error: error });
        }
        return res.status(200).json({ success: true, data: visitedData });
      }
    } else {
      const data = await Appointment.find({
        docid: req.userId,
      });
      if (!data) {
        res.status(401).json({ success: false, error: error });
      }
      res.status(200).json({ success: true, data: data });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
});

// create blogs
router.post("/blogs", async (req, res) => {
  try {
    const { title, content, author, imgurl } = req.body;
    if (!title || !content || !author || !imgurl) {
      return res
        .status(401)
        .json({ success: false, message: "please fill neccessary fields" });
    }
    console.log(req.query.blogid);
    if (req.query.blogid != "null") {
      // console.log("inside null");
      const data = await Blogs.updateOne(
        { _id: req.query.blogid },
        {
          $set: {
            title: title,
            content: content,
            author: author,
            imgurl: imgurl,
          },
        }
      );
      if (data) {
        res
          .status(201)
          .json({ success: true, message: "blog updated successfully!" });
      }
    } else {
      console.log("indside new post");
      const resData = await Blogs(req.body);
      if (resData) {
        await resData.save();
        res
          .status(201)
          .json({ success: true, message: "blog created successfully!" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: error });
  }
});
router.get("/blogs", async (req, res) => {
  try {
    if (req.query.blogid) {
      const data = await Blogs.find({ _id: req.query.blogid });
      return res.status(200).json({ success: true, data: data });
    } else {
      const data = await Blogs.find();
      return res.status(200).json({ success: true, data: data });
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/blogs", async (req, res) => {
  try {
    const blogid = req.query.blogid;
    if (!blogid) {
      return res.status(401).json({ success: false, error: "no blogid" });
    }
    const data = await Blogs.deleteOne({ _id: blogid });
    if (data.acknowledged) {
      res.status(200).json({ success: true, message: "deleted successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});

// admin login
router.post("/adminlogin", (req, res) => {
  const { adminEmail, adminPassword } = req.body;
  if (!adminEmail || !adminPassword) {
    res
      .status(401)
      .json({ success: false, message: "please fill required fields!" });
  }
  if (
    process.env.ADMIN_EMAIL === adminEmail &&
    process.env.ADMIN_PASSWORD === adminPassword
  ) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials!" });
  }
});

module.exports = router;
