require("dotenv").config();
const express = require("express");

const app = require("./src/app");
const connectDB = require("./src/config/db");

// define port
const PORT = process.env.PORT || 5000;

// start server
const startServer = async () => {
  try {
    // connect to database
    await connectDB();
    
    // simple test route
    app.get("/", (req, res) => {
      res.send("Server is running 🚀");
    });

    // start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();