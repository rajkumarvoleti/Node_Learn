const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const TempUser = mongoose.model("TempUser");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");
const h = require("../helpers");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You are now logged in!",
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next(); // isAuthenticated is from passport
    return;
  } else {
    req.flash("error", "Oops you must be logged in to do that !");
    res.redirect("/login");
  }
};

exports.sendOtp = async (req, res) => {
  const email = req.body.email;
  var otp = h.randomNumber(100000, 999999);
  console.log("Otp2 is : " + otp);

  // store otp
  var user = await TempUser.findOne({ email });
  var timeLeft = 1800000;
  if (user) timeLeft = h.moment(user.time).valueOf() - Date.now() + 1800000;
  // if otp doesn't expire
  console.log("time Left is : " + timeLeft);
  if (user && timeLeft > 0) {
    otp = user.otp;
    console.log("Otp2 is : " + otp);
    req.flash(
      "info",
      `We have already sent an email. Please check your inbox. To resend the otp you need to wait for another ${Math.ceil(
        h.moment.duration(timeLeft).asMinutes()
      )} minutes.`
    );
    res.redirect("/register");
    return;
  }

  // if otp expires
  if (user && timeLeft < 0) {
    user = await TempUser.findOneAndUpdate(
      { email },
      { email, otp, time: Date.now() },
      {
        new: true, // return's new instead of old one
        runValidators: true,
      }
    ).exec();
  }
  // if there is no user
  if (!user) user = await new TempUser({ email, otp }).save();

  // send otp email
  await mail.send({
    email,
    subject: "OTP",
    otp,
    filename: "emailOtp",
  });
  req.flash("success", "You have been emailed an OTP.");
  res.redirect("/register");
};

exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const params = req.body;
  const user = await User.findOne({ email: params.email });
  if (!user) {
    req.flash("error", "No account with that email exist");
    return res.redirect("/login");
  }

  // 2. Ser the reset tokens and expiry of the account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000;
  const email = params.email;
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    email,
    subject: "Password Reset",
    resetURL,
    filename: "password-reset",
  });
  req.flash("success", `You have been emailed a password reset link.`);
  // 4. redirect to login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
    // $gt greater than
  });
  if (!user) {
    req.flash("error", "Password reset is invalid or has expired");
    return res.redirect("/login");
  }
  // else show the password reset form
  res.render("reset", { title: "Reset your Password" });
};

exports.confirmPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next();
    return;
  }
  req.flash("error", "Passwords do not match!");
  res.redirect("back");
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
    // $gt greater than
  });
  if (!user) {
    req.flash("error", "Password reset is invalid or has expired");
    return res.redirect("/login");
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser); // passprt.js
  req.flash("success", "Your password has been reset");
  res.redirect("/");
};
