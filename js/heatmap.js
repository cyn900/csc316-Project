/* * * * * * * * * * * * * *
*         HEATMAP          *
* * * * * * * * * * * * * */

// Set up margins, width, and height
const margin = { top: 50, right: 80, bottom: 50, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create main container with grid layout
const container = d3.select("#heatmap")
    .style("display", "grid")
    .style("grid-template-columns", "2fr 1fr")
    .style("gap", "4rem")
    .style("padding", "0 4rem")
    .style("background", "transparent");

// Create left section for text content
const leftSection = container.append("div")
    .attr("class", "heatmap-left-section");

// Add title box
leftSection.append("div")
    .attr("class", "heatmap-title-container")
    .append("h2")
    .attr("class", "heatmap-title")
    .text("Special Addition");

// Add descriptive text
leftSection.append("div")
    .attr("class", "heatmap-text-content")
    .html(`
        <p>The heatmap shows the relationship between weather conditions and squirrel activities.</p>
        <p>Key findings:</p>
        <ul>
            <li>Squirrels are most active during sunny weather</li>
            <li>Foraging is the most common activity across all weather conditions</li>
            <li>Activity levels decrease significantly during rainy conditions</li>
        </ul>
        <p>Interactive Elements: Hover over cells to see detailed counts. The color intensity indicates the frequency of observations.</p>
    `);

// Create right section for heatmap
const rightSection = container.append("div")
    .attr("class", "heatmap-right-section");

// Create SVG container inside right section
const svg = rightSection.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("width", "100%")
    .attr("height", "100%")
    .style("min-height", "800px")
    .style("background", "transparent")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .heatmap-title-container {
        background: #bf1b1b;
        padding: 1.5rem 2rem;
        margin-bottom: 3rem;
        text-align: center;
        width: 100%;
    }

    .heatmap-title {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: bold;
    }

    .heatmap-text-content {
        font-size: 1.2rem;
        line-height: 1.8;
        background: transparent;
    }

    .heatmap-text-content p {
        margin-bottom: 1.5rem;
    }

    .heatmap-text-content ul {
        margin: 1.5rem 0;
        padding-left: 2rem;
    }

    .heatmap-text-content li {
        margin-bottom: 1rem;
    }

    .heatmap-right-section {
        width: 100%;
        height: auto;
        min-height: 800px;
        background: transparent;
    }

    .axis-label {
        font-size: 14px;
    }

    .legend-tick {
        font-size: 12px;
    }

    svg {
        background: transparent !important;
    }
`;
document.head.appendChild(style);

// Load the data from the CSV files
Promise.all([
    d3.csv("data/individual.csv"),
    d3.csv("data/hectare.csv")
]).then(([individualData, hectareData]) => {
    // Define grouped weather categories
    const groupedWeather = {
        "Sunny/Clear": ["sunny", "clear"],
        "Foggy/Misty": ["foggy", "misty"],
        "Cloudy/Overcast": ["cloudy", "overcast", "partly cloudy"],
        "Rainy/Drizzle": ["light drizzle", "rainy"],
        "Windy": ["windy", "breezy"]
    };

    // Function to map a weather condition to its grouped category
    const getGroupedWeather = (weather) => {
        for (const [group, conditions] of Object.entries(groupedWeather)) {
            if (conditions.includes(weather.toLowerCase())) {
                return group;
            }
        }
        return null; // Skip if no match is found
    };

    // Define squirrel activities
    const activities = ['Running', 'Chasing', 'Climbing', 'Eating', 'Foraging'];

    // Process and aggregate the data
    const aggregatedData = {};

    individualData.forEach(individual => {
        const hectare = hectareData.find(h => h.Date === individual.Date && h.Hectare === individual.Hectare);
        if (hectare) {
            // Extract weather condition
            const weatherData = hectare["Sighter Observed Weather Data"];
            let weather = "";
            if (weatherData && typeof weatherData === "string") {
                const parts = weatherData.split(",");
                if (parts.length > 1) {
                    weather = parts.slice(1).join(",").trim(); // Extract everything after the first comma
                } else {
                    weather = weatherData.trim(); // Use the entire field if no comma is found
                }
            }

            // Map the weather condition to its grouped category
            const groupedWeatherCondition = getGroupedWeather(weather);

            // Skip if weather condition doesn't match any group
            if (!groupedWeatherCondition) return;

            // Process activities
            activities.forEach(activity => {
                if (individual[activity] === "TRUE") {
                    const key = `${groupedWeatherCondition}-${activity}`;
                    if (!aggregatedData[key]) {
                        aggregatedData[key] = 0;
                    }
                    aggregatedData[key]++;
                }
            });
        }
    });

    // Prepare the heatmap data
    const groupedWeatherConditions = Object.keys(groupedWeather);

    const heatmapData = activities.map((activity, activityIndex) => {
        return groupedWeatherConditions.map((weather, weatherIndex) => {
            const key = `${weather}-${activity}`;
            return {
                activity,
                weather,
                value: aggregatedData[key] || 0,
                x: weatherIndex,
                y: activityIndex
            };
        });
    }).flat(); // Flatten the 2D array into a 1D array

    // Create scales
    const xScale = d3.scaleBand()
        .domain(groupedWeatherConditions)
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(activities)
        .range([0, height])
        .padding(0.05);

    // We use non-linear scale for better color distinction
    const maxValue = d3.max(heatmapData.map(d => d.value));
    const colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([0, Math.pow(maxValue, 0.5)]); // Use a square root scale for better differentiation

    // Draw the heatmap
    svg.selectAll(".heatmap-cell")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.weather))
        .attr("y", d => yScale(d.activity))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(Math.pow(d.value, 0.5))) // Apply square root scaling
        .attr("class", "heatmap-cell")
        .append("title")
        .text(d => `${d.activity} (${d.weather}): ${d.value} squirrels`);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "axis-label");

    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("class", "axis-label");

    // Add axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Weather Conditions");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Activities");

    // Add color legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`); // Move legend further to the right

    // Create a scale for the legend
    const legendScale = d3.scaleLinear()
        .domain([0, Math.pow(maxValue, 0.5)]) // Match the color scale domain
        .range([height, 0]);

    // Add the legend axis
    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d => Math.round(Math.pow(d, 2)));

    legend.append("g")
        .attr("transform", `translate(20, 0)`) // Move axis to the right of the legend
        .call(legendAxis)
        .selectAll("text")
        .attr("class", "legend-tick");

    // Add the legend rectangles
    legend.selectAll("rect")
        .data(d3.range(0, Math.pow(maxValue, 0.5), 0.1))
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => legendScale(d))
        .attr("width", 20)
        .attr("height", 0.1 * (height / Math.pow(maxValue, 0.5)))
        .attr("fill", d => colorScale(d));
}).catch(error => {
    console.error("Error loading or processing data:", error);
});