const express = require("express");
const routes = require("./routes");
const connectDB = require("./config/mongodb");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();
require("dotenv").config();
const port = process.env.PORT;
connectDB();

// Mengaktifkan CORS
app.use(cors());

// Mengaktifkan security header, logging, dan parsing JSON
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("common"));
app.use(express.json());

// Menggunakan multer untuk upload file
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Menggunakan routes
app.use("/api/v1", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
