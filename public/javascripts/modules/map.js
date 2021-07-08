import axios from "axios";
// var mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
import mapboxgl from "!mapbox-gl";

function loadPlaces(map, lat = 43.26, lng = -79.8665) {
  console.log("Hello");
  axios.get(`api/stores/near?lat=${lat}&lng=${lng}`).then((res) => {
    const places = res.data;
    if (!places.length) {
      alert("No places found");
      return;
    }

    const markers = places.map((place) => {
      const coordinates = place.location.coordinates;
      const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
      marker.place = place;
      return marker;
    });
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;

  const lat = 43.26;
  const lng = -79.8665;
  // making a map
  mapboxgl.accessToken =
    "pk.eyJ1IjoicmFqa3VtYXJ2b2xldGkiLCJhIjoiY2txZ3g0MmhiMDIxdjJxbzlvOWU1MmxzZSJ9.EHpoUjeCR0T9tsPryJ1xrA";
  var map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: [lng, lat], // starting position [lng, lat]
    zoom: 12, // starting zoom
  });
  loadPlaces(map, lat, lng);
}

export default makeMap;
