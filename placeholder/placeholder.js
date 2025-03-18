mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW53MTIiLCJhIjoiY203ZWg1d2doMGU4bzJycHFrOGcwaXUwdSJ9.VbAWd85HtWgGtf7fEKfijQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-98.5795, 39.8283], // Center on the US
  zoom: 3.5,
  attributionControl: false // 🔹 Hides the Mapbox text
});

const stateData = [
  { state: "Alabama", diabetes_rate: 13.4, lower_limit: 12.3, upper_limit: 14.7, food: "Pecans" },
  { state: "Alaska", diabetes_rate: 8.3, lower_limit: 7.5, upper_limit: 9.2, food: "Salmon" },
  { state: "Arizona", diabetes_rate: 11.3, lower_limit: 10.3, upper_limit: 12.3, food: "Chimichangas" },
  { state: "Arkansas", diabetes_rate: 13.9, lower_limit: 12.8, upper_limit: 15.1, food: "Tomatoes" },
  { state: "California", diabetes_rate: 10.6, lower_limit: 9.8, upper_limit: 11.4, food: "Avocado" },
  { state: "Colorado", diabetes_rate: 7.6, lower_limit: 6.9, upper_limit: 8.3, food: "Steak" },
  { state: "Connecticut", diabetes_rate: 9.1, lower_limit: 8.3, upper_limit: 10.0, food: "White clam pizza" },
  { state: "Delaware", diabetes_rate: 11.7, lower_limit: 10.5, upper_limit: 13.1, food: "Blue Hen Chicken" },
  { state: "Florida", diabetes_rate: 9.6, lower_limit: 8.7, upper_limit: 10.5, food: "Oranges" },
  { state: "Georgia", diabetes_rate: 10.9, lower_limit: 10.1, upper_limit: 11.7, food: "Peaches" },
  { state: "Hawaii", diabetes_rate: 10.3, lower_limit: 9.4, upper_limit: 11.3, food: "Pineapple" },
  { state: "Idaho", diabetes_rate: 8.9, lower_limit: 8.1, upper_limit: 9.7, food: "Potatoes" },
  { state: "Illinois", diabetes_rate: 10.7, lower_limit: 9.6, upper_limit: 11.8, food: "Deep-dish Pizza" },
  { state: "Indiana", diabetes_rate: 11.2, lower_limit: 10.6, upper_limit: 11.9, food: "Sugar Cream Pie" },
  { state: "Iowa", diabetes_rate: 10.2, lower_limit: 9.5, upper_limit: 10.9, food: "Corn" },
  { state: "Kansas", diabetes_rate: 10.1, lower_limit: 9.5, upper_limit: 10.8, food: "BBQ" },
  { state: "Kentucky", diabetes_rate: 12.9, lower_limit: 11.6, upper_limit: 14.2, food: "Blackberries" },
  { state: "Louisiana", diabetes_rate: 13.2, lower_limit: 12.2, upper_limit: 14.2, food: "Gumbo" },
  { state: "Maine", diabetes_rate: 9.0, lower_limit: 8.2, upper_limit: 9.8, food: "Lobster" },
  { state: "Maryland", diabetes_rate: 10.5, lower_limit: 9.8, upper_limit: 11.2, food: "Blue Crab" },
  { state: "Massachusetts", diabetes_rate: 9.2, lower_limit: 8.4, upper_limit: 10.0, food: "Clam Chowder" },
  { state: "Michigan", diabetes_rate: 10.0, lower_limit: 9.3, upper_limit: 10.7, food: "Cherries" },
  { state: "Minnesota", diabetes_rate: 9.0, lower_limit: 8.4, upper_limit: 9.6, food: "Wild Rice" },
  { state: "Mississippi", diabetes_rate: 13.7, lower_limit: 12.4, upper_limit: 15.0, food: "Biscuits" },
  { state: "Missouri", diabetes_rate: 10.1, lower_limit: 9.3, upper_limit: 11.0, food: "Ice Cream" },
  { state: "Montana", diabetes_rate: 7.1, lower_limit: 6.5, upper_limit: 7.8, food: "Huckleberries" },
  { state: "Nebraska", diabetes_rate: 9.7, lower_limit: 8.9, upper_limit: 10.5, food: "Popcorn" },
  { state: "Nevada", diabetes_rate: 8.8, lower_limit: 7.7, upper_limit: 10.1, food: "Chateaubriand" },
  { state: "New Hampshire", diabetes_rate: 8.1, lower_limit: 7.3, upper_limit: 9.0, food: "Lobster Rolls" },
  { state: "New Jersey", diabetes_rate: 9.5, lower_limit: 8.6, upper_limit: 10.4, food: "Blueberries" },
  { state: "New Mexico", diabetes_rate: 11.0, lower_limit: 9.9, upper_limit: 12.2, food: "Chiles" },
  { state: "New York", diabetes_rate: 9.9, lower_limit: 9.3, upper_limit: 10.6, food: "Cheesecake" },
  { state: "North Carolina", diabetes_rate: 10.6, lower_limit: 9.5, upper_limit: 11.7, food: "Strawberries" },
  { state: "North Dakota", diabetes_rate: 8.9, lower_limit: 8.0, upper_limit: 9.8, food: "Chokecherry" },
  { state: "Ohio", diabetes_rate: 11.3, lower_limit: 10.6, upper_limit: 12.0, food: "Pawpaw" },
  { state: "Oklahoma", diabetes_rate: 12.1, lower_limit: 11.2, upper_limit: 13.0, food: "Watermelon" },
  { state: "Oregon", diabetes_rate: 9.0, lower_limit: 8.1, upper_limit: 9.9, food: "Pears" },
  { state: "Pennsylvania", diabetes_rate: 10.0, lower_limit: 8.8, upper_limit: 11.5, food: "Cheesesteaks" },
  { state: "Rhode Island", diabetes_rate: 10.0, lower_limit: 9.1, upper_limit: 11.0, food: "Frozen Lemonade" },
  { state: "South Carolina", diabetes_rate: 11.0, lower_limit: 10.2, upper_limit: 11.8, food: "Boiled peanuts" },
  { state: "South Dakota", diabetes_rate: 8.0, lower_limit: 6.7, upper_limit: 9.6, food: "Kuchen" },
  { state: "Tennessee", diabetes_rate: 13.0, lower_limit: 12.0, upper_limit: 14.1, food: "Hot Chicken" },
  { state: "Texas", diabetes_rate: 13.2, lower_limit: 12.2, upper_limit: 14.3, food: "Texas Toast" },
  { state: "Utah", diabetes_rate: 8.9, lower_limit: 8.3, upper_limit: 9.6, food: "Jell-o" },
  { state: "Vermont", diabetes_rate: 7.0, lower_limit: 6.2, upper_limit: 7.8, food: "Maple syrup" },
  { state: "Virginia", diabetes_rate: 11.3, lower_limit: 10.6, upper_limit: 12.1, food: "Ham" },
  { state: "Washington", diabetes_rate: 8.8, lower_limit: 8.4, upper_limit: 9.2, food: "Coffee" },
  { state: "West Virginia", diabetes_rate: 14.4, lower_limit: 13.4, upper_limit: 15.5, food: "Apples" },
  { state: "Wisconsin", diabetes_rate: 8.8, lower_limit: 8.2, upper_limit: 9.4, food: "Cheese" },
  { state: "Wyoming", diabetes_rate: 8.1, lower_limit: 7.3, upper_limit: 8.9, food: "Soda bread" }
];


