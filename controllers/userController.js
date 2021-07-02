const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

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

exports.register = async (req, res, next) => {
  const params = req.body;
  const user = new User({
    email: params.email,
    name: params.name,
  });
  // User.register(user, params.password, function (err, user) {

  // }); or
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
