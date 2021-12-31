const mongoose = require("mongoose")
require("dotenv").config()

mongoose.connect(
    process.env.MONGODB_URL,
  (err, database) => {
    if (err) {
      console.log("database error")
    } else {
      console.log("database connected")
    }
  }
)
