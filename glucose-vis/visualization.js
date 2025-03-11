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

            // Extract and clean glucose values
            const glucoseValues = filteredData
                .map(d => parseFloat(d["Glucose Value (mg/dL)"] || d["Glucose Value"])) // Adjust for correct column name
                .filter(v => !isNaN(v)); // Remove NaN values

            // Calculate average glucose level for the person
            if (glucoseValues.length > 0) {
                const averageGlucose = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;
                personGlucoseData.push({
                    person: `Person ${index + 1}`,
                    avgGlucose: averageGlucose
                });
            } else {
                console.warn(`⚠️ No valid glucose data found for Person ${index + 1}`);
                personGlucoseData.push({
                    person: `Person ${index + 1}`,
                    avgGlucose: 0 // Default to 0 if no valid data
                });
            }
        });

        console.log("✅ Processed Glucose Data for Bar Chart:", personGlucoseData);

        // Draw Bar Chart with the processed data
        drawGlucoseBarChart(personGlucoseData);

    } catch (error) {
        console.error("❌ Error loading Glucose CSV files:", error);
    }
}

function drawGlucoseBarChart(data) {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const margin = { top: 40, right: 30, bottom: 50, left: 70 };
    const averageGlucoseTarget = 100; // The reference line value

    const x = d3.scaleBand()
        .domain(data.map(d => d.person))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avgGlucose)]).nice()
        .range([height - margin.bottom, margin.top]);


    // Draw Bars with Initial Height = 0
    const bars = svg.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.person))
        .attr("y", height - margin.bottom) // Start from bottom
        .attr("height", 0) // Start with no height
        .attr("width", x.bandwidth())
        .attr("fill", d3.color("steelblue"));

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

