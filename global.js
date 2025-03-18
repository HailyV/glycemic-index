// Generate file paths for food logs
const foodFiles = Array.from({ length: 16 }, (_, i) =>
    `data/food/Food_Log_${String(i + 1).padStart(3, '0')}.csv`
);


console.log("Food Files:", foodFiles);

let firstClick = true;
let foodData = [];
let uniqueFoods = new Set();
let selectedItems = new Set();

// Function to load food CSV files asynchronously
async function loadFoodCSV() {
    try {
        const filePromises = foodFiles.map(file => d3.csv(file));
        const results = await Promise.all(filePromises);

        // Combine all food CSV data
        results.forEach(data => {
            foodData = foodData.concat(data);
        });

        console.log("Combined Food Data:", foodData);

        // Extract unique food names
        foodData.forEach(entry => {
            if (entry.logged_food) {
                uniqueFoods.add(entry.logged_food);
            }
        });

        // Populate the food selection dropdown
        populateFoodSelection();

    } catch (error) {
        console.error("Error loading Food CSV files:", error);
    }
}

// Function to populate the food selection checkboxes dynamically
function populateFoodSelection() {
    const container = document.getElementById("foodCheckboxContainer");
    container.innerHTML = ""; // Clear previous options

    uniqueFoods.forEach(food => {
        let label = document.createElement("label");
        label.classList.add("food-label");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = food;
        checkbox.id = `checkbox-${food}`;
        checkbox.name = "foodCheckbox";
        checkbox.classList.add("food-checkbox");

        if (selectedItems.has(food)) {
            checkbox.checked = true;
        }

        let textNode = document.createTextNode(food);

        // Ensure correct structure: <label> <input> Food Name </label>
        label.appendChild(checkbox);
        label.appendChild(textNode);

        container.appendChild(label);
    });

    // Add event listener to save selected items to the list
    container.addEventListener("change", function(event) {
        const checkbox = event.target;
        if (checkbox.checked) {
            if (selectedItems.size < 7) {
                selectedItems.add(checkbox.value);
            } else {
                alert("You can select up to 7 foods only.");
                checkbox.checked = false;
            }
        } else {
            selectedItems.delete(checkbox.value);
        }
    });
}

// Function to filter the food checkboxes based on search input
function filterFoodSelection() {
    const searchQuery = document.getElementById("foodSearch").value.toLowerCase();
    const container = document.getElementById("foodCheckboxContainer");
    const checkboxes = Array.from(document.querySelectorAll(".food-checkbox"));
    const labels = Array.from(document.querySelectorAll(".food-label"));

    container.innerHTML = ""; // Clear previous options

    checkboxes.forEach((checkbox, index) => {
        const label = labels[index];
        if (checkbox.value.toLowerCase().includes(searchQuery)) {
            container.appendChild(label);
            container.appendChild(document.createElement("br"));
        }
    });

    // If search bar is empty, repopulate all food items
    if (searchQuery === "") {
        populateFoodSelection();
    }
}

// Function to get selected food items from the saved list
function getSelectedFoods() {
    return Array.from(selectedItems);
}

// Load food CSV
loadFoodCSV();

// ---------------- PIE CHART AND SUMMARY STATS LOGIC ----------------