map.on('load', function () {
  // Load and process county diabetes CSV
  d3.csv("./data/diabetes/DiabetesAtlas_CountyData.csv").then(countyDiabetesData => {
    const countyDiabetesDict = {};

    countyDiabetesData.forEach(d => {
      if (d.County) {
        // Normalize the county name: trim, lowercase, and remove common suffixes.
        let countyName = d.County.trim().toLowerCase();
        countyName = countyName.replace(/\s*(county|parish|borough|census area)$/i, "");
        const diabetesRate = parseFloat(d.Percentage);
        countyDiabetesDict[countyName] = isNaN(diabetesRate) ? null : diabetesRate;
      }
    });

    d3.json("https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json")
      .then(countyGeoJSON => {
        countyGeoJSON.features.forEach(feature => {
          let countyName = feature.properties.NAME.trim().toLowerCase();
          countyName = countyName.replace(/\s*(county|parish|borough|census area)$/i, "");
          feature.properties.diabetes_rate = countyDiabetesDict.hasOwnProperty(countyName)
            ? countyDiabetesDict[countyName]
            : null;
        });

        // Add county source and layer
        map.addSource('counties', { type: 'geojson', data: countyGeoJSON });

        map.addLayer({
          id: 'counties-layer',
          type: 'fill',
          source: 'counties',
          paint: {
            'fill-color': [
              'case',
              ['!=', ['get', 'diabetes_rate'], null],
              ['interpolate', ['linear'], ['get', 'diabetes_rate'],
                5, '#f7fcf0',
                7, '#c7e9c0',
                9, '#73c476',
                11, '#238b45',
                13, '#00441b'
              ],
              '#D3D3D3'
            ],
            // Set initial opacity to 0 so counties are hidden on load.
            'fill-opacity': 0
          }
        });

        // Add a tooltip for counties
        const tooltip = document.getElementById('tooltip');
        map.on('mousemove', 'counties-layer', function (e) {
          // Only show county tooltip if the counties layer is visible
          if (map.getPaintProperty('counties-layer', 'fill-opacity') <= 0) return;
          
          const county = e.features[0].properties.NAME || "Unknown";
          let diabetesRate = e.features[0].properties.diabetes_rate;
          diabetesRate = (diabetesRate === null || isNaN(diabetesRate))
            ? "No Data"
            : diabetesRate.toFixed(1) + "%";
        
          tooltip.style.display = 'block';
          tooltip.style.left = e.originalEvent.pageX + 15 + 'px';
          tooltip.style.top = e.originalEvent.pageY - 25 + 'px';
          tooltip.innerHTML = `<strong>${county} County</strong><br>📊 Diabetes Rate: ${diabetesRate}`;
        });
      });
  });

  d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
    .then(geojson => {
      geojson.features.forEach(feature => {
        const stateName = feature.properties.name;
        const stateInfo = stateData.find(d => d.state === stateName);
        if (stateInfo) {
          feature.properties.diabetes_rate = stateInfo.diabetes_rate;
          feature.properties.food = stateInfo.food;
        }
      });

      map.addSource('states', {
        type: 'geojson',
        data: geojson
      });

      // **🔹 Choropleth for Diabetes Rate**
      map.addLayer({
        id: 'states-layer',
        type: 'fill',
        source: 'states',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'diabetes_rate'],
            5, '#f0f9e8',
            10, '#bae4bc',
            15, '#7bccc4',
            20, '#43a2ca',
            25, '#0868ac'
          ],
          'fill-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'state-borders',
        type: 'line',
        source: 'states',
        paint: {
          'line-color': '#fff',
          'line-width': 1
        }
      });

      // **🔹 Add Food Markers**
      stateData.forEach(d => {
        fetch(`https://nominatim.openstreetmap.org/search?state=${d.state}&country=USA&format=json`)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              const coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];

              const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat(coords)
                .setPopup(new mapboxgl.Popup().setHTML(`
                  <strong>${d.state}</strong><br>
                  📊 Diabetes Rate: ${d.diabetes_rate}%<br>
                  🍽 Favorite Food: ${d.food}
                `))
                .addTo(map);
            }
          });
      });

      // **🔹 Tooltip on Hover for States**
      const tooltip = document.getElementById('tooltip');
      map.on('mousemove', 'states-layer', function (e) {
        const state = e.features[0].properties.name;
        const diabetesRate = e.features[0].properties.diabetes_rate;
        const food = e.features[0].properties.food;

        tooltip.style.left = `${e.originalEvent.pageX -350}px`;  // 🔹 Closer to cursor (reduce offset)
        tooltip.style.top = `${e.originalEvent.pageY - 350}px`;
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <strong>${state}</strong><br>
          📊 Diabetes Rate: ${diabetesRate}%<br>
          🍽 Favorite Food: ${food}
        `;
      });

      map.on('mouseleave', 'states-layer', function () {
        tooltip.style.display = 'none';
      });



      map.on('click', function (e) {
        const features = map.queryRenderedFeatures(e.point);
        if (!features.length) {
          console.log("🔄 Resetting to U.S. view");
          map.setLayoutProperty('states-layer', 'visibility', 'visible');
          map.setLayoutProperty('counties-layer', 'visibility', 'none');
          map.flyTo({ center: [-98.5795, 39.8283], zoom: 4 });
        }
      });

      // ***** SEARCH FUNCTIONALITY *****
      const searchInput = document.getElementById('search');
      const suggestionsList = document.getElementById('suggestions');

      // Listen for input changes
      searchInput.addEventListener('input', function (e) {
        const query = e.target.value.toLowerCase().trim();
        suggestionsList.innerHTML = "";
        if (query.length < 2) return; // only search when query is 2+ characters

        // Get features from states and counties sources
        const stateFeatures = map.getSource('states') ? map.getSource('states')._data.features : [];
        const countyFeatures = map.getSource('counties') ? map.getSource('counties')._data.features : [];

        // Filter matching features (states use "name", counties use "NAME")
        const matchingStates = stateFeatures.filter(f =>
          f.properties.name.toLowerCase().includes(query)
        );
        const matchingCounties = countyFeatures.filter(f =>
          f.properties.NAME.toLowerCase().includes(query)
        );

        // Combine results with a type indicator
        const combined = [
          ...matchingStates.map(f => ({ feature: f, type: 'state' })),
          ...matchingCounties.map(f => ({ feature: f, type: 'county' }))
        ];

        // Optionally sort alphabetically by name
        combined.sort((a, b) => {
          const nameA = a.type === 'state' ? a.feature.properties.name : a.feature.properties.NAME;
          const nameB = b.type === 'state' ? b.feature.properties.name : b.feature.properties.NAME;
          return nameA.localeCompare(nameB);
        });

        // Populate suggestions list with a fade-in effect
        combined.forEach(item => {
          const name = item.type === 'state' ? item.feature.properties.name : item.feature.properties.NAME;
          const li = document.createElement('li');
          li.textContent = `${name} (${item.type})`;
          li.className = "suggestion-item";
          li.style.opacity = "0";
          li.style.transition = "opacity 0.3s ease";
          li.addEventListener('click', function () {
            // Clear suggestions and search input when a suggestion is clicked
            suggestionsList.innerHTML = "";
            searchInput.value = "";

            // Calculate bounds for the selected feature
            let bounds = new mapboxgl.LngLatBounds();
            const geom = item.feature.geometry;
            if (geom.type === "Polygon") {
              geom.coordinates.forEach(ring => {
                ring.forEach(coord => bounds.extend(coord));
              });
            } else if (geom.type === "MultiPolygon") {
              geom.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                  ring.forEach(coord => bounds.extend(coord));
                });
              });
            }
            // If bounds are empty, use flyTo with the center coordinate.
            if (bounds.isEmpty()) {
              const center = geom.coordinates[0];
              map.flyTo({ center: center, zoom: 8, duration: 1000 });
            } else {
              map.fitBounds(bounds, { padding: 20, duration: 1000 });
            }
          });
          suggestionsList.appendChild(li);
          // Trigger fade in
          requestAnimationFrame(() => {
            li.style.opacity = "1";
          });
        });
      });

      // Hide suggestions if clicking outside the search container.
      document.addEventListener('click', function (e) {
        if (!document.getElementById('search-container').contains(e.target)) {
          suggestionsList.innerHTML = "";
        }
      });
    });
});


// Toggle button: Switch between state and county views by animating opacity
const toggleButton = document.getElementById("toggleView");

toggleButton.addEventListener("click", function () {
  // Check current opacity of counties layer to decide which view is active.
  const countiesOpacity = map.getPaintProperty('counties-layer', 'fill-opacity');

  if (countiesOpacity > 0) {
    // Fade out counties and fade in states.
    map.setPaintProperty('counties-layer', 'fill-opacity', 0);
    map.setPaintProperty('states-layer', 'fill-opacity', 0.75);
    map.setPaintProperty('state-borders', 'line-opacity', 1);
    toggleButton.textContent = "View Counties";
  } else {
    // Fade in counties and fade out states.
    map.setPaintProperty('counties-layer', 'fill-opacity', 0.85);
    map.setPaintProperty('states-layer', 'fill-opacity', 0);
    map.setPaintProperty('state-borders', 'line-opacity', 0);
    toggleButton.textContent = "View States";
  }
});

const miniMap = new mapboxgl.Map({
  container: "mini-map", // Ensure this div exists in HTML
  style: "mapbox://styles/mapbox/light-v10",
  center: [-98.5795, 39.8283], // Same initial center as main map
  zoom: 1.8, // Adjusted zoom level
  interactive: true, // Disable interactions
  attributionControl: false // 🔹 Hides the Mapbox tex
});

// ✅ Function to fetch Fast Food locations locally
async function fetchFastFoodFromFile() {
  try {
    const response = await fetch("./data/export.geojson");
    const data = await response.json();
    console.log("✅ Loaded fast food data from file:", data);
    return data;
  } catch (error) {
    console.error("❌ Error loading local fast food data:", error);
    return null;
  }
}

miniMap.on("load", async function () {
  console.log("✅ Mini-map loaded successfully.");

  let fastFoodGeoJSON = await fetchFastFoodFromFile();
  if (!fastFoodGeoJSON) return;

  // ✅ Mini-map uses "fast-food-density-mini"
  miniMap.addSource("fast-food-density-mini", {
    type: "geojson",
    data: fastFoodGeoJSON,
  });

   // ✅ Remove the heatmap and replace with dots
miniMap.addLayer({
  id: "fast-food-dots-mini",
  type: "circle",
  source: "fast-food-density-mini",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 1.5, 12, 4], // Adjust size by zoom
    "circle-color": "rgb(255, 128, 128)", // Bright red to stand out
    "circle-opacity": 0.8, // Slightly transparent
  }
});

  console.log("✅ Fast food heatmap added to mini-map.");
});
