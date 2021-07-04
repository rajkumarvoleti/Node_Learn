const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    timr: true,
    required: "Please enter a store name!",
  },
  slug: String,
  description: {
    type: String,
    trim: true,
    required: "Please enter a description of the store!",
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates",
      },
    ],
    address: {
      type: String,
      required: "You must supply an address",
    },
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author",
  },
});

StoreSchema.index({
  name: "text",
  description: "text",
});

StoreSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();
  // else
  this.slug = slug(this.name);
  // find other stores that have a slug of wes, wes-1
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  // ^() starts with | ()$ ends with | ()*$ many times
  const storeWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
});

// adding a static method to the store schema
// proper function should be used so that we can use 'this'
StoreSchema.statics.getTagsList = function () {
  // $tags means " tags is feild which I want to unwind"
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } }, // count: 1 for ascending
  ]);
};

module.exports = mongoose.model("Store", StoreSchema);
