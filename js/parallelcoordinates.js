(function() {
    // Set up margins and dimensions
    const margin = { 
        top: 30, 
        right: 150,    // Increased for right side spacing
        bottom: 50,   
        left: 150      // Changed to positive value for left side spacing
    },
    width = 1400 - margin.left - margin.right,  // Adjusted width
    height = 500 - margin.top - margin.bottom;

    // Define our three dimensions
    const dims = ["Age", "Activity", "Interaction"];

    // Select the container and clear any previous content
    const container = d3.select("#parallel-coordinates");
    container.selectAll("*").remove();

    // Create container with controls
    const controlContainer = container.append("div")
        .attr("class", "network-container");

    // Create title section
    const titleSection = controlContainer.append("div")
        .attr("class", "title-section");
        
    // Create title
    titleSection.append("h2")
        .attr("class", "chart-title")
        .text("COMPARING SQUIRREL BEHAVIORS");
        
    // Add subtitle
    titleSection.append("div")
        .attr("class", "chart-subtitle")
        .text("JUVENILE VS ADULT INTERACTION PATTERNS");

    // Create main layout: viz on left, info on right
    const mainLayout = controlContainer.append("div")
        .attr("class", "main-layout");

    // Left side - Visualization container with filters above the viz
    const vizContainer = mainLayout.append("div")
        .attr("class", "viz-container");

    // Append filter controls in vizContainer (moved from the right panel)
    const controls = vizContainer.append("div")
        .attr("class", "controls");

    // Create controls for Activities
    // (The Activities filter remains unchanged.)
    // Build later after CSV load for dynamic options.

    // Append an SVG for the visualization below the controls
    const svg = vizContainer.append("svg")
        .attr("viewBox", `${margin.left} ${margin.top} ${width + margin.left/2} ${height + margin.top + margin.bottom}`)
        .style("width", "100%")
        .style("height", "auto");

    // Group for the chart contents
    const chartG = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Right side - Legend and Text Info
    const rightPanel = mainLayout.append("div")
        .attr("class", "right-panel");

    // Create legend below (now in the right panel)
    const legend = rightPanel.append("div")
        .attr("class", "legend");

    legend.append("h3")
        .attr("class", "panel-heading")
        .text("LEGEND");

    const legendItems = legend.append("div")
        .attr("class", "legend-items");

    // Adult legend item
    const adultLegend = legendItems.append("div")
        .attr("class", "legend-item");

    adultLegend.append("div")
        .attr("class", "legend-color")
        .style("background-color", "#bf1b1b");

    adultLegend.append("span").text("Adult");

    // Juvenile legend item
    const juvenileLegend = legendItems.append("div")
        .attr("class", "legend-item");

    juvenileLegend.append("div")
        .attr("class", "legend-color")
        .style("background-color", "#76bb65");

    juvenileLegend.append("span").text("Juvenile");

    // Text placeholder below legend
    const textContent = rightPanel.append("div")
        .attr("class", "text-content");

    textContent.append("h3")
        .attr("class", "panel-heading")
        .text("DETAILS");
        
    textContent.append("p")
        .attr("class", "instruction-text")
        .text("Use the filters above to explore different combinations of activities and interactions.");
        
    // Create multi-column layout for data display
    const dataColumns = textContent.append("div")
        .attr("class", "data-columns");
        
    // Column 1: Age counts
    const ageColumn = dataColumns.append("div")
        .attr("class", "data-column");
        
    ageColumn.append("h4")
        .attr("class", "column-heading")
        .text("AGE");
        
    ageColumn.append("div")
        .attr("class", "age-counts")
        .html("<p>Click chart to view data</p>");
        
    // Column 2: Activity counts
    const activityColumn = dataColumns.append("div")
        .attr("class", "data-column");
        
    activityColumn.append("h4")
        .attr("class", "column-heading")
        .text("ACTIVITIES");
        
    activityColumn.append("div")
        .attr("class", "activity-counts")
        .html("<p>Click chart to view data</p>");
        
    // Column 3: Interaction counts
    const interactionColumn = dataColumns.append("div")
        .attr("class", "data-column");
        
    interactionColumn.append("h4")
        .attr("class", "column-heading")
        .text("INTERACTIONS");
        
    interactionColumn.append("div")
        .attr("class", "interaction-counts")
        .html("<p>Click chart to view data</p>");

    // X-scale: place each dimension evenly
    const x = d3.scalePoint()
        .domain(dims)
        .range([0, width])
        .padding(0.5);

    // Global variable to store loaded data
    let globalData = [];

    d3.csv("data/individual.csv").then(function(data) {
        // Process each row for our three dimensions
        data.forEach(d => {
            d.Age = (d.Age && d.Age.trim() === "Adult") ? "Adult" : "Juvenile";

            if (d.Running && d.Running.trim().toUpperCase() === "TRUE") {
                d.Activity = "Running";
            } else if (d.Chasing && d.Chasing.trim().toUpperCase() === "TRUE") {
                d.Activity = "Chasing";
            } else if (d.Climbing && d.Climbing.trim().toUpperCase() === "TRUE") {
                d.Activity = "Climbing";
            } else if (d.Eating && d.Eating.trim().toUpperCase() === "TRUE") {
                d.Activity = "Eating";
            } else if (d.Foraging && d.Foraging.trim().toUpperCase() === "TRUE") {
                d.Activity = "Foraging";
            } else if (d["Other Activities"]) {
                d.Activity = "Others";
            } else {
                d.Activity = "None";
            }

            if (d.Approaches && d.Approaches.trim().toUpperCase() === "TRUE") {
                d.Interaction = "Approaches";
            } else if (d.Indifferent && d.Indifferent.trim().toUpperCase() === "TRUE") {
                d.Interaction = "Indifferent";
            } else if (d["Runs from"] && d["Runs from"].trim().toUpperCase() === "TRUE") {
                d.Interaction = "Runs from";
            } else if (d["Other Interactions"]) {
                d.Interaction = "Others";
            } else {
                d.Interaction = "None";
            }
        });

        globalData = data;

        // Build filter options (forcing inclusion of "Others" categories)
        const activitySet = new Set(data.map(d => d.Activity));
        activitySet.add("Others");
        const activities = ["All", ...Array.from(activitySet).sort()];

        const interactionSet = new Set(data.map(d => d.Interaction));
        interactionSet.add("Others");
        const interactions = ["All", ...Array.from(interactionSet).sort()];

        // Create controls for Activities
        const activityControls = controls.append("div")
            .attr("class", "control-group");

        activityControls.append("label").text("Activity:");
        const activityFilterContainer = activityControls.append("div")
            .attr("class", "filter-container");

        activityFilterContainer.selectAll(".filter-icon")
            .data(activities)
            .enter()
            .append("div")
            .attr("class", (d, i) => `filter-icon ${i === 0 ? 'active' : ''}`)
            .attr("data-type", "activity")
            .text(d => d)
            .on("click", function(event, d) {
                const clicked = d3.select(this);
                if (d === "All") {
                    activityFilterContainer.selectAll(".filter-icon").classed("active", false);
                    clicked.classed("active", true);
                } else {
                    activityFilterContainer.selectAll(".filter-icon")
                        .filter(function(data) { return data === "All"; })
                        .classed("active", false);
                    clicked.classed("active", !clicked.classed("active"));
                    if (activityFilterContainer.selectAll(".filter-icon.active").empty()) {
                        clicked.classed("active", true);
                    }
                }
                updateVis();
            });

        // Create controls for Interactions
        const interactionControls = controls.append("div")
            .attr("class", "control-group");

        interactionControls.append("label").text("Interaction:");
        const interactionFilterContainer = interactionControls.append("div")
            .attr("class", "filter-container");

        interactionFilterContainer.selectAll(".filter-icon")
            .data(interactions)
            .enter()
            .append("div")
            .attr("class", (d, i) => `filter-icon ${i === 0 ? 'active' : ''}`)
            .attr("data-type", "interaction")
            .text(d => d)
            .on("click", function(event, d) {
                const clicked = d3.select(this);
                if (d === "All") {
                    interactionFilterContainer.selectAll(".filter-icon").classed("active", false);
                    clicked.classed("active", true);
                } else {
                    interactionFilterContainer.selectAll(".filter-icon")
                        .filter(function(data) { return data === "All"; })
                        .classed("active", false);
                    clicked.classed("active", !clicked.classed("active"));
                    if (interactionFilterContainer.selectAll(".filter-icon.active").empty()) {
                        clicked.classed("active", true);
                    }
                }
                updateVis();
            });

        // Initial render
        updateVis();

        svg.on("click", function() {
            // Compute overall counts using the globalData loaded from CSV
            const adultCount = globalData.filter(d => d.Age === "Adult").length;
            const juvenileCount = globalData.filter(d => d.Age === "Juvenile").length;

            // For activity and interaction counts, we use d3.rollup to aggregate the counts
            const activityCounts = Array.from(d3.rollup(globalData, v => v.length, d => d.Activity));
            const interactionCounts = Array.from(d3.rollup(globalData, v => v.length, d => d.Interaction));

            // Update the age column
            const ageCountsDiv = d3.select(".age-counts");
            ageCountsDiv.html("");
            ageCountsDiv.append("p").html(`<strong>Adult:</strong> ${adultCount}`);
            ageCountsDiv.append("p").html(`<strong>Juvenile:</strong> ${juvenileCount}`);
            
            // Update the activity column
            const activityCountsDiv = d3.select(".activity-counts");
            activityCountsDiv.html("");
            activityCounts.forEach(([key, count]) => {
                activityCountsDiv.append("p").html(`<strong>${key}:</strong> ${count}`);
            });
            
            // Update the interaction column
            const interactionCountsDiv = d3.select(".interaction-counts");
            interactionCountsDiv.html("");
            interactionCounts.forEach(([key, count]) => {
                interactionCountsDiv.append("p").html(`<strong>${key}:</strong> ${count}`);
            });
        });

        // --- Update Visualization ---
        function updateVis() {
            const selectedActivity = activityFilterContainer.selectAll(".filter-icon.active")
                .nodes().map(n => n.textContent);
            const selectedInteraction = interactionFilterContainer.selectAll(".filter-icon.active")
                .nodes().map(n => n.textContent);

            const filteredData = globalData.filter(d =>
                ((selectedActivity.includes("All")) || selectedActivity.includes(d.Activity)) &&
                ((selectedInteraction.includes("All")) || selectedInteraction.includes(d.Interaction))
            );

            chartG.selectAll("*").remove();

            // Aggregate counts for each dimension
            const ageCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Age), ([key, value]) => ({ key, value }));
            const activityCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Activity), ([key, value]) => ({ key, value }));
            const interactionCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Interaction), ([key, value]) => ({ key, value }));

            function getMapping(counts) {
                const total = d3.sum(counts, d => d.value);
                let mapping = {};
                let cum = 0;
                counts.forEach(d => {
                    const start = cum;
                    const end = cum + d.value;
                    mapping[d.key] = {
                        start: (start / total) * height,
                        end: (end / total) * height,
                        value: d.value
                    };
                    cum = end;
                });
                return mapping;
            }

            const ageMap = getMapping(ageCounts);
            const activityMap = getMapping(activityCounts);
            const interactionMap = getMapping(interactionCounts);

            // --- Section 1: Draw ribbons from Age to Activity ---
            let activityAgePositions = {};  // { activity: { Adult: {start, end}, Juvenile: {start, end} } }
            let ageOffsets = {};
            Object.keys(ageMap).forEach(k => { ageOffsets[k] = ageMap[k].start; });
            let activityOffsets1 = {};
            Object.keys(activityMap).forEach(k => { activityOffsets1[k] = activityMap[k].start; });

            const flowAgeActivity = Array.from(
                d3.rollup(filteredData, v => v.length, d => d.Age, d => d.Activity),
                ([age, map]) => ({ age, flows: Array.from(map, ([activity, count]) => ({ activity, count })) })
            );

            flowAgeActivity.forEach(d => {
                const ageKey = d.age;
                d.flows.forEach(flow => {
                    const actKey = flow.activity;
                    const count = flow.count;
                    const ageTotal = ageMap[ageKey].end - ageMap[ageKey].start;
                    const actTotal = activityMap[actKey].end - activityMap[actKey].start;
                    const ageThickness = (count / ageMap[ageKey].value) * ageTotal;
                    const actThickness = (count / activityMap[actKey].value) * actTotal;
                    const y0_top = ageOffsets[ageKey];
                    const y0_bot = y0_top + ageThickness;
                    const y1_top = activityOffsets1[actKey];
                    const y1_bot = y1_top + actThickness;
                    ageOffsets[ageKey] += ageThickness;
                    activityOffsets1[actKey] += actThickness;
                    if (!activityAgePositions[actKey]) {
                        activityAgePositions[actKey] = {};
                    }
                    activityAgePositions[actKey][ageKey] = { start: y1_top, end: y1_bot };

                    const color = ageKey === "Adult" ? "#bf1b1b" : "#76bb65";
                    const pathData = ribbonPath(x("Age"), x("Activity"), y0_top, y0_bot, y1_top, y1_bot);
                    chartG.append("path")
                        .attr("d", pathData)
                        .attr("fill", color)
                        .attr("fill-opacity", 0.4)
                        .attr("stroke", "none");
                });
            });

            // --- Section 2: Draw ribbons from Activity to Interaction ---
            const flowInteractionByAge = Array.from(
                d3.rollup(filteredData, v => v.length, d => d.Interaction, d => d.Age),
                ([interaction, ageMapObj]) => ({
                    interaction,
                    ageFlows: Array.from(ageMapObj, ([age, count]) => ({ age, count }))
                })
            );
            let interactionAgePositions = {};
            flowInteractionByAge.forEach(d => {
                const interKey = d.interaction;
                const total = d3.sum(d.ageFlows, f => f.count);
                let cum = interactionMap[interKey].start;
                interactionAgePositions[interKey] = {};
                const orderedAges = d.ageFlows.sort((a, b) => a.age.localeCompare(b.age));
                orderedAges.forEach(f => {
                    const fraction = f.count / total;
                    const start = cum;
                    const end = cum + fraction * (interactionMap[interKey].end - interactionMap[interKey].start);
                    interactionAgePositions[interKey][f.age] = { start, end };
                    cum = end;
                });
            });

            const flowActivityInteraction = Array.from(
                d3.rollup(filteredData,
                    v => d3.rollup(v, g => g.length, d => d.Age),
                    d => d.Activity, d => d.Interaction
                ),
                ([activity, interMap]) => ({
                    activity,
                    flows: Array.from(interMap, ([interaction, ageMapObj]) => {
                        const flows = Array.from(ageMapObj, ([age, count]) => ({ age, count }));
                        return { interaction, flows };
                    })
                })
            );

            flowActivityInteraction.forEach(d => {
                const actKey = d.activity;
                d.flows.forEach(cell => {
                    const interKey = cell.interaction;
                    cell.flows.forEach(item => {
                        const age = item.age;
                        const leftPos = (activityAgePositions[actKey] && activityAgePositions[actKey][age]) || null;
                        const rightPos = (interactionAgePositions[interKey] && interactionAgePositions[interKey][age]) || null;
                        if (leftPos && rightPos) {
                            const pathData = ribbonPath(x("Activity"), x("Interaction"), leftPos.start, leftPos.end, rightPos.start, rightPos.end);
                            const color = age === "Adult" ? "#bf1b1b" : "#76bb65";
                            chartG.append("path")
                                .attr("d", pathData)
                                .attr("fill", color)
                                .attr("fill-opacity", 0.4)
                                .attr("stroke", "none");
                        }
                    });
                });
            });

            // Draw axis guidelines and labels
            dims.forEach(dim => {
                let mapping;
                if (dim === "Age") mapping = ageMap;
                else if (dim === "Activity") mapping = activityMap;
                else if (dim === "Interaction") mapping = interactionMap;

                // Add text labels
                for (let key in mapping) {
                    chartG.append("text")
                        .attr("x", x(dim))
                        .attr("y", (mapping[key].start + mapping[key].end) / 2)
                        .attr("dy", "0.35em")
                        .attr("text-anchor", dim === "Age" ? "end" : (dim === "Interaction" ? "start" : "middle"))
                        .attr("transform", `translate(${dim === "Age" ? -10 : (dim === "Interaction" ? 10 : 0)}, 0)`)
                        .style("font-size", "20px")  // Increased from 12px to 20px
                        .style("font-weight", "500")
                        .text(key);
                }

                // Add dimension labels at the bottom with larger font
                chartG.append("text")
                    .attr("x", x(dim))
                    .attr("y", height + 40)  // Adjusted position for larger font
                    .attr("text-anchor", "middle")
                    .style("font-size", "20px")  // Increased from 14px to 20px
                    .style("font-weight", "bold")
                    .text(dim);
            });

            // Update the text-content area with details based on the filtered data
            const adultCount = filteredData.filter(d => d.Age === "Adult").length;
            const juvenileCount = filteredData.filter(d => d.Age === "Juvenile").length;
            const activityCountsDetails = Array.from(d3.rollup(filteredData, v => v.length, d => d.Activity));
            const interactionCountsDetails = Array.from(d3.rollup(filteredData, v => v.length, d => d.Interaction));

            // Update the age column
            const ageCountsDiv = d3.select(".age-counts");
            ageCountsDiv.html("");
            ageCountsDiv.append("p").html(`<strong>Adult:</strong> ${adultCount}`);
            ageCountsDiv.append("p").html(`<strong>Juvenile:</strong> ${juvenileCount}`);
            
            // Update the activity column
            const activityCountsDiv = d3.select(".activity-counts");
            activityCountsDiv.html("");
            activityCountsDetails.forEach(([key, count]) => {
                activityCountsDiv.append("p").html(`<strong>${key}:</strong> ${count}`);
            });
            
            // Update the interaction column
            const interactionCountsDiv = d3.select(".interaction-counts");
            interactionCountsDiv.html("");
            interactionCountsDetails.forEach(([key, count]) => {
                interactionCountsDiv.append("p").html(`<strong>${key}:</strong> ${count}`);
            });

            // Helper: generate a curved ribbon path between two axes
            function ribbonPath(x0, x1, y0_top, y0_bot, y1_top, y1_bot) {
                const curvature = 0.5;
                const xi = d3.interpolateNumber(x0, x1);
                const x2 = xi(curvature);
                const x3 = xi(1 - curvature);
                return `M${x0},${y0_top}
                        C${x2},${y0_top} ${x3},${y1_top} ${x1},${y1_top}
                        L${x1},${y1_bot}
                        C${x3},${y1_bot} ${x2},${y0_bot} ${x0},${y0_bot}
                        Z`;
            }
        }
    }).catch(function(error) {
        console.error("Error loading CSV data: " + error);
    });

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');
        
        .network-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1800px;
            padding: 40px 60px;  // Increased horizontal padding
            margin: 0 auto;
            background: transparent;
            width: 100%;
        }
        
        .title-section {
            margin-bottom: 40px;
            text-align: center;
        }
        
        .chart-title {
            color: #000000;
            text-align: center;
            margin: 0 0 10px 0;
            font-size: 3rem;
            font-weight: bold;
            font-family: "COCOGOOSE", sans-serif;
            letter-spacing: 2px;
        }
        
        .chart-subtitle {
            color: #bf1b1b;
            text-align: center;
            margin-bottom: 5px;
            font-size: 1.5rem;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .main-layout {
            display: flex;
            gap: 60px;  // Increased gap between viz and right panel
            margin-top: 20px;
            align-items: flex-start;
            width: 100%;
            padding: 0 20px;  // Added padding to main layout
        }
        
        .viz-container {
            flex: 1.6;
            padding: 0 10px;  // Added horizontal padding
            width: 100%;
            margin: 0;
        }
        
        .right-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        
        .controls {
            padding: 20px 0;
            margin-bottom: 20px;
            margin-left: 100px;  // Added left margin to match the chart margin
            width: calc(100% - 150px);  // Adjust width to account for margin
        }
        
        .control-group {
            margin-bottom: 15px;
            width: 100%;
        }
        
        .control-group label {
            color: #000000;
            font-weight: 600;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
        }
        
        .filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .filter-icon {
            padding: 8px 12px;
            border: 1px solid #000000;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #000000;
            color: white;
            font-size: 0.95em;
            font-weight: 500;
        }
        
        .filter-icon:hover {
            background-color: #333333;
            border-color: #555555;
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .filter-icon.active {
            background-color: #76bb65;
            color: white;
            border-color: #5a9b50;
            transform: translateY(-1px);
            box-shadow: 0 2px 3px rgba(0,0,0,0.1);
        }
        
        .panel-heading {
            margin: 0 0 15px 0;
            color: #000000;
            font-size: 1.3rem;
            font-weight: 600;
            letter-spacing: 1px;
            border-bottom: 2px solid #bf1b1b;
            padding-bottom: 8px;
            font-family: "COCOGOOSE", sans-serif;
        }
        
        .legend {
            padding: 0;
            background: transparent;
        }
        
        .legend-items {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.1rem;
        }
        
        .legend-color {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .text-content {
            padding: 0;
            background: transparent;
        }
        
        .instruction-text {
            font-style: italic;
            color: #555;
            margin-bottom: 20px;
        }
        
        .text-content p {
            margin: 0 0 12px 0;
            color: #333;
            line-height: 1.6;
            font-size: 1.05rem;
        }
        
        svg {
            width: 100%;
            height: auto;
            background: transparent;
            margin: 0 auto;  // Center the SVG
            overflow: visible;  // Allow labels to extend outside SVG
        }
        
        /* Improve axis labels */
        text {
            font-size: 12px;
            font-weight: 500;
        }
        
        /* Make the paths more visible */
        path {
            stroke-width: 1.5px;
        }
        
        .data-columns {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 15px;
        }
        
        .data-column {
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 6px;
            padding: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .column-heading {
            font-family: "COCOGOOSE", sans-serif;
            font-size: 1rem;
            margin: 0 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            color: #333;
            letter-spacing: 0.5px;
        }
        
        .data-column p {
            margin: 5px 0;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        .data-column strong {
            color: #000;
        }
        
        /* Responsive adjustments */
        @media (max-width: 1100px) {
            .data-columns {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 768px) {
            .main-layout {
                flex-direction: column;
            }
            
            .right-panel {
                width: 100%;
            }
            
            .data-columns {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        
        @media (max-width: 576px) {
            .data-columns {
                grid-template-columns: 1fr;
            }
        }

        /* Ensure the chart aligns with filters */
        .viz-container svg {
            width: 100%;
            overflow: visible;
            margin: 0 auto;  // Center the SVG
        }

        /* Adjust the chart group positioning */
        .chart-group {
            transform-origin: left center;
        }

        /* Make all text in the visualization larger */
        .chart-title {
            font-size: 2.8rem;  // Match bar chart title size
            margin-bottom: 0.5rem;
        }

        .chart-subtitle {
            font-size: 1.4rem;  // Match bar chart subtitle size
            margin-bottom: 1rem;
        }

        /* Update axis and label text */
        text {
            font-size: 20px !important;  // Match bar chart text size
            font-weight: 500;
        }

        .panel-heading {
            font-size: 1.3rem;  // Match bar chart heading size
            margin-bottom: 15px;
        }

        /* Update legend text */
        .legend-item {
            font-size: 1.1rem;  // Match bar chart legend size
        }

        /* Update details text */
        .data-column {
            font-size: 1.1rem;  // Match bar chart details size
        }

        .column-heading {
            font-size: 1.1rem;  // Match bar chart column heading size
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
})();
