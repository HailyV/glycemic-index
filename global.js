// Generate file paths for food logs
const foodFiles = Array.from({ length: 16 }, (_, i) =>
    `data/food/Food_Log_${String(i + 1).padStart(3, '0')}.csv`
);

// Generate file paths for glucose logs
const glucoseFiles = Array.from({ length: 16 }, (_, i) =>
    `data/glucose/Dexcom_${String(i + 1).padStart(3, '0')}.csv`
);

console.log("Food Files:", foodFiles);
console.log("Glucose Files:", glucoseFiles);

let foodData = [];
let glucoseData = [];

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

        // Example: call a function to process or visualize the food data
        processFoodData(foodData);

    } catch (error) {
        console.error("Error loading Food CSV files:", error);
    }
}

// Function to load glucose CSV files asynchronously
async function loadGlucoseCSV() {
    try {
        const filePromises = glucoseFiles.map(file => d3.csv(file));
        const results = await Promise.all(filePromises);

        // Combine all glucose CSV data
        results.forEach(data => {
            glucoseData = glucoseData.concat(data);
        });

        console.log("Combined Glucose Data:", glucoseData);

        // Example: call a function to process or visualize the glucose data
        processGlucoseData(glucoseData);

    } catch (error) {
        console.error("Error loading Glucose CSV files:", error);
    }
}

// Function to calculate average values for each unique food
function calculateFoodAverages(data) {
    let foodTotals = {};
    let foodCounts = {};

    data.forEach(entry => {
        const foodName = entry["Food"] || "Unknown";
        const value = parseFloat(entry["Value"]);  // Adjust column name as needed

        if (!isNaN(value)) {
            if (!foodTotals[foodName]) {
                foodTotals[foodName] = 0;
                foodCounts[foodName] = 0;
            }
            foodTotals[foodName] += value;
            foodCounts[foodName] += 1;
        }
    });

    // Calculate averages
    let avgData = Object.keys(foodTotals).map(food => ({
        name: food,
        avgValue: foodTotals[food] / foodCounts[food]
    }));

    return avgData;
}

// Load both CSV datasets
loadFoodCSV();
loadGlucoseCSV();

// --------------- PIE CHART LOGIC ---------------

function drawPieChartForSelectedFoods(selectedFoods) {
    // Remove any existing chart
    d3.select("#pieChart").selectAll("svg").remove();

    // 1. Filter data by selected foods (matching "logged_food")
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
    const chartData = Object.values(foodStatsMap).map(item => {
        // Compute averages
        const avgCalorie = item.sumCalorie / item.count;
        const avgFat = item.sumFat / item.count;
        const avgCarb = item.sumCarb / item.count;
        const avgSugar = item.sumSugar / item.count;
        const avgProtein = item.sumProtein / item.count;

        return {
            food: item.food,
            // We'll store the average calorie in `.calorie`,
            // since the pie layout uses d.calorie for sizing each slice
            calorie: avgCalorie,
            total_fat: avgFat,
            total_carb: avgCarb,
            sugar: avgSugar,
            protein: avgProtein
        };
    });

    // If there's nothing to show, return early
    if (!chartData.length) return;

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

    // Create the pie layout, using the average calorie for each food
    const pie = d3.pie()
        .value(d => d.calorie);

    // Arc generator
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Bind data
    const arcs = svg.selectAll(".arc")
        .data(pie(chartData))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Reference to tooltip div
    const tooltip = d3.select("#tooltip");

    // Draw the slices
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.food))
        .on("mouseover", (event, d) => {
            // Show tooltip and set its HTML to show the *average* of each field
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.data.food}</strong><br/>
                    Avg Calories: ${d.data.calorie.toFixed(1)}<br/>
                    Avg Fat: ${d.data.total_fat.toFixed(1)} g<br/>
                    Avg Carbs: ${d.data.total_carb.toFixed(1)} g<br/>
                    Avg Sugar: ${d.data.sugar.toFixed(1)} g<br/>
                    Avg Protein: ${d.data.protein.toFixed(1)} g
                `);
        })
        .on("mousemove", (event) => {
            // Position the tooltip near the mouse
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseleave", () => {
            // Hide tooltip
            tooltip.style("opacity", 0);
        });

    // Optional: add labels inside the slices
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.data.food);
}


// Listen for button click to update pie chart
document.addEventListener("DOMContentLoaded", function() {
    const updateChartBtn = document.getElementById("updateChartBtn");
    const multiFoodSelect = document.getElementById("multiFoodSelect");

    updateChartBtn.addEventListener("click", function() {
        // Grab selected options (up to 5)
        const selectedOptions = Array.from(multiFoodSelect.selectedOptions)
                                     .map(opt => opt.value)
                                     .slice(0, 5);

        // Draw the pie chart
        drawPieChartForSelectedFoods(selectedOptions);
    });
});
