
const foodFiles = Array.from({ length: 16 }, (_, i) => 
    `data/food/Food_Log_${String(i + 1).padStart(3, '0')}.csv`
);

console.log(foodFiles);


let combinedData = [];

// Function to load all CSV files asynchronously
async function loadAllCSV() {
    try {
        const filePromises = foodFiles.map(file => d3.csv(file));
        const results = await Promise.all(filePromises);

        results.forEach(data => {
            combinedData = combinedData.concat(data);
        });

        console.log("Combined CSV Data:", combinedData);

        // Call a function to process or visualize the data
        processData(combinedData);

    } catch (error) {
        console.error("Error loading CSV files:", error);
    }
}

// Example function to process or visualize data
function processData(data) {
    // Example: Log the first few rows
    console.log("First 5 rows:", data.slice(0, 5));

    // If you want to visualize the data with D3.js, you can do so here
}

// Call the function to load and merge all CSV files
loadAllCSV();
