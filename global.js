// Generate file paths for food logs
const foodFiles = Array.from({ length: 16 }, (_, i) =>
    `data/food/Food_Log_${String(i + 1).padStart(3, '0')}.csv`
);

console.log("Food Files:", foodFiles);

let foodData = [];
let uniqueFoods = new Set();

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

// Function to populate the food selection dropdown dynamically
function populateFoodSelection() {
    const selectElement = document.getElementById("multiFoodSelect");
    selectElement.innerHTML = ""; // Clear previous options

    uniqueFoods.forEach(food => {
        let option = document.createElement("option");
        option.value = food;
        option.textContent = food;
        selectElement.appendChild(option);
    });
}

// Function to filter the food dropdown based on search input
function filterFoodSelection() {
    const searchQuery = document.getElementById("foodSearch").value.toLowerCase();
    const selectElement = document.getElementById("multiFoodSelect");

    Array.from(selectElement.options).forEach(option => {
        if (option.value.toLowerCase().includes(searchQuery)) {
            option.style.display = "";
        } else {
            option.style.display = "none";
        }
    });
}

// Load food CSV
loadFoodCSV();

// ---------------- PIE CHART AND SUMMARY STATS LOGIC ----------------

// Function to draw the pie chart and update summary stats
function drawPieChartForSelectedFoods(selectedFoods) {
    // Remove any existing chart and legend
    d3.select("#pieChart").selectAll("svg").remove();
    d3.select("#legend").html(""); // Clear legend before redrawing
    d3.select("#summaryStats").html(""); // Clear previous stats

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

    // Update summary stats with fade-in animation
    updateSummaryStats(chartData);

    // Dimensions
    const width = 400;
    const height = 400;
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
        .duration(1000)
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    // Animate the legend
    const legend = d3.select("#legend")
        .selectAll(".legend-item")
        .data(chartData)
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .style("opacity", 0)  // Start hidden
        .style("transform", "translateX(-20px)")  // Move left
        .html(d => `
            <div class="legend-box" style="background-color: ${color(d.food)}"></div>
            <span>${d.food}</span>
        `)
        .transition()
        .duration(700)
        .style("opacity", 1)  // Fade in
        .style("transform", "translateX(0px)");  // Move to position
}

// Function to update the summary stats with animation
function updateSummaryStats(chartData) {
    const statsDiv = d3.select("#summaryStats");
    statsDiv.html("<h3>Summary Stats</h3>");

    const statsContent = statsDiv.selectAll(".food-stats")
        .data(chartData)
        .enter()
        .append("div")
        .attr("class", "food-stats")
        .style("opacity", 0) // Start hidden
        .html(d => `
            <strong>${d.food}</strong>:<br/>
            Calories: ${d.calorie.toFixed(1)}<br/>
            Fat: ${d.total_fat.toFixed(1)} g<br/>
            Carbs: ${d.total_carb.toFixed(1)} g<br/>
            Sugar: ${d.sugar.toFixed(1)} g<br/>
            Protein: ${d.protein.toFixed(1)} g<br/><br/>
        `)
        .transition()
        .duration(800)
        .style("opacity", 1); // Fade in smoothly
}



// Function to update the summary stats with a fade-in effect
function updateSummaryStats(chartData) {
    const statsDiv = d3.select("#summaryStats");
    
    // Clear existing stats but keep the container
    statsDiv.html("<h3>Summary Stats</h3>");
    
    // Append food stats with a fade-in effect
    const statsContent = statsDiv.selectAll(".stats-item")
        .data(chartData)
        .enter()
        .append("div")
        .attr("class", "stats-item")
        .style("opacity", 0) // Start hidden
        .html(d => `
            <strong>${d.food}</strong>:<br/>
            Calories: ${d.calorie.toFixed(1)}<br/>
            Fat: ${d.total_fat.toFixed(1)} g<br/>
            Carbs: ${d.total_carb.toFixed(1)} g<br/>
            Sugar: ${d.sugar.toFixed(1)} g<br/>
            Protein: ${d.protein.toFixed(1)} g<br/><br/>
        `);

    // Apply fade-in transition
    statsContent.transition()
        .duration(500)
        .style("opacity", 1);
}


// Event listener for food selection updates
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("updateChartBtn").addEventListener("click", function() {
        const selectedOptions = Array.from(document.getElementById("multiFoodSelect").selectedOptions)
                                    .map(opt => opt.value)
                                    .slice(0, 5);
        drawPieChartForSelectedFoods(selectedOptions);
    });

    document.getElementById("foodSearch").addEventListener("input", filterFoodSelection);
});

// hides summary stats and legend until you submit
document.addEventListener("DOMContentLoaded", function () {
    const updateChartBtn = document.getElementById("updateChartBtn");
    const summaryStats = document.getElementById("summaryStats");
    const legend = document.getElementById("legend");

    updateChartBtn.addEventListener("click", function () {
        // Get selected options
        const selectedFoods = Array.from(document.getElementById("multiFoodSelect").selectedOptions)
                                   .map(option => option.value);

        if (selectedFoods.length > 0) {
            // Show summary stats and legend if at least one food is selected
            summaryStats.classList.remove("hidden");
            legend.classList.remove("hidden");

            // Example: Update summary stats dynamically
            document.getElementById("statsContent").innerText = `You selected: ${selectedFoods.join(", ")}`;
        } else {
            // Hide if nothing is selected
            summaryStats.classList.add("hidden");
            legend.classList.add("hidden");
        }
    });
});