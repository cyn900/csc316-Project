(function() {
    // Set up margins and dimensions
    const margin = { top: 20, right: 10, bottom: 40, left: 20 },
        width = 700 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Define our three dimensions
    const dims = ["Age", "Activity", "Interaction"];

    // Select the container and clear any previous content
    const container = d3.select("#parallel-coordinates");
    container.selectAll("*").remove();

    // Create container with controls
    const controlContainer = container.append("div")
        .attr("class", "network-container");

    // Create title
    controlContainer.append("h2")
        .attr("class", "chart-title")
        .text("Comparing Juvenile and Adult Squirrels: Activities and Human Interaction Patterns");

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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Group for the chart contents
    const chartG = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Right side - Legend and Text Info
    const rightPanel = mainLayout.append("div")
        .attr("class", "right-panel");

    // Create legend below (now in the right panel)
    const legend = rightPanel.append("div")
        .attr("class", "legend");

    legend.append("h3").text("Legend");

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

    textContent.append("p")
        .text("Click on the chart for detailed information. Click again to update after filtering. ");

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
                d.Activity = "Other Activities";
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
                d.Interaction = "Other Interactions";
            } else {
                d.Interaction = "None";
            }
        });

        globalData = data;

        // Build filter options (forcing inclusion of "Other" categories)
        const activitySet = new Set(data.map(d => d.Activity));
        activitySet.add("Other Activities");
        const activities = ["All", ...Array.from(activitySet).sort()];

        const interactionSet = new Set(data.map(d => d.Interaction));
        interactionSet.add("Other Interactions");
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

            // Update the text-content div with the new detailed information
            textContent.html(""); // Clear the previous text
            textContent.append("p").text(`Adult count: ${adultCount}`);
            textContent.append("p").text(`Juvenile count: ${juvenileCount}`);

            textContent.append("p").text("Activity Counts:");
            activityCounts.forEach(([key, count]) => {
                textContent.append("p").text(` - ${key}: ${count}`);
            });

            textContent.append("p").text("Interaction Counts:");
            interactionCounts.forEach(([key, count]) => {
                textContent.append("p").text(` - ${key}: ${count}`);
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

                for (let key in mapping) {
                    chartG.append("line")
                        .attr("x1", x(dim) - 5)
                        .attr("x2", x(dim) + 5)
                        .attr("y1", mapping[key].start)
                        .attr("y2", mapping[key].start)
                        .attr("stroke", "#000");
                    chartG.append("text")
                        .attr("x", x(dim))
                        .attr("y", mapping[key].start - 5)
                        .attr("text-anchor", "middle")
                        .attr("font-size", "10px")
                        .text(key);
                }
                chartG.append("text")
                    .attr("x", x(dim))
                    .attr("y", height + 25)
                    .attr("text-anchor", "middle")
                    .style("font-weight", "bold")
                    .text(dim);
            });

            // Update the text-content area with details based on the filtered data
            const adultCount = filteredData.filter(d => d.Age === "Adult").length;
            const juvenileCount = filteredData.filter(d => d.Age === "Juvenile").length;
            const activityCountsDetails = Array.from(d3.rollup(filteredData, v => v.length, d => d.Activity));
            const interactionCountsDetails = Array.from(d3.rollup(filteredData, v => v.length, d => d.Interaction));

            textContent.html(""); // Clear previous text
            textContent.append("p").text(`Adult count: ${adultCount}`);
            textContent.append("p").text(`Juvenile count: ${juvenileCount}`);
            textContent.append("p").text("Activity Counts:");
            activityCountsDetails.forEach(([key, count]) => {
                textContent.append("p").text(` - ${key}: ${count}`);
            });
            textContent.append("p").text("Interaction Counts:");
            interactionCountsDetails.forEach(([key, count]) => {
                textContent.append("p").text(` - ${key}: ${count}`);
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
        .network-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #ecf0f1;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .chart-title {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .main-layout {
            display: flex;
            gap: 20px;
        }
        .viz-container {
            flex: 2;
        }
        .right-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .controls {
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 10px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .control-group label {
            color: #2c3e50;
            font-weight: 500;
        }
        .filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .filter-icon {
            padding: 6px 10px;
            border: 1px solid #000000; /* Black border */
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #000000; /* Default black background */
            color: white;
            font-size: 0.9em;
        }
        .filter-icon:hover {
            background-color: #333333; /* Slightly lighter black on hover */
            border-color: #555555;
        }
        .filter-icon.active {
            background-color: #76bb65; /* Green when selected */
            color: white;
            border-color: #5a9b50; /* Slightly darker green border */
        }
        .legend {
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .legend h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #2c3e50;
            font-size: 16px;
        }
        .legend-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
        .text-content {
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .text-content p {
            margin: 0 0 10px 0;
            color: #2c3e50;
            line-height: 1.5;
        }
        .text-content p:last-child {
            margin-bottom: 0;
        }
        svg {
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            width: 100%;
            height: auto;
        }
    `;
    document.head.appendChild(style);
})();
