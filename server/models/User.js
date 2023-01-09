const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    min: 2,
    max: 50,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
  },
  age: {
    type: Number,
  },
  picture: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
