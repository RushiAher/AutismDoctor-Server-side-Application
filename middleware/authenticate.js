const jwt = require("jsonwebtoken");
const Users = require("../mongodb/models/user");
const Doctor = require("../mongodb/models/doctor");
const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.usertoken;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    let user = await Users.findOne({
      _id: verifyUser._id,
      "tokens.token": token,
    });
   
    if (!user) {
       user = await Doctor.findOne({
        _id: verifyUser._id,
        "tokens.token": token,
      });
      if (!user) { 
        throw Error("user not found");
      }
    } 

    req.user = user;
    req.token = token;
    req.userId = user._id;
    req.userEmail = user.email;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized:No token provided!");
    console.log(error);
  }
};

module.exports = Authenticate;
