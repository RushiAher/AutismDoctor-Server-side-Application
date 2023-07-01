const mongoose = require("mongoose");

const createConnection = (url) => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(url)
    .then(() => {
      console.log("successfully connected to the mongodb database");
    })
    .catch((e) => {
      console.log(e);
      console.log("no connection");
    });
};

module.exports = createConnection;
