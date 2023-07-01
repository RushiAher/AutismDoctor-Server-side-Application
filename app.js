const express = require("express");
const registerRoute = require("./routes/register");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const createConnection = require("./mongodb/connection");
dotenv.config();
const app = express();

const port = process.env.PORT;

// database connection
createConnection(process.env.DATABASE_URL);

// middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(registerRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
