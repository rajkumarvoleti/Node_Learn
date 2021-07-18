const mongoose = require("mongoose");
const User = mongoose.model("User");
const TempUser = mongoose.model("TempUser");
const promisify = require("es6-promisify");
const h = require("../helpers");
exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.validateRegister = (req, res, next) => {
  // name
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.sanitizeBody("name");
  //email
  req.checkBody("email", "That Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extensions: false,
    gmail_remove_subaddress: false,
  });

  //password
  req.checkBody("password", "Password cannot be blank!").notEmpty();
  req
    .checkBody("password-confirm", "Confirm Password cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match")
    .equals(req.body.password);

  //errors
  const errors = req.validationErrors();
  if (errors) {
    req.flash(
      "error",
      errors.map((err) => err.msg)
    );
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash(),
    });
    return; // stop from running
  }
  next(); // there were no errors
};

const getOtp = (params) => {
  var otp = "";
  for (const key in params) if (key.startsWith("number")) otp += params[key];
  return otp;
};

exports.register = async (req, res, next) => {
  console.log("reached here 1");
  const params = req.body;
  const otp = getOtp(params);

  const tempUser = await TempUser.findOne({
    email: params.email,
  });
  console.log("reached here 2");

  // check if otp is entered
  if (!otp || otp === "") {
    req.flash("error", "Please enter the otp");
    res.redirect("/register");
    return;
  }
  console.log("reached here 3");

  // check if otp is the same
  const sameOtp = tempUser.otp === parseInt(otp);
  console.log("inputOtp : " + otp);
  console.log("reqOtp : " + tempUser.otp);
  console.log("same Otp ? " + sameOtp);
  const expiryTime = h.moment(tempUser.time).valueOf() + 1800000;
  console.log("timeLeft ? " + expiryTime);
  console.log("timeNow ? " + Date.now());
  if (!sameOtp || expiryTime < Date.now()) {
    req.flash(
      "error",
      "You have entered incorrect OTP or the OTP has been expired.Please try again"
    );
    return res.redirect("/register");
  }
  console.log("reached here 4");

  const user = new User({
    email: params.email,
    name: params.name,
    level: params.email === process.env.power ? 10 : 1,
  });
  // User.register(user, params.password, function (err, user) {

  // }); or
  console.log("reached here 5");

  const register = promisify(User.register, User);
  await register(user, params.password);
  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit you account" });
};

//update account

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );
  req.flash("success", "Updated the profile!");
  res.redirect("back");
};
