/* * * * * * * * * * * * * *
*        HEATMAP     *
* * * * * * * * * * * * * */

// Set up margins, width, and height
const margin = { top: 50, right: 100, bottom: 50, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// Create main container with grid layout
const container = d3.select("#heatmap")
    .style("display", "grid")
    .style("grid-template-columns", "1fr 1.2fr")
    .style("gap", "2rem")
    .style("padding", "2rem")
    .style("background", "transparent");

// Create left section for text content
const leftSection = container.append("div")
    .attr("class", "heatmap-left-section");

// Add title box
leftSection.append("div")
    .attr("class", "heatmap-title-container")
    .append("h2")
    .attr("class", "heatmap-title")
    .text("SPECIAL EDITION");

// Add question text
leftSection.append("div")
    .attr("class", "heatmap-question-container")
    .html(`
        <p class="question-part">should we be worried about</p>
        <h3 class="question-main">Weather</h3>
        <p </p>
        <p class="question-part">to spot our friends?</p>
    `);

// Add information display for interactive elements
const infoDisplay = leftSection.append("div")
    .attr("class", "heatmap-info-display")
    .html(`
        <p id="interaction-info">Click on cells to see how many squirrels were spotted!</p>
    `);

// Create right section for heatmap and tree image
const rightSection = container.append("div")
    .attr("class", "heatmap-right-section");

// Create SVG container inside right section
const svg = rightSection.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("width", "100%")
    .attr("height", "100%")
    .style("max-height", "600px")
    .style("background", "transparent")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add tree image as background decoration
rightSection.append("div")
    .attr("class", "tree-image")
    .style("position", "absolute")
    .style("right", "0")
    .style("bottom", "0")
    .style("z-index", "-1")
    .style("opacity", "0.8")
    .html(`<img src="/path/to/tree-silhouette.png" alt="Tree silhouette" />`);

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
@import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

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
        font-size: 36px;
        font-weight: bold;
        font-family: 'Arial', sans-serif;
        letter-spacing: 1px;
    }

    .heatmap-question-container {
        font-size: 1.5rem;
        line-height: 1.4;
        margin-top: 3rem;
        margin-bottom: 3rem;
        font-family: 'Amsterdam Four_ttf;
        max-width: 400px;
        text-align: center;
    }
    
    .heatmap-question-container p,
    .heatmap-question-container h3 {
        margin: 3rem 0; 
    }
    
    .question-part {
        font-size: 1.5rem;
        margin: 0.5rem 0;
        font-style: italic;
    }

    .question-emphasis {
        font-size: 2rem;
        margin: 0.5rem 0;
        font-weight: bold;
    }

    .question-main {
        font-size: 3.5rem;
        font-weight: bold;
        margin: 0.5rem 0;
        font-family: "Amsterdam Four_ttf";
    }

    .heatmap-info-display {
        border: 4
        px solid #bf1b1b;
        border-radius: 8px;
        padding: 1.5rem;
        background-color: rgba(243, 244, 246, 0.8);
        margin-top: 3rem;
        text-align: center;
    }

    #interaction-info {
        font-size: 1.2rem;
        margin: 0;
        line-height: 1.6;
        color: #333;
    }

    .heatmap-cell {
        stroke: #fff;
        stroke-width: 2px;
        transition: opacity 0.2s;
        cursor: pointer;
    }

    .heatmap-cell.active {
        stroke: #000;
        stroke-width: 4px;
    }

    .axis-label {
        font-size: 16px;
        font-weight: bold;
    }

    .axis-title {
        font-size: 18px;
        font-weight: bold;
    }

    .legend-tick {
        font-size: 14px;
    }

    svg {
        background: transparent !important;
    }
    
    .h3 {
    font-family: "Amsterdam Four_ttf";
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
        .padding(0.1);

    const yScale = d3.scaleBand()
        .domain(activities)
        .range([0, height])
        .padding(0.1);

    // Create a custom color scale using the specified colors
    const maxValue = d3.max(heatmapData.map(d => d.value));
    const colorScale = d3.scaleLinear()
        .domain([0, maxValue / 3, maxValue * 2/3, maxValue])
        .range(["#ffffff", "#76bb65", "#f59e0b", "#bf1b1b"])
        .clamp(true); // Prevents extrapolating colors beyond min/max

    // Store the currently selected cell
    let selectedCell = null;

    // Function to update the interaction info
    const updateInteractionInfo = (d) => {
        if (d) {
            const infoText = `When the weather is ${d.weather}, there are ${d.value} squirrels ${d.activity.toLowerCase()}.`;
            d3.select("#interaction-info").text(infoText);
        } else {
            d3.select("#interaction-info").text("Click on cells to see how many squirrels were spotted!");
        }
    };

    // Draw the heatmap
    svg.selectAll(".heatmap-cell")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.weather))
        .attr("y", d => yScale(d.activity))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.value))
        .attr("class", "heatmap-cell")
        .on("click", function(event, d) {
            // Remove active class from previously selected cell
            if (selectedCell) {
                d3.select(selectedCell).classed("active", false);
            }

            // If clicking on the same cell, deselect it
            if (this === selectedCell) {
                selectedCell = null;
                updateInteractionInfo(null);
            } else {
                // Select new cell
                selectedCell = this;
                d3.select(this).classed("active", true);
                updateInteractionInfo(d);
            }
        });

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("class", "axis-label")
        .style("text-anchor", "middle");

    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("class", "axis-label");

    // Add axis labels
    svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", `translate(${width / 2},${height + margin.bottom - 2})`)
        .style("text-anchor", "middle")
        .text("Weather Conditions");

    svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Activities");

    // Add color legend
    const legendWidth = 20;
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

    // Create a gradient for the legend
    const legendValues = Array.from({ length: 20 }, (_, i) => i * maxValue / 19);

    // Add the legend rectangles
    legend.selectAll("rect")
        .data(legendValues)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => height - (d / maxValue) * height)
        .attr("width", legendWidth)
        .attr("height", height / 20 + 1) // +1 to avoid gaps
        .attr("fill", d => colorScale(d));

    // Add legend axis
    const legendScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d => d);

    legend.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis)
        .selectAll("text")
        .attr("class", "legend-tick");

    // Add legend title
    legend.append("text")
        .attr("transform", `translate(${legendWidth / 2}, -10)`)
        .style("text-anchor", "middle")
        .text("Count");
}).catch(error => {
    console.error("Error loading or processing data:", error);
});