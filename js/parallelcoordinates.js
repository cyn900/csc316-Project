// parallel-coordinates.js
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

    // Append an SVG for the visualization
    const svg = container.append("svg")
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

    // Create filtering UI elements (drop‑down menus) above the chart
    const filterDiv = container.append("div")
        .attr("class", "filters")
        .style("margin", "10px");

    filterDiv.append("label").text("Filter Activity: ");
    const activitySelect = filterDiv.append("select").attr("id", "activitySelect");
    filterDiv.append("label").text(" Filter Interaction: ").style("margin-left", "20px");
    const interactionSelect = filterDiv.append("select").attr("id", "interactionSelect");

    // Global variable to store loaded data
    let globalData = [];

    // Load the CSV data
    d3.csv("data/individual.csv").then(function(data) {
        // Process each row to compute our three dimensions:
        data.forEach(d => {
            // Age: if the CSV value equals "Adult" exactly, then Adult; else Juvenile
            d.Age = (d.Age && d.Age.trim() === "Adult") ? "Adult" : "Juvenile";

            // Activity: check flags in a predetermined order. If none is true, use "None"
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
            } else if (d["Other Activities"] && d["Other Activities"].trim().toUpperCase() === "TRUE") {
                d.Activity = "Other Activities";
            } else {
                d.Activity = "None";
            }

            // Interaction: check in order, defaulting to "None" if none is true.
            if (d.Approaches && d.Approaches.trim().toUpperCase() === "TRUE") {
                d.Interaction = "Approaches";
            } else if (d.Indifferent && d.Indifferent.trim().toUpperCase() === "TRUE") {
                d.Interaction = "Indifferent";
            } else if (d["Runs from"] && d["Runs from"].trim().toUpperCase() === "TRUE") {
                d.Interaction = "Runs from";
            } else if (d["Other Interactions"] && d["Other Interactions"].trim().toUpperCase() === "TRUE") {
                d.Interaction = "Other Interactions";
            } else {
                d.Interaction = "None";
            }
        });

        globalData = data;

        // Populate the filter drop-downs using the unique categories from the data.
        const activities = Array.from(new Set(data.map(d => d.Activity))).sort();
        activitySelect.append("option").attr("value", "all").text("All");
        activities.forEach(act => {
            activitySelect.append("option").attr("value", act).text(act);
        });
        const interactions = Array.from(new Set(data.map(d => d.Interaction))).sort();
        interactionSelect.append("option").attr("value", "all").text("All");
        interactions.forEach(int => {
            interactionSelect.append("option").attr("value", int).text(int);
        });

        updateVis();
    }).catch(function(error) {
        console.error("Error loading CSV data: " + error);
    });

    // Set up filter event listeners.
    activitySelect.on("change", updateVis);
    interactionSelect.on("change", updateVis);

    // The updateVis function aggregates data and redraws the ribbons.
    function updateVis() {
        // Get filter selections.
        const selectedActivity = d3.select("#activitySelect").property("value");
        const selectedInteraction = d3.select("#interactionSelect").property("value");

        // Filter the data accordingly.
        const filteredData = globalData.filter(d =>
            (selectedActivity === "all" || d.Activity === selectedActivity) &&
            (selectedInteraction === "all" || d.Interaction === selectedInteraction)
        );

        // Clear previous chart contents.
        chartG.selectAll("*").remove();

        // Aggregate counts for each dimension.
        const ageCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Age), ([key, value]) => ({ key, value }));
        const activityCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Activity), ([key, value]) => ({ key, value }));
        const interactionCounts = Array.from(d3.rollup(filteredData, v => v.length, d => d.Interaction), ([key, value]) => ({ key, value }));

        // Helper function to compute vertical mapping for an axis.
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

        // Compute flows (aggregated counts) between adjacent dimensions.
        const flowAgeActivity = Array.from(
            d3.rollup(filteredData, v => v.length, d => d.Age, d => d.Activity),
            ([age, map]) => ({ age, flows: Array.from(map, ([activity, count]) => ({ activity, count })) })
        );
        const flowActivityInteraction = Array.from(
            d3.rollup(filteredData, v => v.length, d => d.Activity, d => d.Interaction),
            ([activity, map]) => ({ activity, flows: Array.from(map, ([interaction, count]) => ({ interaction, count })) })
        );

        // For drawing ribbons, we need to keep track of offset positions within each category.
        let ageOffsets = {};
        Object.keys(ageMap).forEach(k => { ageOffsets[k] = ageMap[k].start; });
        let activityOffsets = {};
        Object.keys(activityMap).forEach(k => { activityOffsets[k] = activityMap[k].start; });

        // Helper to generate a curved ribbon path between two axes.
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

        // Draw ribbons from Age to Activity.
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
                const y1_top = activityOffsets[actKey];
                const y1_bot = y1_top + actThickness;
                ageOffsets[ageKey] += ageThickness;
                activityOffsets[actKey] += actThickness;

                // Set color based on age
                const color = ageKey === "Adult" ? "#1f77b4" : "#ff7f0e";  // Blue for Adult, Orange for Juvenile

                const pathData = ribbonPath(x("Age"), x("Activity"), y0_top, y0_bot, y1_top, y1_bot);
                chartG.append("path")
                    .attr("d", pathData)
                    .attr("fill", color)
                    .attr("fill-opacity", 0.4)
                    .attr("stroke", "none");
            });
        });

// Reset offsets for flows from Activity to Interaction.
        activityOffsets = {};
        Object.keys(activityMap).forEach(k => { activityOffsets[k] = activityMap[k].start; });
        let interactionOffsets = {};
        Object.keys(interactionMap).forEach(k => { interactionOffsets[k] = interactionMap[k].start; });

// Draw ribbons from Activity to Interaction.
        flowActivityInteraction.forEach(d => {
            const actKey = d.activity;
            d.flows.forEach(flow => {
                const interKey = flow.interaction;
                const count = flow.count;
                const actTotal = activityMap[actKey].end - activityMap[actKey].start;
                const interTotal = interactionMap[interKey].end - interactionMap[interKey].start;
                const actThickness = (count / activityMap[actKey].value) * actTotal;
                const interThickness = (count / interactionMap[interKey].value) * interTotal;
                const y0_top = activityOffsets[actKey];
                const y0_bot = y0_top + actThickness;
                const y1_top = interactionOffsets[interKey];
                const y1_bot = y1_top + interThickness;
                activityOffsets[actKey] += actThickness;
                interactionOffsets[interKey] += interThickness;

                // Color the ribbons based on activity (optional, or you can stick with age color here).
                const color = actKey === "Running" ? "#1f77b4" : "#ff7f0e";  // Example: Blue for Running, Orange for other Activities

                const pathData = ribbonPath(x("Activity"), x("Interaction"), y0_top, y0_bot, y1_top, y1_bot);
                chartG.append("path")
                    .attr("d", pathData)
                    .attr("fill", color)
                    .attr("fill-opacity", 0.4)
                    .attr("stroke", "none");
            });
        });

        // Draw axis guidelines and add bottom labels for each dimension.
        dims.forEach(dim => {
            let mapping;
            if (dim === "Age") mapping = ageMap;
            else if (dim === "Activity") mapping = activityMap;
            else if (dim === "Interaction") mapping = interactionMap;
            // For each category, add a tick and label.
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
            // Add a bottom label for the axis.
            chartG.append("text")
                .attr("x", x(dim))
                .attr("y", height + 25)
                .attr("text-anchor", "middle")
                .style("font-weight", "bold")
                .text(dim);
        });
    }
})();