// Function to draw the horizontal bar chart
function drawBarChart(totalStats) {
    const barChartContainer = document.getElementById("barChartContainer");
    const footnote = document.getElementById("footnote");
    const svg = d3.select("#barChart");
    svg.selectAll("*").remove(); // Clear previous chart

    const data = [
        { nutrient: "Calories", value: totalStats.calorie },
        { nutrient: "Carbs", value: totalStats.total_carb },
        { nutrient: "Fat", value: totalStats.total_fat },
        { nutrient: "Protein", value: totalStats.protein },
        { nutrient: "Sugar", value: totalStats.sugar }
    ];

    const recommendedIntake = {
        Calories: [totalStats.calorie, totalStats.calorie],
        Carbs: [0.45 * totalStats.calorie / 4, 0.65 * totalStats.calorie / 4],
        Fat: [0.2 * totalStats.calorie / 9, 0.35 * totalStats.calorie / 9],
        Protein: [0.1 * totalStats.calorie / 4, 0.35 * totalStats.calorie / 4],
        Sugar: [0, 0.1 * totalStats.calorie / 4]
    };

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    svg.attr("width", width)
       .attr("height", height);

    const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .range([0, width - margin.left - margin.right]);

    const y = d3.scaleBand()
                .domain(data.map(d => d.nutrient))
                .range([0, height - margin.top - margin.bottom])
                .padding(0.1);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw recommended intake zones
    g.append("rect")
     .attr("x", x(recommendedIntake.Carbs[0]))
     .attr("y", y("Carbs"))
     .attr("width", x(recommendedIntake.Carbs[1] - recommendedIntake.Carbs[0]))
     .attr("height", y.bandwidth())
     .attr("fill", "rgba(255, 0, 255, 0.3)");

    g.append("rect")
     .attr("x", x(recommendedIntake.Fat[0]))
     .attr("y", y("Fat"))
     .attr("width", x(recommendedIntake.Fat[1] - recommendedIntake.Fat[0]))
     .attr("height", y.bandwidth())
     .attr("fill", "rgba(255, 0, 255, 0.3)");

    g.append("rect")
     .attr("x", x(recommendedIntake.Protein[0]))
     .attr("y", y("Protein"))
     .attr("width", x(recommendedIntake.Protein[1] - recommendedIntake.Protein[0]))
     .attr("height", y.bandwidth())
     .attr("fill", "rgba(255, 0, 255, 0.3)");

    g.append("rect")
     .attr("x", x(recommendedIntake.Sugar[0]))
     .attr("y", y("Sugar"))
     .attr("width", x(recommendedIntake.Sugar[1] - recommendedIntake.Sugar[0]))
     .attr("height", y.bandwidth())
     .attr("fill", "rgba(255, 0, 255, 0.3)");

    // Draw bars
    const bars = g.selectAll(".bar")
                  .data(data)
                  .enter()
                  .append("rect")
                  .attr("class", "bar")
                  .attr("x", 0)
                  .attr("y", d => y(d.nutrient))
                  .attr("width", d => x(d.value))
                  .attr("height", y.bandwidth())
                  .attr("fill", "#800080")
                  .on("mouseover", function(event, d) {
                      d3.select(this).attr("fill", "orange");
                      const tooltip = d3.select("#tooltip");
                      tooltip.transition().duration(200).style("opacity", 0.9);
                      tooltip.html(`
                          <strong>${d.nutrient}</strong><br/>
                          Consumed: ${d.value.toFixed(1)} g<br/>
                          Recommended: ${recommendedIntake[d.nutrient][0].toFixed(1)} - ${recommendedIntake[d.nutrient][1].toFixed(1)} g
                      `)
                      .style("left", (event.pageX + 10) + "px")
                      .style("top", (event.pageY - 28) + "px");
                  })
                  .on("mouseout", function() {
                      d3.select(this).attr("fill", "#800080");
                      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                  });

    // Add x-axis
    g.append("g")
     .attr("class", "x-axis")
     .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
     .call(d3.axisBottom(x))
     .append("text")
     .attr("class", "x-axis-label")
     .attr("x", (width - margin.left - margin.right) / 2)
     .attr("y", 40)
     .attr("fill", "#000")
     .style("text-anchor", "middle")
     .text("Intakes in grams (g)");

    // Add y-axis
    g.append("g")
     .attr("class", "y-axis")
     .call(d3.axisLeft(y));

    // Show the bar chart container and footnote
    barChartContainer.classList.remove("hidden");
    footnote.classList.remove("hidden");
}

