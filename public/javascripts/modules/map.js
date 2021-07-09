import axios from "axios";
// var mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
import mapboxgl from "!mapbox-gl";

function loadPlaces(map, lat = 43.26, lng = -79.8665) {
  axios.get(`api/stores/near?lat=${lat}&lng=${lng}`).then((res) => {
    const places = res.data;
    if (!places.length) {
      alert("No places found");
      return;
    }

    // markers
    const markers = places.map((place) => {
      const coordinates = place.location.coordinates;
      const marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
      marker.place = place;
      return marker;
    });

    // boundingBox
    var longitudes = places.map((place) => {
      const coordinates = place.location.coordinates;
      return coordinates[0];
    });
    var latitudes = places.map((place) => {
      const coordinates = place.location.coordinates;
      return coordinates[1];
    });
    var southWest = [Math.min(...longitudes), Math.min(...latitudes) * 0.9999];
    var northEast = [Math.max(...longitudes), Math.max(...latitudes) * 1.0001];
    map.fitBounds([southWest, northEast]);
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
  });

  // autocomplete
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  });
  if (document.getElementById("geocoder"))
    document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

  loadPlaces(map, lat, lng);
}

export default makeMap;
