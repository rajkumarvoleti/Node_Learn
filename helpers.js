/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require("fs");
// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require("moment");

exports.MAP_KEY = process.env.MAP_KEY;

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Making a static map is really long - this is a handy helper function to make one
exports.staticMap = ([lng, lat]) =>
  `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(%7B%22type%22%3A%22Point%22%2C%22coordinates%22%3A%5B${lng}%2C${lat}%5D%7D)/${lng},${lat},15/1280x250?access_token=pk.eyJ1IjoicmFqa3VtYXJ2b2xldGkiLCJhIjoiY2txZ3g0MmhiMDIxdjJxbzlvOWU1MmxzZSJ9.EHpoUjeCR0T9tsPryJ1xrA`;

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `Dang That's Luscious!`;

exports.menu = [
  { slug: "/stores", title: "Stores", icon: "store" },
  { slug: "/tags", title: "Tags", icon: "tag" },
  { slug: "/top", title: "Top", icon: "top" },
  { slug: "/add", title: "Add", icon: "add" },
  { slug: "/map", title: "Map", icon: "map" },
];

exports.randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};