// Function to update the total stats
function updateTotalStats(chartData) {
    const totalStatsDiv = document.getElementById("totalStats");
    totalStatsDiv.innerHTML = "<h3>Total Stats</h3>";

    const totalStats = chartData.reduce((acc, food) => {
        acc.calorie += food.calorie;
        acc.total_fat += food.total_fat;
        acc.total_carb += food.total_carb;
        acc.sugar += food.sugar;
        acc.protein += food.protein;
        return acc;
    }, { calorie: 0, total_fat: 0, total_carb: 0, sugar: 0, protein: 0 });

    totalStatsDiv.innerHTML += `
        <p><strong>Total Calories:</strong> ${totalStats.calorie.toFixed(1)}</p>
        <p><strong>Total Fat:</strong> ${totalStats.total_fat.toFixed(1)} g</p>
        <p><strong>Total Carbs:</strong> ${totalStats.total_carb.toFixed(1)} g</p>
        <p><strong>Total Sugar:</strong> ${totalStats.sugar.toFixed(1)} g</p>
        <p><strong>Total Protein:</strong> ${totalStats.protein.toFixed(1)} g</p>
    `;

    // Show the total stats
    totalStatsDiv.classList.remove("hidden");

    // Draw the bar chart
    drawBarChart(totalStats);
}

// Function to draw the pie chart and update summary stats
function drawPieChartForSelectedFoods(selectedFoods) {
    // Remove any existing chart and legend
    d3.select("#pieChart").selectAll("svg").remove();
    d3.select("#legend").html(""); // Clear legend before redrawing

    if (!selectedFoods.length) return;

    // 1. Filter data by selected foods
    const filtered = foodData.filter(d => selectedFoods.includes(d.logged_food));

    // 2. Create an object to store total stats and counts for each food
    const foodStatsMap = {};
    filtered.forEach(row => {
        const foodName = row.logged_food;

        // Convert all relevant strings to numbers
        const cal = +row.calorie || 0;
        const fat = +row.total_fat || 0;
        const carb = +row.total_carb || 0;
        const sugar = +row.sugar || 0;
        const protein = +row.protein || 0;

        if (!foodStatsMap[foodName]) {
            foodStatsMap[foodName] = {
                food: foodName,
                sumCalorie: 0,
                sumFat: 0,
                sumCarb: 0,
                sumSugar: 0,
                sumProtein: 0,
                count: 0
            };
        }

        // Accumulate sums
        foodStatsMap[foodName].sumCalorie += cal;
        foodStatsMap[foodName].sumFat += fat;
        foodStatsMap[foodName].sumCarb += carb;
        foodStatsMap[foodName].sumSugar += sugar;
        foodStatsMap[foodName].sumProtein += protein;

        // Count how many rows we have for this food
        foodStatsMap[foodName].count += 1;
    });

    // 3. Build the chartData array, computing the averages
    const chartData = Object.values(foodStatsMap).map(item => ({
        food: item.food,
        calorie: item.sumCalorie / item.count,
        total_fat: item.sumFat / item.count,
        total_carb: item.sumCarb / item.count,
        sugar: item.sumSugar / item.count,
        protein: item.sumProtein / item.count
    }));

    if (!chartData.length) return;

    // Update summary stats
    updateSummaryStats(chartData);

    // Update total stats
    updateTotalStats(chartData);

    // Dimensions
    const width = 520;
    const height = 520;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Create the SVG
    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create a color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the pie layout
    const pie = d3.pie().value(d => d.calorie);

    // Arc generator
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Bind data
    const arcs = svg.selectAll(".arc")
        .data(pie(chartData))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Add animated slices
    arcs.append("path")
        .attr("fill", d => color(d.data.food))
        .transition()  
        .duration(750)  
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    // Create the legend
    const legend = d3.select("#legend")
        .selectAll(".legend-item")
        .data(chartData)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .html(d => `
            <div class="legend-box" style="background-color: ${color(d.food)}"></div>
            <span>${d.food}</span>
        `);
}

