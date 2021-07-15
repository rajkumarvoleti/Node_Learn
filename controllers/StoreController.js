const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");
//multer options
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    //conditions
    if (isPhoto) next(null, true);
    else next({ message: "That file type isn't allowed" }, false);
  },
};

//homePage
exports.homePage = (req, res) => {
  res.render("index");
};

//addingstore
exports.addStore = (req, res) => {
  res.render("editStore", { title: "AddStore" });
};

//upload photo
exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //check if a file is uploaded
  if (!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //resizing
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //keep going
  next();
};

//creating store
exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created ${store.name}, Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};

//finding stores
exports.getStore = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) return false;
  return true;
};
//edittig store
exports.editStore = async (req, res) => {
  // 1. Find the store given the Id
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm that they are the owner
  if (!confirmOwner(store, req.user)) {
    req.flash("error", "You must own the store in order to edit");
    res.redirect("back");
  }
  // TODO
  // 3. Render out the edit the form so that user can update the store
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

// updating store
exports.updateStore = async (req, res) => {
  // set the location data as point
  if (req.body.location) req.body.location.type = "Point";
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return's new instead of old one
    runValidators: true,
  }).exec();
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href ="/stores/${store.slug}">View Store -></a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
  // redirect and tell them it workedf
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  if (!store) return next();
  res.render("store", { store, title: store.name });
};

// tag
exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true, $ne: [] };

  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render("tag", { tags, title: "Tags", tag, stores });
};

//search
exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q,
      },
    },
    {
      score: { $meta: "textScore" },
    }
  )
    .sort({
      score: { $meta: "textScore" },
    })
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 10000, // 10km
      },
    },
  };

  const stores = await Store.find(q)
    .select("name slug description location")
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  console.log(res.data);
  res.render("map", { title: "Map" });
  // res.json(res.data);
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map((obj) => {
    return obj.toString();
  });
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id },
    },
    { new: true }
  );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts },
  });
  res.render("stores", { title: "Hearted Stores", stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTop();
  res.render("topStores", { stores, title: "★ Top Stores!" });
};
