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

        let textNode = document.createTextNode(food);

        // Ensure correct structure: <label> <input> Food Name </label>
        label.appendChild(checkbox);
        label.appendChild(textNode);

        container.appendChild(label);
        container.appendChild(document.createElement("br"));
    });

    // Add event listener to limit the number of selected checkboxes to 5
    container.addEventListener("change", function(event) {
        const selectedCheckboxes = container.querySelectorAll(".food-checkbox:checked");
        if (selectedCheckboxes.length > 5) {
            alert("You can select up to 5 foods only.");
            event.target.checked = false;
        }
    });
}


// Function to filter the food checkboxes based on search input
function filterFoodSelection() {
    const searchQuery = document.getElementById("foodSearch").value.toLowerCase();
    const checkboxes = document.querySelectorAll(".food-checkbox");

    checkboxes.forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (checkbox.value.toLowerCase().includes(searchQuery)) {
            checkbox.style.display = "";
            label.style.display = "";
        } else {
            checkbox.style.display = "none";
            label.style.display = "none";
        }
    });
}

// Function to get selected food items from checkboxes
function getSelectedFoods() {
    const selectedCheckboxes = Array.from(document.querySelectorAll(".food-checkbox:checked"));
    return selectedCheckboxes.map(checkbox => checkbox.value).slice(0, 5);
}

// Load food CSV
loadFoodCSV();

// ---------------- PIE CHART AND SUMMARY STATS LOGIC ----------------

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
    statsDiv.innerHTML = "<h3>Summary Stats</h3>";

    chartData.forEach(food => {
        statsDiv.innerHTML += `
            <strong>${food.food}</strong>:<br/>
            Calories: ${food.calorie.toFixed(1)}<br/>
            Fat: ${food.total_fat.toFixed(1)} g<br/>
            Carbs: ${food.total_carb.toFixed(1)} g<br/>
            Sugar: ${food.sugar.toFixed(1)} g<br/>
            Protein: ${food.protein.toFixed(1)} g<br/><br/>
        `;
    });
}

// Function to clear all selected items and reset the pie chart
function clearSelection() {
    const checkboxes = document.querySelectorAll(".food-checkbox:checked");
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Remove any existing chart and legend
    d3.select("#pieChart").selectAll("svg").remove();
    d3.select("#legend").html(""); // Clear legend

    // Hide summary stats and legend
    document.getElementById("summaryStats").classList.add("hidden");
    document.getElementById("legend").classList.add("hidden");
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

// hides summary stats and legend until you submit
document.addEventListener("DOMContentLoaded", function () {
    const updateChartBtn = document.getElementById("updateChartBtn");
    const summaryStats = document.getElementById("summaryStats");
    const legend = document.getElementById("legend");

    // Ensure the elements are initially hidden
    summaryStats.classList.add("hidden");
    legend.classList.add("hidden");

    updateChartBtn.addEventListener("click", function () {
        // Get selected options
        const selectedFoods = getSelectedFoods();

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
