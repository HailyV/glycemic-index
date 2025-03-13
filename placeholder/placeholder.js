mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW53MTIiLCJhIjoiY203ZWg1d2doMGU4bzJycHFrOGcwaXUwdSJ9.VbAWd85HtWgGtf7fEKfijQ'; // 🔹 Replace with your Mapbox token

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-98.5795, 39.8283], // Center on the US
    zoom: 4
});

// **🔹 Data: Diabetes Rate & Favorite Food**
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
    d3.csv("../data/diabetes/Processed_Diabetes_County_Data.csv").then(countyDiabetesData => {
        const countyDiabetesDict = {};

        countyDiabetesData.forEach(d => {
            if (d.County) {
                const countyName = d.County.trim().toLowerCase();
                const diabetesRate = parseFloat(d.Percentage);
                countyDiabetesDict[countyName] = isNaN(diabetesRate) ? null : diabetesRate;
            }
        });

    console.log("County Diabetes Dictionary Sample:", Object.entries(countyDiabetesDict).slice(0, 10));

    d3.json("https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json")
    .then(countyGeoJSON => {
        console.log("Before Assigning Data - Sample Feature:", countyGeoJSON.features[0].properties);

        // Merge county diabetes data into the GeoJSON
        countyGeoJSON.features.forEach(feature => {
            const countyName = feature.properties.NAME.trim().toLowerCase();
            
            if (countyDiabetesDict.hasOwnProperty(countyName)) {
                feature.properties.diabetes_rate = countyDiabetesDict[countyName];
            } else {
                feature.properties.diabetes_rate = null; // Explicitly set null for missing values
            }
        });

            console.log("After Assigning Data - Sample Feature:", countyGeoJSON.features[0].properties);

            // **🔹 Add County Data as a Heatmap**
            map.addSource('counties', { type: 'geojson', data: countyGeoJSON });

            map.addLayer({
                id: 'counties-layer',
                type: 'fill',
                source: 'counties',
                paint: {
                    'fill-color': [
                        'case',
                        ['!=', ['get', 'diabetes_rate'], null], // If diabetes_rate is NOT null
                        ['interpolate', ['linear'], ['get', 'diabetes_rate'],
                            5, '#f7fcf0',  // Lightest green (low diabetes)
                            7, '#c7e9c0',
                            9, '#73c476',
                            11, '#238b45', // Medium green
                            13, '#00441b'  // Dark green (high diabetes)
                        ],
                        '#D3D3D3' // Gray for missing data
                    ],
                    'fill-opacity': 0.85
                },
                layout: { 'visibility': 'none' } // Initially hidden until toggled
            });

            // **🔹 County Hover Tooltip**
            const tooltip = document.getElementById('tooltip');

            map.on('mousemove', 'counties-layer', function (e) {
                const county = e.features[0].properties.NAME || "Unknown";
                let diabetesRate = e.features[0].properties.diabetes_rate;

                // **🔹 Fix Error: Ensure diabetes_rate is a valid number**
                if (diabetesRate === null || isNaN(diabetesRate)) {
                    diabetesRate = "No Data"; // Show "No Data" instead of breaking the tooltip
                } else {
                    diabetesRate = diabetesRate.toFixed(1) + "%"; // Fixes the `.toFixed()` error
                }

                tooltip.style.display = 'block';
                tooltip.style.left = e.originalEvent.pageX + 15 + 'px';
                tooltip.style.top = e.originalEvent.pageY - 25 + 'px';
                tooltip.innerHTML = `
                    <strong>${county} County</strong><br>
                    📊 Diabetes Rate: ${diabetesRate}
                `;
            });

            map.on('mouseleave', 'counties-layer', function () {
                tooltip.style.display = 'none';
            });
        });
});





// **🔹 Remove Failing API Calls for State Food Markers**
// Commenting out or handling failed API calls
stateData.forEach(d => {
    /*
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
        })
        .catch(error => console.error(`Error loading marker for ${d.state}:`, error));
    */
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

            // **🔹 Tooltip on Hover**
            const tooltip = document.getElementById('tooltip');

            map.on('click', 'states-layer', function (e) {
                const stateName = e.features[0].properties.name;
                console.log(`🗺️ Expanding to counties in ${stateName}`);

                // Ensure county data is available
                if (!map.getSource('counties')) {
                    console.error("❌ County data source not found.");
                    return;
                }

                // Filter counties for the selected state
                const selectedStateCounties = {
                    type: "FeatureCollection",
                    features: map.getSource('counties')._data.features.filter(f => f.properties.STATE_NAME === stateName)
                };

                // Update county source with selected state counties
                map.getSource('counties').setData(selectedStateCounties);

                // Hide state layer, show county layer
                map.setLayoutProperty('states-layer', 'visibility', 'none');
                map.setLayoutProperty('counties-layer', 'visibility', 'visible');

                // Zoom into the selected state
                map.fitBounds(e.features[0].bbox, { padding: 50 });
            });

            map.on('click', function (e) {
                const features = map.queryRenderedFeatures(e.point);
                if (!features.length) {
                    console.log("🔄 Resetting to U.S. view");

                    // Show states, hide counties
                    map.setLayoutProperty('states-layer', 'visibility', 'visible');
                    map.setLayoutProperty('counties-layer', 'visibility', 'none');

                    // Reset zoom to full U.S.
                    map.flyTo({ center: [-98.5795, 39.8283], zoom: 4 });
                }
            });

            map.on('mousemove', 'states-layer', function (e) {
                const state = e.features[0].properties.name;
                const diabetesRate = e.features[0].properties.diabetes_rate;
                const food = e.features[0].properties.food;

                tooltip.style.left = e.originalEvent.pageX + 15 + 'px';
                tooltip.style.top = e.originalEvent.pageY - 25 + 'px';
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
        });
});


// Ensure the button exists
const toggleButton = document.getElementById("toggleView");

toggleButton.addEventListener("click", function () {
    // Check if the county layer exists before toggling
    if (map.getLayer('counties-layer')) {
        const currentVisibility = map.getLayoutProperty('counties-layer', 'visibility');

        if (currentVisibility === 'visible') {
            // Hide counties, show states
            map.setLayoutProperty('counties-layer', 'visibility', 'none');
            map.setLayoutProperty('states-layer', 'visibility', 'visible');
            map.setLayoutProperty('state-borders', 'visibility', 'visible');

            toggleButton.textContent = "View Counties"; // Update button text
        } else {
            // Show counties, hide states
            map.setLayoutProperty('counties-layer', 'visibility', 'visible');
            map.setLayoutProperty('states-layer', 'visibility', 'none');
            map.setLayoutProperty('state-borders', 'visibility', 'none');

            toggleButton.textContent = "View States"; // Update button text
        }
    } else {
        console.error("❌ 'counties-layer' does not exist yet. Please wait for the data to load.");
        alert("County data is still loading. Please try again in a few seconds.");
    }
});