// Function to update the summary stats
function updateSummaryStats(chartData) {
    const statsDiv = document.getElementById("summaryStats");

    // Keep Summary Title & Images
    statsDiv.innerHTML = `
        <h3>Summary Stats</h3>
        <div id="summaryImageContainer">    
            <img src="data/assets/apple.png" alt="Apple" class="summary-image">
            <img src="data/assets/egg.png" alt="Egg" class="summary-image">
            <img src="data/assets/pizza.png" alt="Pizza" class="summary-image">
        </div>
        <div class="summary-content"></div> <!-- Container for food info -->
    `;

    const contentDiv = statsDiv.querySelector(".summary-content");

    // Define colors for each food
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    chartData.forEach((food, index) => {
        const foodInfo = document.createElement("div");
        foodInfo.classList.add("food-item");

        const foodColor = colorScale(food.food);

        foodInfo.innerHTML = `
            <strong>${food.food} <span class="food-color-dot" style="background-color: ${foodColor};"></span></strong> 
            <br/>
            🍽 Calories: ${food.calorie.toFixed(1)}<br/>
            🥑 Fat: ${food.total_fat.toFixed(1)} g<br/>
            🍞 Carbs: ${food.total_carb.toFixed(1)} g<br/>
            🍬 Sugar: ${food.sugar.toFixed(1)} g<br/>
            💪 Protein: ${food.protein.toFixed(1)} g<br/>
        `;
        contentDiv.appendChild(foodInfo);
    });

    // Show the summary stats
    statsDiv.classList.remove("hidden");
}

// // Function to clear all selected items and reset the pie chart
// function clearSelection() {
//     const checkboxes = document.querySelectorAll(".food-checkbox:checked");
//     checkboxes.forEach(checkbox => {
//         checkbox.checked = false;
//     });

//     // Remove any existing chart and legend
//     d3.select("#pieChart").selectAll("svg").remove();
//     // d3.select("#legend").html(""); // Clear legend
//     d3.select("#barChart").selectAll("*").remove(); // Clear bar chart

//     // Hide summary stats, legend, total stats, bar chart, and footnote
//     document.getElementById("summaryStats").classList.add("hidden");
//     // document.getElementById("legend").classList.add("hidden");
//     document.getElementById("totalStats").classList.add("hidden");
//     document.getElementById("barChartContainer").classList.add("hidden");
//     document.getElementById("footnote").classList.add("hidden");

//     // Clear selected items
//     selectedItems.clear();
//     firstClick = true;
// }

function clearSelection() {
    const checkboxes = document.querySelectorAll(".food-checkbox:checked");
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Remove any existing chart and legend
    d3.select("#pieChart").selectAll("svg").remove();
    d3.select("#barChart").selectAll("*").remove(); // Clear bar chart

    // Hide summary stats, total stats, bar chart, and footnote
    document.getElementById("summaryStats").style.display = "none";  // ✅ Ensure it's fully hidden
    document.getElementById("totalStats").classList.add("hidden");
    document.getElementById("barChartContainer").classList.add("hidden");
    document.getElementById("footnote").classList.add("hidden");

    // Clear selected items
    selectedItems.clear();
    firstClick = true;
}


// Event listener for food selection updates
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("updateChartBtn").addEventListener("click", function() {
        const selectedFoods = getSelectedFoods();
        drawPieChartForSelectedFoods(selectedFoods);
    });

    document.getElementById("clearSelectionBtn").addEventListener("click", clearSelection);

    document.getElementById("foodSearch").addEventListener("input", filterFoodSelection);
});

// document.addEventListener("DOMContentLoaded", function () {
//     console.log("✅ DOM fully loaded and parsed!");

//     const updateChartBtn = document.getElementById("updateChartBtn");
//     const summaryStats = document.getElementById("summaryStats");
//     const pieChart = document.getElementById("pieChart");

//     if (!updateChartBtn) {
//         console.error("❌ ERROR: updateChartBtn not found! Check if the button ID is correct.");
//         return;
//     }
//     if (!pieChart) {
//         console.error("❌ ERROR: pieChart element not found! Make sure it exists in your HTML.");
//         return;
//     }

