document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ heartrate.js Loaded!");

  // ✅ Load HR Data for First 5 People
  const heartrateData = await loadHeartrateData();
  console.log("✅ Heart Rate Data Loaded:", heartrateData);

  // ✅ Draw Initial Chart (All Data)
  drawHeartRateChart(heartrateData);

  // ✅ Setup Interactive Filtering
  setupFilters(heartrateData);
});

async function loadHeartrateData() {
  const heartrateFiles = Array.from({ length: 5 }, (_, i) =>
      `../data/heartrate/HR_${String(i + 1).padStart(3, '0')}.csv`
  );

  try {
      const filePromises = heartrateFiles.map((file, index) =>
          d3.csv(file, d => {
              let timestamp = Date.parse(d.datetime.trim());
              let value = parseFloat(d.hr.trim().replace(/,/g, ""));
              return !isNaN(timestamp) && !isNaN(value) ? { timestamp, heartrate: value, person: `Person ${index + 1}` } : null;
          })
      );

      const results = await Promise.all(filePromises);
      let allHeartrateData = results.flat().filter(d => d !== null);

      console.log("✅ Sample HR Data:", allHeartrateData.slice(0, 5));
      return allHeartrateData;

  } catch (error) {
      console.error("❌ Error loading Heartrate CSV files:", error);
      return [];
  }
}

function drawHeartRateChart(data) {
  const width = 800, height = 500, margin = { top: 50, right: 20, bottom: 50, left: 50 };

  const svg = d3.select("#chartContainer svg").html("").attr("width", width).attr("height", height);

  const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp))
      .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.heartrate)]).nice()
      .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(data.map(d => d.person)), "Average"]);

  const line = d3.line()
      .x(d => x(d.timestamp))
      .y(d => y(d.heartrate))
      .curve(d3.curveMonotoneX);

  const groupedData = d3.groups(data, d => d.person);

  svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x));
  svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

  const personLines = svg.append("g").attr("id", "lines");

  groupedData.forEach(([person, values]) => {
      personLines.append("path")
          .datum(values)
          .attr("fill", "none")
          .attr("stroke", color(person))
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("class", `line person-${person.replace(/\s/g, "-")}`);
  });

  // Average Line
  const avgData = calculateAverageHR(data);
  personLines.append("path")
      .datum(avgData)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", line)
      .attr("class", "line average-line")
      .style("display", "none");

  // Tooltip
  const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("visibility", "hidden");
  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.timestamp))
      .attr("cy", d => y(d.heartrate))
      .attr("r", 3)
      .attr("fill", d => color(d.person))
      .attr("class", d => `dot person-${d.person.replace(/\s/g, "-")}`)
      .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
              .html(`<strong>${d.person}</strong><br>HR: ${d.heartrate}<br>${new Date(d.timestamp).toLocaleTimeString()}`)
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
}

function calculateAverageHR(data) {
  const timeMap = new Map();
  data.forEach(d => {
      if (!timeMap.has(d.timestamp)) {
          timeMap.set(d.timestamp, { timestamp: d.timestamp, heartrate: 0, count: 0 });
      }
      let entry = timeMap.get(d.timestamp);
      entry.heartrate += d.heartrate;
      entry.count += 1;
  });
  return Array.from(timeMap.values()).map(d => ({ timestamp: d.timestamp, heartrate: d.heartrate / d.count, person: "Average" }));
}

function setupFilters(data) {
  const filterContainer = d3.select("#filters");
  const persons = [...new Set(data.map(d => d.person))];

  persons.forEach(person => {
      filterContainer.append("label")
          .html(`<input type="checkbox" checked data-person="${person}" class="filter-checkbox"> ${person}`)
          .style("margin-right", "10px");
  });

  filterContainer.append("label")
      .html(`<input type="checkbox" data-person="Average" class="filter-checkbox"> Average HR`)
      .style("margin-right", "10px");

  d3.selectAll(".filter-checkbox").on("change", function () {
      let person = this.dataset.person.replace(/\s/g, "-");
      let checked = this.checked;
      d3.selectAll(`.line.person-${person}, .dot.person-${person}`).style("display", checked ? "inline" : "none");
  });
}
