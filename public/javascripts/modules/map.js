import axios from "axios";
// var mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
import mapboxgl from "!mapbox-gl";

function loadPlaces(map, lat, lng) {
  axios.get(`api/stores/near?lat=${lat}&lng=${lng}`).then((res) => {
    const places = res.data;
    if (!places.length) {
      alert("No stores found at that places");
      return;
    }

    // markers
    const markers = places.map((place) => {
      const coordinates = place.location.coordinates;

      //popup
      const html = `
      <div class="popup">
      <a href="/store/${place.slug}">
        <img src="/uploads/${place.photo || "store.png"}" alt="${place.name}"/>
        <p>${place.name} - ${place.location.address}</p>
      </a>
    </div>
      `;
      const popup = new mapboxgl.Popup().setHTML(html).addTo(map);
      map.on("closeAllPopups", () => {
        popup.remove();
      });

      const marker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map)
        .setPopup(popup);
      marker.place = place;
      return marker;
    });
    map.fire("closeAllPopups");
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

  var lat = 43.26;
  var lng = -79.8665;

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
  const geoDiv = document.getElementById("geocoder");
  if (geoDiv) geoDiv.appendChild(geocoder.onAdd(map));
  // options
  loadPlaces(map, lat, lng);
  geocoder.on("result", function (e) {
    const coordinates = e.result.geometry.coordinates;
    lng = coordinates[0];
    lat = coordinates[1];
    loadPlaces(map, lat, lng);
  });
}

export default makeMap;
