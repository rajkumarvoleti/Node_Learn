import { json } from "body-parser";

function autocomplete(input, locations, latInput, lngInput) {
  if (!input) return;
  // constants
  const https = require("https");
  const token =
    "pk.eyJ1IjoicmFqa3VtYXJ2b2xldGkiLCJhIjoiY2txZ3g0MmhiMDIxdjJxbzlvOWU1MmxzZSJ9.EHpoUjeCR0T9tsPryJ1xrA";
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/`;

  //request
  async function getRequest() {
    if (!input || input.value.length < 3) return;
    locations.innerHTML = "";
    const finalUrl =
      url + input.value + ".json?autocomplete&access_token=" + token;
    await https.get(finalUrl, (response) => {
      // extracting data
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      // parsing the data
      response.on("end", () => {
        const arr = JSON.parse(data).features;
        const len = arr.length > 0;
        const options = len
          ? arr.map((city) => {
              return city.place_name;
            })
          : [];
        for (let i = 0; i < options.length && i < 6; i++) {
          const option = options[i];
          var node = document.createElement("option");
          var text = document.createTextNode(option);
          node.appendChild(text);
          locations.appendChild(node);
        }
        const includes = options ? options.includes(input.value) : false;
        if (includes) {
          const place = arr.find((ele) => ele.place_name == input.value);
          const lat = place.geometry.coordinates[1];
          const lng = place.geometry.coordinates[0];
          latInput.value = lat;
          lngInput.value = lng;
        }
      });
    });
  }
  input.addEventListener("keyup", getRequest);
}

export default autocomplete;