//     // Ensure the elements are initially hidden
//     summaryStats?.classList.add("hidden");

//     updateChartBtn.addEventListener("click", function () {
//         console.log("🛠 Button clicked!");

//         // Get selected options
//         const selectedFoods = getSelectedFoods();
//         console.log("Selected foods:", selectedFoods);

//         if (selectedFoods.length > 0) {
//             console.log("✅ Food selected! Showing summary stats...");
//             summaryStats.classList.remove("hidden");

//             setTimeout(() => {
//                 const statsContent = document.getElementById("statsContent");
            
//                 if (!statsContent) {
//                     console.error("❌ ERROR: statsContent not found! Check if it's inside #summaryStats and visible.");
//                     return; // Prevent further errors
//                 }
            
//                 console.log("✅ statsContent found! Updating text...");
//                 statsContent.innerText = `You selected: ${selectedFoods.join(", ")}`;
//             }, 100);

//             console.log("📌 firstClick value before checking:", firstClick);

//             if (firstClick) {
//                 firstClick = false; // Prevent future scrolling
//                 console.log("✅ First click detected! Attempting to scroll...");

//                 setTimeout(() => {
//                     pieChart.scrollIntoView({ behavior: "smooth", block: "start" });
//                     console.log("✅ Scroll action triggered successfully!");
//                 }, 300);
//             } else {
//                 console.log("⚠️ First click already used, skipping scroll.");
//             }
//         } else {
//             console.warn("⚠️ No foods selected, skipping scroll.");
//             summaryStats.classList.add("hidden");
//         }
//     });
// });

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM fully loaded and parsed!");

    const updateChartBtn = document.getElementById("updateChartBtn");
    const summaryStats = document.getElementById("summaryStats");
    const pieChart = document.getElementById("pieChart");

    if (!updateChartBtn) {
        console.error("❌ ERROR: updateChartBtn not found!");
        return;
    }
    if (!pieChart) {
        console.error("❌ ERROR: pieChart element not found!");
        return;
    }

    // ✅ Ensure summary stats is hidden at start
    summaryStats.style.display = "none";

    updateChartBtn.addEventListener("click", function () {
        console.log("🛠 Button clicked!");
        const selectedFoods = getSelectedFoods();
        console.log("Selected foods:", selectedFoods);

        if (selectedFoods.length > 0) {
            console.log("✅ Food selected! Showing summary stats...");
            summaryStats.style.display = "block";  // ✅ Show summary stats when button is clicked

            setTimeout(() => {
                const statsContent = document.getElementById("statsContent");
            
                if (!statsContent) {
                    console.error("❌ ERROR: statsContent not found!");
                    return;
                }
            
                statsContent.innerText = `You selected: ${selectedFoods.join(", ")}`;
            }, 100);

            if (firstClick) {
                firstClick = false;
                setTimeout(() => {
                    pieChart.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 300);
            }
        } else {
            console.warn("⚠️ No foods selected, hiding summary stats.");
            summaryStats.style.display = "none"; // ✅ Hide if no food is selected
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        if (window.location.href.includes(link.getAttribute("href"))) {
            link.classList.add("active");
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Visualization.js Loaded!");

    // ✅ Call your main function that loads the glucose data visualization
    loadGlucoseData(); // Ensure this function exists

    // ✅ Debugging: Check if tooltip exists
    const tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
        console.error("❌ Tooltip element not found! Make sure <div id='tooltip'></div> exists in HTML.");
    } else {
        console.log("✅ Tooltip detected!");
    }
});

async function loadGlucoseData() {
    const glucoseFiles = Array.from({ length: 16 }, (_, i) =>
        `data/glucose/Dexcom_${String(i + 1).padStart(3, '0')}.csv`
    );

    try {
        // Load all CSV files asynchronously
        const filePromises = glucoseFiles.map(file => d3.csv(file));
        const results = await Promise.all(filePromises);

        let personGlucoseData = [];

        results.forEach((data, index) => {
            // Skip the first 12 entries per file
            const filteredData = data.slice(12);

            // Extract glucose values and convert to numbers
            const glucoseValues = filteredData
                .map(d => parseFloat(d["Glucose Value (mg/dL)"] || d["Glucose Value"]))
                .filter(v => !isNaN(v));

            // Extract min (row 8) and max (row 7) glucose levels
            const minGlucose = glucoseValues.length >= 8 ? glucoseValues[7] : NaN;
            const maxGlucose = glucoseValues.length >= 7 ? glucoseValues[6] : NaN;

            // Calculate average glucose level for the person
            const averageGlucose = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;

            personGlucoseData.push({
                person: `Person ${index + 1}`,
                avgGlucose: averageGlucose,
                minGlucose,
                maxGlucose
            });
        });

        console.log("✅ Processed Glucose Data for Bar Chart:", personGlucoseData);

        // Draw Bar Chart with the processed data
        drawGlucoseBarChart(personGlucoseData);

    } catch (error) {
        console.error("❌ Error loading Glucose CSV files:", error);
    }
}

function drawGlucoseBarChart(data) {
    console.log("🚀 BEFORE: Starting Bar Chart Drawing...");
    console.log("📊 Received Data:", data); // Debugging: Check if data exists

    const svgContainer = d3.select("#chartContainer");
    svgContainer.html(""); // 🔄 **Fully clear the previous chart**

    d3.select("#resetButton").style("display", "none"); // Hide reset button

    const width = 800, height = 500, margin = { top: 40, right: 50, bottom: 70, left: 80 };
    const averageGlucoseTarget = 100;

    const svg = svgContainer.append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(data.map(d => d.person))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avgGlucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    // 📌 Debugging: Check if scales are correctly mapped
    console.log("📌 X Domain:", x.domain());
    console.log("📌 Y Domain:", y.domain());

// 📌 Ensure only one tooltip exists
let tooltip = d3.select("body").select(".tooltip");

if (tooltip.empty()) {
    console.log("📌 Creating new tooltip...");
    tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("border", "1px solid #ccc")
        .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)")
        .style("visibility", "hidden")
        .style("pointer-events", "none")
        .style("font-size", "12px");
} else {
    console.log("✅ Reusing existing tooltip.");
}


    // 📌 Draw Bars with Initial Height = 0 for animation
    const bars = svg.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.person))
        .attr("y", height - margin.bottom) // Start from bottom
        .attr("height", 0) // Start with no height
        .attr("width", x.bandwidth())
        .attr("fill", d3.color("steelblue"))
        .style("cursor", "pointer") // 🖱️ Pointer on hover
        .on("mouseover", function (event, d) {
            console.log(`🟢 Mouseover: ${d.person}`, d);
        
            d3.select(this).attr("fill", "orange"); // Highlight bar
        
            const tooltipContent = `
                <strong>${d.person}</strong><br>
                Avg Glucose: ${d.avgGlucose.toFixed(1)} mg/dL<br>
                🔽 Min: ${d.minGlucose} mg/dL<br>
                🔼 Max: ${d.maxGlucose} mg/dL
            `;

            console.log(`📝 Tooltip Content:\n${tooltipContent}`);
        
            // Show and update tooltip
            tooltip.style("visibility", "visible")
                .style("opacity", 1) // Ensure tooltip is fully visible
                .html(tooltipContent);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", `${event.pageY - 40}px`)
                .style("left", `${event.pageX + 15}px`);
        })
        .on("mouseout", function () {
            console.log("🔴 Mouseout: Reset tooltip & color");
            d3.select(this).attr("fill", "steelblue"); // Reset bar color
            tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {  
            console.log(`🟠 Clicked on ${d.person}, loading time series...`);
            const personIndex = data.findIndex(person => person.person === d.person);
            
            if (personIndex === -1) {
                console.error(`❌ Invalid person index: ${personIndex}`);
                return;
            }
            console.log(`🔍 Fetching time series for ${d.person} (Index ${personIndex})`);
            loadGlucoseForPerson(personIndex);
        });

    console.log("✅ Bars Created Successfully!");

    // 🚀 Animate Bars from Bottom to Correct Height
    bars.transition()
        .duration(800) // Moderate pace
        .delay((d, i) => i * 100) // Staggered delay for left-to-right effect
        .attr("y", d => y(d.avgGlucose)) // Move up
        .attr("height", d => height - margin.bottom - y(d.avgGlucose));

    console.log("✅ Bar Animation Completed");

    // X-Axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Y-Axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Glucose Levels Per Person");

    // 📌 **Dotted Line for 100 mg/dL**
    svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y(averageGlucoseTarget))
        .attr("y2", y(averageGlucoseTarget))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5"); // Dotted line

    // 📌 **Label for Dotted Line**
    svg.append("text")
        .attr("x", width - margin.right - 10) // Position near right side
        .attr("y", y(averageGlucoseTarget) - 5)
        .attr("text-anchor", "end")
        .style("fill", "red")
        .style("font-size", "12px")
        .text("Target: 100 mg/dL");

    // 📌 **X-Axis Label**
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10) // Adjusted for spacing
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Individuals");

    // 📌 **Y-Axis Label**
    svg.append("text")
        .attr("transform", `rotate(-90)`) // Rotate to vertical
        .attr("x", -height / 2)
        .attr("y", 20) // Adjust for spacing
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Glucose Level (mg/dL)");

    console.log("🚀 AFTER: Chart Drawing Completed!");
}

