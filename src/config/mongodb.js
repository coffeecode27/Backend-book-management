const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.MONGODB_URI);
  try {
    const mongodbUri = process.env.MONGODB_URI;
    await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};

module.exports = connectDB;
