(function() {
    // Set up color
    const colors = {
        primary: "#000000",
        bars: "#bf1b1b", // Changed from #8B4513 to #bf1b1b
        barsHover: "#a01616", // Slightly darker shade for hover
        text: "#333333"
    };

    // Create main container
    const mainContainer = d3.select("#barchart")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("gap", "2rem");

    // Create header section
    const header = mainContainer.append("header")
        .attr("class", "barchart-header-section");

    header.append("h1")
        .attr("class", "barchart-main-title")
        .text("HOW DO SQUIRRELS BEHAVE?");

    // Create content grid container
    const contentGrid = mainContainer.append("div")
        .attr("class", "barchart-content-grid");

    // Create filter section at the top
    const filterSection = contentGrid.append("div")
        .attr("class", "barchart-filter-section");

    // Move filter container creation into filter section
    const filterContainer = filterSection.append("div")
        .attr("class", "barchart-filter-container");

    // Add filter groups with headers
    const filterGroups = [
        {
            title: "Age",
            type: "age",
            options: [
                {value: "Adult", label: "Adult"},
                {value: "Juvenile", label: "Juvenile"}
            ]
        },
        {
            title: "Color",
            type: "color",
            options: [
                {value: "Black", label: "Black"},
                {value: "Gray", label: "Gray"},
                {value: "Cinnamon", label: "Cinnamon"}
            ]
        },
        {
            title: "Time",
            type: "shift",
            options: [
                {value: "AM", label: "AM"},
                {value: "PM", label: "PM"}
            ]
        },
        {
            title: "Location",
            type: "location",
            options: [
                {value: "Ground Plane", label: "Ground"},
                {value: "Above Ground", label: "Above"}
            ]
        }
    ];

    // Create filter groups with an "All" button
    filterGroups.forEach(group => {
        const groupContainer = filterContainer
            .append("div")
            .attr("class", "barchart-filter-group");

        groupContainer
            .append("h3")
            .attr("class", "barchart-filter-title")
            .text(group.title);

        const buttonContainer = groupContainer
            .append("div")
            .attr("class", "barchart-button-container");

        // Append "All" button as the first option (active by default)
        buttonContainer
            .append("button")
            .attr("class", "barchart-filter-btn active")
            .attr("data-type", group.type)
            .attr("data-value", "All")
            .text("All");

        // Append individual options (not active initially)
        group.options.forEach(option => {
            buttonContainer
                .append("button")
                .attr("class", "barchart-filter-btn")
                .attr("data-type", group.type)
                .attr("data-value", option.value)
                .text(option.label);
        });
    });

    // Create visualization container
    const visualizationContainer = contentGrid.append("div")
        .attr("class", "barchart-visualization-container");

    // Create chart section
    const chartSection = visualizationContainer.append("div")
        .attr("class", "barchart-chart-section");

    // Set up chart dimensions
    const margin = {top: 40, right: 20, bottom: 120, left: 80};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG container inside chart section
    const svg = chartSection
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("min-width", "600px") // Ensure minimum width
        .style("min-height", "400px"); // Ensure minimum height

    // Make sure the g element is created after the background rect
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart title
    g.append("text")
        .attr("class", "barchart-chart-subtitle")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Observed Behaviors");

    // Create image section
    const imageSection = visualizationContainer.append("div")
        .attr("class", "barchart-image-section");

    imageSection.append("p")
        .attr("class", "barchart-interaction-text")
        .text("This is an interactive chart showing how different factors influence squirrel behavior! Try selecting an age group, color, time of day, or location, and then click to see how squirrel activities change. Hover over the bars to get detailed counts and behaviors. See what insights you can uncover about squirrel life!");

    imageSection.append("div")
        .attr("class", "barchart-squirrel-container")
        .html(`
            <img src="img/Squirrel.png" alt="Decorative squirrel illustration" class="barchart-squirrel-image">
        `);

    // Create tooltip - Move this to the top level, outside of any function
    const tooltip = d3.select("body")  // Attach to body instead of #barchart
        .append("div")
        .attr("class", "barchart-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(255, 255, 255, 0.95)")
        .style("padding", "12px")
        .style("border", "2px solid #bf1b1b")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
        .style("min-width", "200px")
        .style("z-index", "1000");

    // Initialize current filters
    let currentFilters = {
        age: ["All"],
        color: ["All"],
        shift: ["All"],
        location: ["All"]
    };

    // Function to update the chart
    function updateChart(data) {
        // Filter data based on current selections
        const filteredData = data.filter(d =>
            ((currentFilters.age.includes("All")) || currentFilters.age.includes(d.Age)) &&
            ((currentFilters.color.includes("All")) || currentFilters.color.includes(d['Primary Fur Color'])) &&
            ((currentFilters.shift.includes("All")) || currentFilters.shift.includes(d.Shift)) &&
            ((currentFilters.location.includes("All")) || currentFilters.location.includes(d.Location))
        );

        // Count activities and additional behaviors
        const activities = [
            {name: "Running", count: filteredData.filter(d => d.Running === "TRUE").length},
            {name: "Chasing", count: filteredData.filter(d => d.Chasing === "TRUE").length},
            {name: "Climbing", count: filteredData.filter(d => d.Climbing === "TRUE").length},
            {name: "Eating", count: filteredData.filter(d => d.Eating === "TRUE").length},
            {name: "Foraging", count: filteredData.filter(d => d.Foraging === "TRUE").length},
            {name: "Kuks", count: filteredData.filter(d => d.Kuks === "TRUE").length},
            {name: "Quaas", count: filteredData.filter(d => d.Quaas === "TRUE").length},
            {name: "Tail flags", count: filteredData.filter(d => d['Tail flags'] === "TRUE").length},
            {name: "Tail twitches", count: filteredData.filter(d => d['Tail twitches'] === "TRUE").length}
        ].sort((a, b) => b.count - a.count);

        // Update scales
        const xScale = d3.scaleBand()
            .domain(activities.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(activities, d => d.count)])
            .range([height, 0]);

        // Update axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.selectAll(".barchart-x-axis").remove();
        g.selectAll(".barchart-y-axis").remove();

        g.append("g")
            .attr("class", "barchart-x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("dx", "-.8em")
            .attr("dy", ".5em");

        g.append("g")
            .attr("class", "barchart-y-axis")
            .call(yAxis.ticks(5).tickSize(-width));

        // Update bars
        const bars = g.selectAll(".barchart-bar")
            .data(activities);

        bars.exit().remove();

        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "barchart-bar");

        // Merge and update all bars
        const allBars = bars.merge(barsEnter)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.name))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.count))
            .attr("fill", colors.bars);

        // Add event listeners to all bars - use on() directly on the selection, not after transition
        g.selectAll(".barchart-bar").each(function(d) {
            const bar = d3.select(this);
            bar.on("mouseover", function(event) {
                const total = filteredData.length;
                const count = d.count;
                const percentage = ((count / total) * 100).toFixed(1);
                
                // Get current filter states for context
                const activeFilters = {
                    Age: currentFilters.age.includes("All") ? "All" : currentFilters.age.join(", "),
                    Color: currentFilters.color.includes("All") ? "All" : currentFilters.color.join(", "),
                    Time: currentFilters.shift.includes("All") ? "All" : currentFilters.shift.join(", "),
                    Location: currentFilters.location.includes("All") ? "All" : currentFilters.location.join(", ")
                };

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <div style="font-weight: bold; font-size: 16px; color: #bf1b1b; margin-bottom: 8px; border-bottom: 1px solid rgba(191, 27, 27, 0.2); padding-bottom: 4px;">${d.name}</div>
                    <div style="color: #333; line-height: 1.4;">
                        <div>Count: ${count}</div>
                        <div>Percentage: ${percentage}%</div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 12px;">
                            <div style="font-weight: bold; margin-bottom: 4px;">Filters Applied:</div>
                            <div>Age: ${activeFilters.Age}</div>
                            <div>Color: ${activeFilters.Color}</div>
                            <div>Time: ${activeFilters.Time}</div>
                            <div>Location: ${activeFilters.Location}</div>
                        </div>
                    </div>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", colors.barsHover);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", colors.bars);
            });
        });
    }

    // Load data and initialize chart
    d3.csv("data/individual.csv").then(function(data) {
        // Add click handlers to filter buttons
        d3.selectAll(".barchart-filter-btn").on("click", function() {
            const button = d3.select(this);
            const filterType = button.attr("data-type");
            const filterValue = button.attr("data-value");

            if (filterValue === "All") {
                // When "All" is clicked: deselect all other buttons in this group and select only "All"
                d3.selectAll(`.barchart-filter-btn[data-type="${filterType}"]`)
                    .classed("active", false);
                button.classed("active", true);
                currentFilters[filterType] = ["All"];
            } else {
                // When a non-"All" button is clicked: deselect the "All" button in this group
                d3.selectAll(`.barchart-filter-btn[data-type="${filterType}"][data-value="All"]`)
                    .classed("active", false);

                // Toggle the clicked button
                button.classed("active", !button.classed("active"));

                // Get current active selections for this group
                let activeButtons = d3.selectAll(`.barchart-filter-btn[data-type="${filterType}"].active`)
                    .nodes()
                    .map(n => n.getAttribute("data-value"));

                // If no button is active, reselect the clicked one
                if (activeButtons.length === 0) {
                    button.classed("active", true);
                    activeButtons.push(filterValue);
                }
                currentFilters[filterType] = activeButtons;
            }

            // Update chart with new filter settings
            updateChart(data);
        });

        // Initial chart render
        updateChart(data);
    });

    // Update CSS styles
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.cdnfonts.com/css/cocogoose');

        #barchart {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            background: transparent;
        }

        .barchart-header-section {
            text-align: center;
            margin-bottom: 1rem;
        }

        .barchart-main-title {
            color: #000;
            font-family: 'COCOGOOSE', sans-serif;
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0;
            padding-bottom: 1rem;
            border-bottom: 2px solid #000;
        }

        .barchart-content-grid {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .barchart-filter-section {
            width: 100%;
        }

        .barchart-filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
        }

        .barchart-visualization-container {
            display: grid;
            grid-template-columns: 7fr 3fr;
            gap: 2rem;
            align-items: start;
            width: 100%;
        }

        .barchart-chart-section {
            width: 100%;
            min-width: 600px;
            padding: 30px;
            margin-bottom: 20px;
            overflow: visible;
            background: transparent;
        }

        .barchart-chart-section svg {
            display: block;
            width: 100%;
            height: auto;
            overflow: visible;
            background: transparent;
        }

        .barchart-chart-subtitle {
            font-size: 16px;
            font-weight: normal;
        }

        .barchart-image-section {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .barchart-interaction-text {
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 0;
        }

        .barchart-squirrel-container {
            position: relative;
        }


        .barchart-squirrel-image {
            width: 100%;
            height: auto;
            display: block;
        }

        .barchart-squirrel-caption {
            margin: 0.5rem 0 0 0;
            font-size: 0.9rem;
        }

        .barchart-x-axis path, .barchart-y-axis path {
            stroke: rgba(0, 0, 0, 0.2);
            stroke-width: 1px;
        }
        
        .barchart-x-axis line, .barchart-y-axis line {
            stroke: #e0e0e0;
            stroke-width: 1px;
            stroke-dasharray: 2,2;
        }
        
        .barchart-x-axis text {
            font-size: 12px;
            transform: rotate(-45deg);
            text-anchor: end;
        }

        .barchart-y-axis text {
            font-size: 12px;
        }

        .barchart-tooltip {
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px;
            border: 2px solid #bf1b1b;
            border-radius: 6px;
            pointer-events: none;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            min-width: 200px;
            z-index: 1000;
        }

        .tooltip-header {
            font-weight: bold;
            font-size: 16px;
            color: #bf1b1b;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(191, 27, 27, 0.2);
            padding-bottom: 4px;
        }

        .tooltip-content {
            color: #333;
            line-height: 1.4;
        }

        .tooltip-filters {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(0,0,0,0.1);
            font-size: 12px;
        }

        .tooltip-filters > div:first-child {
            font-weight: bold;
            margin-bottom: 4px;
        }

        @media (max-width: 1024px) {
            .barchart-visualization-container {
                grid-template-columns: 1fr;
            }
        }

        .barchart-filter-btn {
            padding: 6px 10px;
            border: 1px solid #000000; /* Black border */
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #000000; /* Default black background */
            color: white;
            font-size: 0.9em;
        }

        .barchart-filter-btn:hover {
            background-color: #333333; /* Slightly lighter black on hover */
            border-color: #555555;
        }
        
        .barchart-filter-btn.active {
            background-color: #76bb65; /* Green when selected */
            color: white;
            border-color: #5a9b50; /* Slightly darker green border */
        }

        .barchart-filter-btn:not(.active) {
            opacity: 1;
        }

        .barchart-button-container {
            display: flex;
            gap: 1rem;
        }

        .barchart-bar {
            transition: fill 0.2s;
        }

        .barchart-y-axis .tick line {
            stroke: rgba(0, 0, 0, 0.1);
            stroke-width: 1px;
            stroke-dasharray: 2,2;
        }

        .barchart-x-axis path.domain {
            stroke: #ccc;
            stroke-width: 1px;
        }

        .barchart-y-axis path.domain {
            stroke: #ccc;
            stroke-width: 1px;
        }
    `;
    document.head.appendChild(style);

    // Create left section for text content
    const leftSection = mainContainer.append("div")
        .attr("class", "barchart-side-section");

    leftSection.append("div")
        .attr("class", "info-box")
        .html(`
            <h3>Fun Facts:</h3>
            <p>A group of squirrels is called a dray or a scurry. They are very territorial and will fight to the death to defend their area.</p>
            <p>Squirrels can find food buried beneath a foot of snow and can detect food that's been buried for up to 9 months.</p>
            <p>They plant thousands of trees each year by forgetting where they buried their nuts!</p>
        `);
})();