function loadGlucoseForPerson(personIndex) {
    if (isNaN(personIndex) || personIndex < 0 || personIndex >= 16) {
        console.error(`❌ Invalid person index: ${personIndex}`);
        return;
    }

    const filePath = `data/glucose/Dexcom_${String(personIndex + 1).padStart(3, '0')}.csv`;

    console.log(`📊 Fetching time series for Person ${personIndex + 1} from ${filePath}...`);

    d3.csv(filePath).then(data => {
        console.log(`✅ Loaded glucose data for Person ${personIndex + 1}`);

        const glucoseValues = data.slice(12).map(d => ({
            timestamp: new Date(d["Timestamp (YYYY-MM-DDThh:mm:ss)"]),
            glucose: parseFloat(d["Glucose Value (mg/dL)"] || d["Glucose Value"]),
        })).filter(d => !isNaN(d.glucose));

        // Pass person index to the time-series chart
        drawTimeSeriesChart(glucoseValues, personIndex);
    }).catch(error => {
        console.error("❌ Error loading glucose file:", error);
    });
}

function drawTimeSeriesChart(glucoseData, personIndex) {
    console.log(`🟢 Drawing Time Series Chart for Person ${personIndex + 1}...`);
    console.log("📊 Raw Glucose Data:", glucoseData);

    const svgContainer = d3.select("#chartContainer");
    svgContainer.html(""); // 🔄 Clear the previous chart

    d3.select("#resetButton").style("display", "block"); // Show the reset button

    const width = 800, height = 500, margin = { top: 60, right: 50, bottom: 70, left: 80 };

    const svg = svgContainer.append("svg")
        .attr("width", width)
        .attr("height", height);

    // ✅ Title Debugging
    console.log("✅ Adding Chart Title...");
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Average Glucose Levels Per Hour for Person ${personIndex + 1}`);

    // ✅ Compute Hourly Averages
    let hourlyAverages = {};
    glucoseData.forEach(d => {
        let date = new Date(d.timestamp);
        let hour = date.getHours();

        if (!hourlyAverages[hour]) {
            hourlyAverages[hour] = { sum: 0, count: 0 };
        }
        hourlyAverages[hour].sum += d.glucose;
        hourlyAverages[hour].count += 1;
    });

    // Convert averages into an array
    const averagedData = Object.keys(hourlyAverages).map(hour => ({
        hour: +hour,
        glucose: hourlyAverages[hour].sum / hourlyAverages[hour].count
    }));

    console.log("✅ Computed Hourly Averages:", averagedData);

    if (averagedData.length === 0) {
        console.error("❌ No valid glucose data found for this person!");
        return;
    }

    // ✅ Scales
    const x = d3.scaleLinear()
        .domain([0, 23])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(averagedData, d => d.glucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    // ✅ AM/PM Highlighting
    console.log("✅ Adding AM/PM Background Highlights...");
    svg.append("rect")
        .attr("x", x(0))
        .attr("y", margin.top)
        .attr("width", x(12) - x(0))
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(135, 206, 250, 0.2)");

    svg.append("rect")
        .attr("x", x(12))
        .attr("y", margin.top)
        .attr("width", x(24) - x(12))
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(255, 182, 193, 0.2)");

    // ✅ Line Chart
    console.log("✅ Drawing Line Chart...");
    const line = d3.line()
        .x(d => x(d.hour))
        .y(d => y(d.glucose))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(averagedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // ✅ Format X-Axis Labels
    function customTimeFormat(hour) {
        let period = hour >= 12 ? "PM" : "AM";
        let formattedHour = hour % 12 || 12;
        return `${formattedHour}${period}`;
    }

    // ✅ X & Y Axis
    console.log("✅ Drawing Axes...");
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(24).tickFormat(customTimeFormat))
        .selectAll("text")
        .style("text-anchor", "middle");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // ✅ Axis Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Time of Day");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .text("Average Glucose Level (mg/dL)");

    // ✅ Tooltip Debugging: Ensure Only One Exists
    console.log("✅ Creating Tooltip...");
    let tooltip = d3.select(".tooltip");

    if (tooltip.empty()) {
        console.log("📌 Creating new tooltip...");
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "8px")
            .style("border-radius", "5px")
            .style("border", "1px solid #ccc")
            .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)")
            .style("visibility", "hidden")
            .style("pointer-events", "none")
            .style("font-size", "12px");
    } else {
        console.log("✅ Reusing existing tooltip.");
    }

    // ✅ Scatter Points
    console.log("✅ Plotting Data Points...");
    svg.selectAll("circle")
        .data(averagedData)
        .enter().append("circle")
        .attr("cx", d => x(d.hour))
        .attr("cy", d => y(d.glucose))
        .attr("r", 6)
        .attr("fill", "rgba(70, 130, 180, 0.7)")
        .on("mouseover", function (event, d) {
            console.log(`🟢 Mouseover: Hour ${d.hour}, Glucose ${d.glucose}`);
            tooltip.style("visibility", "visible")
                .html(`<strong>${customTimeFormat(d.hour)}</strong><br>Avg Glucose: ${d.glucose.toFixed(1)} mg/dL`);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 20) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    // ✅ Legend Debugging
    console.log("✅ Adding Legend...");
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 120}, ${margin.top})`);

    legend.append("rect")
        .attr("x", -10)
        .attr("y", -5)
        .attr("width", 120)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("opacity", 0.8);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#87CEFA");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "14px")
        .text("Day (AM)");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#FFB6C1");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 37)
        .style("font-size", "14px")
        .text("Night (PM)");

    console.log("✅ Time Series Chart Completed!");
}


document.getElementById("resetButton").addEventListener("click", function () {
    console.log("🔄 Resetting to bar chart...");

    // 🔄 **Save Scroll Position**
    const scrollPosition = window.scrollY;

    // 🔄 **Clear Everything Before Loading**
    d3.select("#chartContainer").html(""); // Remove old charts
    d3.select(".tooltip").remove(); // Remove tooltip if exists
    d3.select("#resetButton").style("display", "none"); // Hide reset button

    // 🔄 **Reload the Bar Chart**
    loadGlucoseData();

    // 🔄 **Restore Scroll Position After Short Delay**
    setTimeout(() => {
        window.scrollTo(0, scrollPosition);
    }, 50); // Short delay to allow rendering
});

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {
        if (window.location.href.includes(link.getAttribute("href"))) {
            link.classList.add("active");
        }
    });
});