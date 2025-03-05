(function() {
    // Set up margins and dimensions
    const margin = { top: 60, right: 10, bottom: 40, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

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

    // Create controls
    const controls = controlContainer.append("div")
        .attr("class", "controls");

    // Append an SVG for the visualization
    const svg = controlContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Group for the chart contents
    const chartG = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

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

        // --- Update Visualization ---
        // We want to compute vertical mappings for each axis and record the age‐based partitions for Activity and Interaction.
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
            // Also record, for each activity category, the vertical segments allocated per Age.
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
                    // Record the activity-age partition (if not already set, or add if multiple flows exist)
                    if (!activityAgePositions[actKey]) {
                        activityAgePositions[actKey] = {};
                    }
                    // For simplicity, assume each age group for an activity appears only once.
                    activityAgePositions[actKey][ageKey] = { start: y1_top, end: y1_bot };

                    const color = ageKey === "Adult" ? "#FF0000" : "#D2691E";
                    const pathData = ribbonPath(x("Age"), x("Activity"), y0_top, y0_bot, y1_top, y1_bot);
                    chartG.append("path")
                        .attr("d", pathData)
                        .attr("fill", color)
                        .attr("fill-opacity", 0.4)
                        .attr("stroke", "none");
                });
            });

            // --- Section 2: Draw ribbons from Activity to Interaction ---
            // First, compute for each Interaction category a similar breakdown by Age.
            // We group filteredData by Interaction then by Age.
            const flowInteractionByAge = Array.from(
                d3.rollup(filteredData, v => v.length, d => d.Interaction, d => d.Age),
                ([interaction, ageMapObj]) => ({
                    interaction,
                    ageFlows: Array.from(ageMapObj, ([age, count]) => ({ age, count }))
                })
            );
            // Compute vertical offsets for each Interaction category based on aggregated counts:
            let interactionAgePositions = {};  // { interaction: { Adult: {start, end}, Juvenile: {start, end} } }
            flowInteractionByAge.forEach(d => {
                const interKey = d.interaction;
                const total = d3.sum(d.ageFlows, f => f.count);
                let cum = interactionMap[interKey].start;
                interactionAgePositions[interKey] = {};
                // Here we order age groups in the same order as in section 1 (e.g., Adult first, then Juvenile)
                const orderedAges = d.ageFlows.sort((a, b) => a.age.localeCompare(b.age));
                orderedAges.forEach(f => {
                    const fraction = f.count / total;
                    const start = cum;
                    const end = cum + fraction * (interactionMap[interKey].end - interactionMap[interKey].start);
                    interactionAgePositions[interKey][f.age] = { start, end };
                    cum = end;
                });
            });

            // Now, group flows from Activity to Interaction by Activity and Interaction and Age.
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

            // For each cell, for each age group, use the fixed positions from activityAgePositions and interactionAgePositions.
            flowActivityInteraction.forEach(d => {
                const actKey = d.activity;
                d.flows.forEach(cell => {
                    const interKey = cell.interaction;
                    cell.flows.forEach(item => {
                        const age = item.age;
                        // Use the precomputed positions.
                        const leftPos = (activityAgePositions[actKey] && activityAgePositions[actKey][age]) || null;
                        const rightPos = (interactionAgePositions[interKey] && interactionAgePositions[interKey][age]) || null;
                        if (leftPos && rightPos) {
                            const pathData = ribbonPath(x("Activity"), x("Interaction"), leftPos.start, leftPos.end, rightPos.start, rightPos.end);
                            const color = age === "Adult" ? "#FF0000" : "#D2691E";
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
        .controls {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            gap: 20px;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
        }
        .control-group label {
            color: #2c3e50;
            font-weight: 500;
        }
        .filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .filter-icon {
            padding: 8px 12px;
            border: 1px solid #bdc3c7;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #f8f9fa;
            color: #2c3e50;
        }
        .filter-icon:hover {
            background-color: #e8f4f8;
            border-color: #3498db;
        }
        .filter-icon.active {
            background-color: #3498db;
            color: white;
            border-color: #2980b9;
        }
        svg {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
})();
