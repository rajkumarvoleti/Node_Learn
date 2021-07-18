const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const validator = require("validator");

const TempUserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  otp: Number,
  time: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("TempUser", TempUserSchema);
