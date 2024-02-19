// grab the data
let url1 = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`;
let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

 // make request
 d3.json(url1).then(function (data1) {
   console.log(data1);
   d3.json(url2).then(function (data2) {
    makeMap(data1, data2);
   });
});

function makeMap(data1, data2) {

  // Define variables for our tile layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let markers = [];
  let circles = [];

  // loop through the data.
  for (let i = 0; i < data1.features.length; i++){

    // Set the data location property to a variable.
    let row = data1.features[i];

    // check for location
    if (row.geometry) {
      let latitude = row.geometry.coordinates[1];
      let longitude = row.geometry.coordinates[0];
      let depth = row.geometry.coordinates[2];
      let location = [latitude, longitude];

      // add new marker to the cluster group and bind popup
      let magnitude = row.properties.mag;
      let popup_text = `<h3>Magnitude: ${row.properties.mag}<br>Depth: ${row.geometry.coordinates[2]}<br>Location: ${row.properties.place}</h3><hr><a href="${row.properties.url}" target="_blank">Link</a>`;
      let marker = L.marker(location).bindPopup(popup_text);

      // for the marker layer
      markers.push(marker);

      // set color of circle based on depth
      let color;
      if (depth < 10) {
        color = "#98EE00";
      } else if (depth < 30) {
        color = "#D4EE00";
      } else if (depth < 50) {
        color = "#EECC00";
      } else if (depth < 70) {
        color = "#EE9C00";
      } else if (depth < 90) {
        color = "#EA822C";
      } else {
        color = "#EA2C2C";
      }

      // set radius based on magnitude
      let radius = 5000 * (magnitude**2);

      // create circle
      let circle = L.circle(location, {
        color: "black",
        weight: 1,
        fillColor: color,
        fillOpacity: 1,
        radius: radius
      }).bindPopup(popup_text);

      circles.push(circle);
    }
  }

  let markerLayer = L.layerGroup(markers);
  let circleLayer = L.layerGroup(circles);
  let tectonicLayer = L.geoJSON(data2, {
    style: function (feature) {
      let mapStyle = {
        color: "black",
        fillColor: "black",
        opacity: 0.25,
        weight: 2
      };

      return mapStyle;
    }
  });

  // create map, and set default layers
  let myMap = L.map("map", {
    center: [32.7767, -96.7970],
    zoom: 4,
    layers: [street, circleLayer, tectonicLayer]
  });

  // set base layer
  let baseMaps = {
    Street: street,
    Topography: topo
  };

  // set overlays
  let overlayMaps = {
    Markers: markerLayer,
    Circles: circleLayer,
    Tectonic: tectonicLayer
  };

  // add the layer control to  map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  // create legend 
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {
    let div = L.DomUtil.create('div', 'legend');
    let colors = ["#98EE00", "#D4EE00", "#EECC00", "#EE9C00", "#EA822C", "#EA2C2C"];
    let labels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];

    // set title
    div.innerHTML += "<h3>Depth</h3>";

    // Loop through the colors and labels to create the legend items
    for (let i = 0; i < colors.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' + labels[i] + '<br>';
    }

      return div;
  };

  // add legend to map
  legend.addTo(myMap);
  }

