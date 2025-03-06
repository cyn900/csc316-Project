(function() {
    // Set up color
    const colors = {
        primary: "#2c3e50",
        accent: "#e74c3c",
        background: "#ecf0f1",
        bars: "#3498db",
        barsHover: "#2980b9",
        text: "#2c3e50"
    };

    // Create title
    d3.select("#barchart")
        .append("h2")
        .attr("class", "chart-title")
        .text("Squirrel Behavior Analysis");

    // Create filter buttons container
    const filterContainer = d3.select("#barchart")
        .append("div")
        .attr("class", "filter-container");

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
            .attr("class", "filter-group");

        groupContainer
            .append("h3")
            .attr("class", "filter-title")
            .text(group.title);

        const buttonContainer = groupContainer
            .append("div")
            .attr("class", "button-container");

        group.options.forEach(option => {
            buttonContainer
                .append("button")
                .attr("class", "filter-btn active")
                .attr("data-type", group.type)
                .attr("data-value", option.value)
                .text(option.label);
        });
    });

    // Set up chart dimensions
    const margin = {top: 40, right: 30, bottom: 100, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create tooltip
    const tooltip = d3.select("#barchart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create chart container
    const chartContainer = d3.select("#barchart")
        .append("div")
        .attr("class", "chart-container");

    // Create SVG container
    const svg = chartContainer
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart title
    g.append("text")
        .attr("class", "chart-subtitle")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Observed Behaviors");

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
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(activities, d => d.count)])
            .range([height, 0]);

        // Update axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.selectAll(".x-axis").remove();
        g.selectAll(".y-axis").remove();

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        g.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -(height / 2))
            .attr("text-anchor", "middle")
            .text("Number of Observations");

        // Update bars
        const bars = g.selectAll(".bar")
            .data(activities);

        bars.exit().remove();

        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar");

        bars.merge(barsEnter)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.name))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.count))
            .attr("fill", "steelblue");

        // Add tooltips
        barsEnter
            .on("mouseover", function(event, d) {
                const percentage = ((d.count / filteredData.length) * 100).toFixed(1);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.name}<br/>Count: ${d.count}<br/>${percentage}% of selected`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", "orange");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", "steelblue");
            });
    }

    // Load data and initialize chart
    d3.csv("data/individual.csv").then(function(data) {
        // Add click handlers to filter buttons
        d3.selectAll(".filter-btn").on("click", function() {
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: ${colors.background};
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-title {
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 30px;
            font-size: 24px;
        }

        .chart-subtitle {
            fill: ${colors.text};
            font-size: 16px;
            font-weight: 500;
        }

        .filter-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .filter-title {
            color: ${colors.primary};
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }

        .button-container {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 8px 12px;
            border: 2px solid ${colors.primary};
            background: white;
            color: ${colors.primary};
            cursor: pointer;
            border-radius: 20px;
            font-size: 14px;
            transition: all 0.2s ease;
            flex: 1;
            min-width: 80px;
            text-align: center;
        }

        .filter-btn:hover {
            background: ${colors.primary}22;
        }

        .filter-btn.active {
            background: ${colors.primary};
            color: white;
        }

        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .bar {
            fill: ${colors.bars};
            transition: all 0.2s ease;
        }

        .bar:hover {
            fill: ${colors.barsHover};
        }

        .tooltip {
            position: absolute;
            padding: 12px;
            background: white;
            border: none;
            border-radius: 4px;
            pointer-events: none;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            color: ${colors.text};
            z-index: 1000;
        }

        .x-axis text, .y-axis text {
            fill: ${colors.text};
            font-size: 12px;
        }

        .x-axis line, .y-axis line, .x-axis path, .y-axis path {
            stroke: #ddd;
        }

        @media (max-width: 768px) {
            .filter-container {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
})();