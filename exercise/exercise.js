import * as d3 from "d3";


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ exercise.js Loaded!");
    StackedAreaChart(); 
});

async function StackedAreaChart() {
  // Set dimensions
  const width = 800, height = 400, margin = { top: 20, right: 30, bottom: 50, left: 50 };

  // Sample data (Replace with real glucose + accelerometry data)
  const data = [
    { time: "2024-03-01T08:00:00", glucose: 95, activity: 0.1 },
    { time: "2024-03-01T09:00:00", glucose: 110, activity: 0.5 },
    { time: "2024-03-01T10:00:00", glucose: 120, activity: 0.7 },
    { time: "2024-03-01T11:00:00", glucose: 105, activity: 0.3 },
    { time: "2024-03-01T12:00:00", glucose: 98, activity: 0.1 },
  ];

  // Parse date
  const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");
  data.forEach(d => d.time = parseTime(d.time));

  // Scales
  const x = d3.scaleTime().domain(d3.extent(data, d => d.time)).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => Math.max(d.glucose, d.activity * 150))]).nice().range([height - margin.bottom, margin.top]);

  // Line generators
  const lineGlucose = d3.line().x(d => x(d.time)).y(d => y(d.glucose)).curve(d3.curveBasis);
  const lineActivity = d3.area().x(d => x(d.time)).y0(y(0)).y1(d => y(d.activity * 150)).curve(d3.curveBasis);

  return (
    <svg width={width} height={height}>
      {/* X Axis */}
      <g transform={`translate(0,${height - margin.bottom})`} ref={node => d3.select(node).call(d3.axisBottom(x))} />
      {/* Y Axis */}
      <g transform={`translate(${margin.left},0)`} ref={node => d3.select(node).call(d3.axisLeft(y))} />
      
      {/* Activity Area */}
      <path d={lineActivity(data)} fill="steelblue" opacity={0.4} />
      
      {/* Glucose Line */}
      <path d={lineGlucose(data)} fill="none" stroke="red" strokeWidth={2} />

      {/* Labels */}
      <text x={width / 2} y={height - 10} textAnchor="middle">Time</text>
      <text x={-height / 2} y={15} transform="rotate(-90)" textAnchor="middle">Glucose & Activity Level</text>
    </svg>
  );
}