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
        .text("FIRST TITLE WOULD BE");

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

    // Create filter groups
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

        group.options.forEach(option => {
            buttonContainer
                .append("button")
                .attr("class", "barchart-filter-btn active")
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
        .text("Interactive Elements: Filter by age (adult/juvenile), color (black/gray/cinnamon/etc), time (am/pm) adn location (ground/above) to see how different factors affect the count. Tooltip showing the detailed information.");

    imageSection.append("div")
        .attr("class", "barchart-squirrel-container")
        .html(`
            <img src="img/Squirrel.png" alt="Decorative squirrel illustration" class="barchart-squirrel-image">
        `);

    // Create tooltip
    const tooltip = d3.select("#barchart")
        .append("div")
        .attr("class", "barchart-tooltip")
        .style("opacity", 0);

    // Initialize current filters
    let currentFilters = {
        age: ["Adult", "Juvenile"],
        color: ["Black", "Gray", "Cinnamon"],
        shift: ["AM", "PM"],
        location: ["Ground Plane", "Above Ground"]
    };

    // Function to update the chart
    function updateChart(data) {
        // Filter data based on current selections
        const filteredData = data.filter(d => 
            (d.Age === "" || currentFilters.age.includes(d.Age)) &&
            currentFilters.color.includes(d['Primary Fur Color']) &&
            currentFilters.shift.includes(d.Shift) &&
            (d.Location === "" || currentFilters.location.includes(d.Location))
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

        bars.merge(barsEnter)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.name))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.count))
            .attr("fill", colors.bars);

        // Add tooltips
        barsEnter
            .on("mouseover", function(event, d) {
                const percentage = ((d.count / filteredData.length) * 100).toFixed(1);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`${d.name}<br>Count: ${d.count}<br>${percentage}% of selected`)
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
    }

    // Load data and initialize chart
    d3.csv("data/individual.csv").then(function(data) {
        // Add click handlers to filter buttons
        d3.selectAll(".barchart-filter-btn").on("click", function() {
            const button = d3.select(this);
            const filterType = button.attr("data-type");
            const filterValue = button.attr("data-value");
            
            // Toggle active class
            button.classed("active", !button.classed("active"));
            
            // Update filters array
            if (button.classed("active")) {
                // Add value to filter
                currentFilters[filterType].push(filterValue);
            } else {
                // Remove value from filter
                currentFilters[filterType] = currentFilters[filterType].filter(v => v !== filterValue);
                
                // If no filters selected in group, reselect this one
                if (currentFilters[filterType].length === 0) {
                    currentFilters[filterType].push(filterValue);
                    button.classed("active", true);
                }
            }

            // Update chart
            updateChart(data);
        });

        // Initial chart render
        updateChart(data);
    });

    // Update CSS styles
    const style = document.createElement('style');
    style.textContent = `
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
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 12px;
            font-size: 14px;
            pointer-events: none;
            opacity: 0;
            z-index: 100;
            border: 1px solid rgba(0, 0, 0, 0.1);
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 1024px) {
            .barchart-visualization-container {
                grid-template-columns: 1fr;
            }
        }

        .barchart-filter-btn {
            padding: 0.5rem 1rem;
            background: #000000;
            color: white;
            border: none;
            border-radius: 0;
            font-size: 0.8rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .barchart-filter-btn:not(.active) {
            opacity: 0.6;
        }

        .barchart-filter-btn:hover {
            opacity: 0.8;
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
})();