const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const StoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StoreSchema.index({
  name: "text",
  description: "text",
});

StoreSchema.index({
  location: "2dsphere",
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

StoreSchema.statics.getTop = function () {
  // aggregate is like find but for complex quiries
  return this.aggregate([
    // Lookup Stores and populate their reviews
    // mongodb takes our model name "Review" lowercase's it and add's an 's' at the end.so then we get 'reviews'
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "store",
        as: "reviews",
      },
    },
    // Filter for only items that have 2 or more reviews
    {
      // reviews.1 means reviews with index 1 i.e, reviews that have more than 1 review will be selected
      $match: { "reviews.1": { $exists: true } },
    },
    // Add the average reviews field
    // project adds a new field
    {
      // project rewrites every field
      // "$$ROOT" gives us the root object
      $project: {
        photo: "$$ROOT.photo",
        slug: "$$ROOT.slug",
        name: "$$ROOT.name",
        reviews: "$$ROOT.reviews",
        averageRating: { $avg: "$reviews.rating" },
      },
    },
    // sort it by our new field , highest reviews first
    {
      $sort: { averageRating: -1 },
    },
    // limit to atmost 10
    {
      $limit: 10,
    },
  ]);
};

// find reviews where the stores _id === reviews store property
StoreSchema.virtual("reviews", {
  ref: "Review", // what model to link
  localField: "_id", // which field on store
  foreignField: "store", // which field on review
  // _id feild on the StoreSchema should match with store field on ReviewSchema
});

function autopopulate(next) {
  this.populate("reviews");
  next();
}

StoreSchema.pre("find", autopopulate);
StoreSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Store", StoreSchema);
