document.addEventListener("DOMContentLoaded", function () {
    loadGlucoseData();
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

    const width = 800, height = 500, margin = { top: 40, right: 30, bottom: 80, left: 100 };
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
    const bars = svg.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.person))
        .attr("y", height - margin.bottom) // Start from bottom
        .attr("height", 0) // Start with no height
        .attr("width", x.bandwidth())
        .attr("fill", d3.color("steelblue"))
        .on("mouseover", function (event, d) {
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>${d.person}</strong><br>
                    🔽 Min Glucose: ${d.minGlucose} mg/dL<br>
                    🔼 Max Glucose: ${d.maxGlucose} mg/dL
                `);
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 20) + "px")
                   .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
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

    // **Add a Dynamic Title Indicating the Person's Data**
    svgContainer.append("h2")
        .attr("id", "chartTitle")
        .text(`Glucose Levels Over 24 Hours for Person ${personIndex + 1}`)
        .style("text-align", "center")
        .style("margin-bottom", "10px");

    const svg = svgContainer.append("svg")
        .attr("width", 800)
        .attr("height", 500);

    const width = 800, height = 500, margin = { top: 60, right: 50, bottom: 70, left: 80 };

    // Sort data to ensure correct ordering on the X-axis
    glucoseData.sort((a, b) => a.timestamp - b.timestamp);

    // Get the first timestamp as reference point
    const startTime = d3.min(glucoseData, d => d.timestamp);

    // Define X and Y scales
    const x = d3.scaleTime()
        .domain([startTime, d3.timeHour.offset(startTime, 24)]) // Ensure full 24-hour range
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(glucoseData, d => d.glucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    // **Highlight AM (Midnight - 11:59 AM) and PM (Noon - 11:59 PM)**
    svg.append("rect")
        .attr("x", x(d3.timeHour.offset(startTime, 0)))  // Midnight start
        .attr("y", margin.top)
        .attr("width", x(d3.timeHour.offset(startTime, 12)) - x(d3.timeHour.offset(startTime, 0))) // 12-hour width
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(135, 206, 250, 0.2)"); // Light blue for AM

    svg.append("rect")
        .attr("x", x(d3.timeHour.offset(startTime, 12))) // Noon start
        .attr("y", margin.top)
        .attr("width", x(d3.timeHour.offset(startTime, 24)) - x(d3.timeHour.offset(startTime, 12))) // 12-hour width
        .attr("height", height - margin.bottom - margin.top)
        .attr("fill", "rgba(255, 182, 193, 0.2)"); // Light pink for PM

    // Create the smoothed line generator
    const line = d3.line()
        .x(d => x(d.timestamp)) // Keep exact timestamp for plotting
        .y(d => y(d.glucose))
        .curve(d3.curveCatmullRom); // 🔄 **Smooths the line!**

    // Draw the line
    svg.append("path")
        .datum(glucoseData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // **Custom Function to Format X-Axis Labels**
    function customTimeFormat(d) {
        let hour = d3.timeFormat("%I")(d); // Get hour in 12-hour format (01-12)
        let suffix = ""; // Default: No AM/PM unless it's 12

        if (hour === "12") {
            suffix = d3.timeFormat(" %p")(d); // Only add AM/PM for 12 AM or 12 PM
        }

        return `${hour}${suffix}`;
    }

    // X-Axis (Convert to HH:00 Format, but Change `12` to AM/PM)
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeHour.every(1)) // 🔄 **Ensure X-axis is labeled in full hours**
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
        .text("Glucose Level (mg/dL)");

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
}



document.getElementById("resetButton").addEventListener("click", function () {
    console.log("🔄 Resetting to bar chart...");

    // 🔄 **Clear Everything Before Loading**
    d3.select("#chartContainer").html(""); // Remove old charts
    d3.select(".tooltip").remove(); // Remove tooltip if exists
    d3.select("#resetButton").style("display", "none"); // Hide reset button

    // 🔄 **Reload the Bar Chart**
    loadGlucoseData();
});
