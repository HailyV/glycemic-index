
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
        `../data/glucose/Dexcom_${String(i + 1).padStart(3, '0')}.csv`
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
    const svgContainer = d3.select("#chartContainer");
    svgContainer.html(""); // 🔄 **Fully clear the previous chart**

    d3.select("#resetButton").style("display", "none"); // Hide reset button

    const svg = svgContainer.append("svg")
        .attr("width", 800)
        .attr("height", 500);

    const width = 800, height = 500, margin = { top: 40, right: 50, bottom: 70, left: 80 };
    const averageGlucoseTarget = 100;

    const x = d3.scaleBand()
        .domain(data.map(d => d.person))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avgGlucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    // 📌 Create Tooltip
    const tooltip = d3.select("body").append("div")
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
        
    // Draw Bars with Initial Height = 0
        // Draw Bars with Initial Height = 0
    const bars = svg.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", d => x(d.person))
    .attr("y", height - margin.bottom) // Start from bottom
    .attr("height", 0) // Start with no height
    .attr("width", x.bandwidth())
    .attr("fill", d3.color("steelblue"))
    .style("cursor", "pointer") // 🖱️ Change cursor to pointer
    .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "orange"); // 🎨 Change bar color to orange on hover
        tooltip.style("visibility", "visible")
            .html(`
                <strong>${d.person}</strong><br>
                🔽 Min Glucose: ${d.minGlucose} mg/dL<br>
                🔼 Max Glucose: ${d.maxGlucose} mg/dL
            `);
    })
    .on("mousemove", function (event) {
        tooltip.style("top", (event.pageY - 65) + "px") // Tooltip above cursor
            .style("left", (event.pageX + 10) + "px"); // Tooltip to right of cursor
    })
    .on("mouseout", function () {
        d3.select(this).attr("fill", "steelblue"); // 🔄 Reset bar color
        tooltip.style("visibility", "hidden");
    })
    .on("click", function (event, d) {  // 🔄 Click replaces chart with time series
        const personIndex = data.findIndex(person => person.person === d.person);
        console.log(`🔍 Fetching time series for ${d.person} (Index ${personIndex})`);

        if (personIndex === -1) {
            console.error(`❌ Invalid person index: ${personIndex}`);
            return;
        }

        loadGlucoseForPerson(personIndex);
    });

    // 🚀 Animate Bars from Bottom to Correct Height
    bars.transition()
    .duration(800) // Moderate pace
    .delay((d, i) => i * 100) // Staggered delay for left-to-right effect
    .attr("y", d => y(d.avgGlucose)) // Move up
    .attr("height", d => height - margin.bottom - y(d.avgGlucose));


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
        .attr("y", height + 5) // Adjusted for spacing
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
}
function loadGlucoseForPerson(personIndex) {
    if (isNaN(personIndex) || personIndex < 0 || personIndex >= 16) {
        console.error(`❌ Invalid person index: ${personIndex}`);
        return;
    }

    const filePath = `../data/glucose/Dexcom_${String(personIndex + 1).padStart(3, '0')}.csv`;

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
    const svgContainer = d3.select("#chartContainer");
    svgContainer.html(""); // 🔄 Clear the previous chart

    // 🔄 **Remove Any Existing Tooltip from Bar Chart**
    d3.select(".tooltip").remove(); 

    d3.select("#resetButton").style("display", "block"); // Show the reset button

    const width = 800, height = 500, margin = { top: 60, right: 50, bottom: 70, left: 80 };

    const svg = svgContainer.append("svg")
        .attr("width", width)
        .attr("height", height);

    // **✅ Corrected Title Placement (Inside SVG)**
    svg.append("text")
        .attr("x", width / 2)   // Center the title
        .attr("y", margin.top / 2)   // Place it within the margin area
        .attr("text-anchor", "middle")   // Ensure centered alignment
        .style("font-size", "16px")
        .text(`Average Glucose Levels Per Hour for Person ${personIndex + 1}`);

    // **Step 1: Compute Hourly Averages from `glucoseData`**
    let hourlyAverages = {};
    
    glucoseData.forEach(d => {
        let date = new Date(d.timestamp);
        let hour = date.getHours(); // Extract hour (0 - 23)

        if (!hourlyAverages[hour]) {
            hourlyAverages[hour] = { sum: 0, count: 0 };
        }
        hourlyAverages[hour].sum += d.glucose;
        hourlyAverages[hour].count += 1;
    });

    // Convert averages into an array
    const averagedData = Object.keys(hourlyAverages).map(hour => ({
        hour: +hour,
        glucose: hourlyAverages[hour].sum / hourlyAverages[hour].count // Average glucose per hour
    }));

    console.log("✅ Computed Hourly Averages:", averagedData);

    // Define X and Y scales
    const x = d3.scaleLinear()
        .domain([0, 23]) // Use 24-hour format for proper alignment
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(averagedData, d => d.glucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    // **Highlight AM (Midnight - 11:59 AM) and PM (Noon - 11:59 PM)**
    svg.append("rect")
        .attr("x", x(0))  // Midnight start
        .attr("y", margin.top)
        .attr("width", x(12) - x(0)) // 12-hour width
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(135, 206, 250, 0.2)"); // Light blue for AM

    svg.append("rect")
        .attr("x", x(12)) // Noon start
        .attr("y", margin.top)
        .attr("width", x(24) - x(12)) // 12-hour width
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(255, 182, 193, 0.2)"); // Light pink for PM

    // **Step 2: Create Line Chart with Averages**
    const line = d3.line()
        .x(d => x(d.hour)) // Align with hourly intervals
        .y(d => y(d.glucose))
        .curve(d3.curveMonotoneX); // Smooth interpolation

    // Draw the line
    svg.append("path")
        .datum(averagedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // **Custom Function to Format X-Axis Labels**
    function customTimeFormat(hour) {
        let period = hour >= 12 ? "PM" : "AM";
        let formattedHour = hour % 12 || 12; // Convert 24-hour format to 12-hour (12 stays 12)
        return `${formattedHour}${period}`;
    }

    // X-Axis (Ensure Proper Alignment)
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .ticks(24) // 🔄 **Force 1-24 interval alignment**
            .tickFormat(customTimeFormat) // ✅ Custom function for formatting
        )
        .selectAll("text")
        .style("text-anchor", "middle");

    // Y-Axis (Glucose Levels)
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // **X-Axis Label**
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Time of Day");

    // **Y-Axis Label**
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .text("Average Glucose Level (mg/dL)");

    // **Tooltip for Glucose Points**
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("border", "1px solid #ccc")
        .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("font-size", "12px");

    // **Scatter Plot Points (Transparent Steel Blue)**
    svg.selectAll("circle")
        .data(averagedData)
        .enter().append("circle")
        .attr("cx", d => x(d.hour)) // Align exactly to hours
        .attr("cy", d => y(d.glucose))
        .attr("r", 6) // Slightly larger for visibility
        .attr("fill", "rgba(70, 130, 180, 0.7)") // More visible steel blue
        .on("mouseover", function (event, d) {
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

        const legendWidth = 120;
        const legendHeight = 60;
    
        const legend = svg.append("g")
            .attr("transform", `translate(${width - margin.right - legendWidth}, ${margin.top})`);
    
        // **Add White Background Behind the Legend**
        legend.append("rect")
            .attr("x", -10)
            .attr("y", -5)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("fill", "white")
            .attr("stroke", "black") // Optional: add border
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5)
            .style("opacity", 0.8); // Slight transparency if needed
    // Day Legend (Blue)
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

    // Night Legend (Red)
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