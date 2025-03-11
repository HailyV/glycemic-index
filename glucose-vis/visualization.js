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

        // Replace bar chart with time series chart
        drawTimeSeriesChart(glucoseValues);
    }).catch(error => {
        console.error("❌ Error loading glucose file:", error);
    });
}
function drawTimeSeriesChart(glucoseData) {
    const svgContainer = d3.select("#chartContainer");
    svgContainer.html(""); // 🔄 Clear the previous chart

    // 🔄 **Remove Any Existing Tooltip from Bar Chart**
    d3.select(".tooltip").remove(); 

    d3.select("#resetButton").style("display", "block"); // Show the reset button

    const svg = svgContainer.append("svg")
        .attr("width", 800)
        .attr("height", 500);

    const width = 800, height = 500, margin = { top: 40, right: 30, bottom: 50, left: 70 };

    const x = d3.scaleTime()
        .domain(d3.extent(glucoseData, d => d.timestamp))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(glucoseData, d => d.glucose)]).nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.timestamp))
        .y(d => y(d.glucose))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(glucoseData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(d3.timeHour.every(1)).tickFormat(d3.timeFormat("%H:%M")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

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

    svg.selectAll("circle")
        .data(glucoseData)
        .enter().append("circle")
        .attr("cx", d => x(d.timestamp))
        .attr("cy", d => y(d.glucose))
        .attr("r", 4)
        .attr("fill", "red")
        .on("mouseover", function (event, d) {
            tooltip.style("visibility", "visible")
                .html(`<strong>${d.timestamp.toLocaleTimeString()}</strong><br>Glucose: ${d.glucose} mg/dL`);
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
