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

        // Call a function to process or visualize the food data
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

        // Call a function to process or visualize the glucose data
        processGlucoseData(glucoseData);

    } catch (error) {
        console.error("Error loading Glucose CSV files:", error);
    }
}

// Example function to process or visualize food data
function processFoodData(data) {
    console.log("First 5 Food Rows:", data.slice(0, 5));
}

// Example function to process or visualize glucose data
function processGlucoseData(data) {
    console.log("First 5 Glucose Rows:", data.slice(0, 5));
}

// Load both CSV datasets separately
loadFoodCSV();
loadGlucoseCSV();
