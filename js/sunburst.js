(function() {
    // Update dimensions
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    // Create main container with grid layout
    const container = d3.select("#sunburst")
        .style("display", "grid")
        .style("grid-template-columns", "1fr 2fr 1fr")
        .style("gap", "4rem")
        .style("padding", "0 4rem")
        .style("background", "transparent");

    // Create left section for placeholder
    const leftSection = container.append("div")
        .attr("class", "sunburst-squirrel-container")
        .html(`
            <img src="img/Squirrel2.png" alt="Decorative squirrel illustration" class="sunburst-squirrel-container">
        `);

    leftSection.append("div")
        .attr("class", "sunburst-side-section")
        .style("margin-top", "10px")
        .html(`
            <div class="legend-container">
                <h3>Guide to Sunburst</h3>
                <p>• Inner ring: Age (Adult/Juvenile)</p>
                <p>• Middle ring: Fur Color (Gray/Cinnamon/Black)</p>
                <p>• Outer ring: Activities</p>
                <p>• Click on sections to zoom in</p>
                <p>• Click the "Reset View" button to zoom out</p>
            </div>
        `);

    // Create center section for sunburst
    const centerSection = container.append("div")
        .attr("class", "sunburst-center-section");

    // Add title box at the top
    centerSection.append("div")
        .attr("class", "sunburst-title-container")
        .append("h2")
        .attr("class", "sunburst-title")
        .text("LOOKING DEEPER INTO SQUIRREL BEHAVIOR..");

    // Create SVG container
    const svg = centerSection.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("min-height", "500px")
        .style("background", "transparent");

    // Create group for the sunburst and center it
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Add center text group
    const centerTextG = g.append("g")
        .attr("class", "center-text")
        .style("opacity", 1);

    const middleCircle = centerTextG.append("circle")
        .attr("r", radius * 0.15)
        .attr("fill", "#f9f9f9")
        .attr("stroke", "#ccc")
        .attr("stroke-width", "1px");

    const centerText = centerTextG.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.2em")
        .style("font-size", "1rem")
        .style("font-weight", "bold");

    centerText.append("tspan")
        .attr("class", "center-category")
        .attr("x", 0)
        .attr("dy", "0.1em")
        .text("All Squirrels");

    centerText.append("tspan")
        .attr("class", "center-count")
        .attr("x", 0)
        .attr("dy", "1.5em")
        .style("font-size", "0.9rem")
        .text("Click to explore");

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "sunburst-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "8px")
        .style("padding", "10px")
        .style("box-shadow", "0 3px 5px rgba(0,0,0,0.2)")
        .style("pointer-events", "none")
        .style("max-width", "220px");

    // Create right section for placeholder
    const rightSection = container.append("div")
        .attr("class", "sunburst-side-section")
        .html(`
            <div class="info-box">
                <h3>Fun Facts:</h3>
                <p>A group of squirrels is called a dray or a scurry. They are very territorial and will fight to the death to defend their area.</p>
            </div>
        `);

    // Update CSS styles
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');
        .sunburst-title-container {
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;
            text-align: center;
            width: 100%;
        }

        .sunburst-title {
            color: black;
            margin: 0;
            font-size: 35px;
            font-weight: bold;
            font-family: "COCOGOOSE", sans-serif;
        }

        .sunburst-side-section {
            font-size: 1.2rem;
            line-height: 1.8;
            padding: 2rem;
            max-width: 300px;
            margin: 0 auto;
            align-self: flex-start;
        }

        .sunburst-center-section {
            width: 100%;
            height: 100%;
            margin: 0 auto;
        }

        .sunburst-squirrel-img {
            width: 100%;
            max-width: 300px;
            margin-top: 2rem;
        }
        
        .sunburst-squirrel-container {
            width: 100%;
            max-width: 400px;
        }
        
        .sunburst-tooltip {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .sunburst-tooltip h4 {
            margin-top: 0;
            margin-bottom: 5px;
        }
        
        .legend-container, .info-box {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .legend-container h3, .info-box h3 {
            margin-top: 0;
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);

    // Load and process data
    d3.csv("data/individual.csv").then(data => {
        // Process data into nested hierarchical structure
        const hierarchyData = processNestedData(data);

        // Create partition layout
        const partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Define color scales for different levels
        const ageColorScale = d3.scaleOrdinal()
            .domain(["Adult", "Juvenile"])
            .range(["#76bb65", "#a9d6a0"]);

        const furColorScale = d3.scaleOrdinal()
            .domain(["Gray", "Cinnamon", "Black"])
            .range(["#bf1b1b", "#e85a5a", "#fa8072"]);

        const activitiesColorScale = d3.scaleOrdinal()
            .domain(["Running", "Chasing", "Climbing", "Eating", "Foraging", "Other Activities"])
            .range(["#bf5b1b", "#bf821b", "#f1af2e", "#ffb347", "#fdca40", "#e6a23c"]);

        // Process the data
        const root = d3.hierarchy(hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        partition(root);

        // Create arc generator
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        // Keep track of the current parent
        let currentRoot = root;

        // Add paths
        const paths = g.selectAll("path")
            .data(root.descendants().slice(1)) // Skip root node
            .enter()
            .append("path")
            .attr("d", arc)
            .style("fill", d => {
                // Color based on the depth/level in hierarchy
                const depth = d.depth;
                if (depth === 1) { // Age level
                    return ageColorScale(d.data.name);
                } else if (depth === 2) { // Fur color level
                    return furColorScale(d.data.name);
                } else { // Activities level
                    return activitiesColorScale(d.data.name);
                }
            })
            .style("opacity", 0.9)
            .style("stroke", "white")
            .style("stroke-width", "1px")
            .attr("class", "sunburst-path")
            .each(function(d) {
                // Store the original coordinates for zooming
                d.x0_orig = d.x0;
                d.x1_orig = d.x1;
                d.y0_orig = d.y0;
                d.y1_orig = d.y1;
            });

        // Add interactivity
        paths.on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1)
                .style("stroke-width", "2px");

            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            // Build path description for tooltip
            let pathDescription = [];
            let node = d;
            while (node.parent) {
                pathDescription.unshift(node.data.name);
                node = node.parent;
            }

            tooltip.html(`
                <h4>${d.data.name}</h4>
                <p>Path: ${pathDescription.join(" → ")}</p>
                <p>Count: ${d.value} squirrels</p>
                <p>Percentage: ${((d.value / root.value) * 100).toFixed(1)}%</p>
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("opacity", 0.9)
                    .style("stroke-width", "1px");

                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", clicked);

        // Add reset button functionality
        d3.select("#reset-button").on("click", function() {
            // Reset to the root view
            resetSunburst();
        });

        // Click handler for zooming
        function clicked(event, p) {
            // If we're already at this node, zoom out to the parent
            if (currentRoot === p && p.parent) {
                p = p.parent;
            }

            currentRoot = p;

            // Update center text
            centerText.select(".center-category")
                .text(p === root ? "All Squirrels" : p.data.name);

            centerText.select(".center-count")
                .text(p === root ? "Click to explore" : `${p.value} squirrels`);

            const t = g.transition().duration(750);

            // Transition all paths to new view
            paths.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate({
                        x0: d.x0,
                        x1: d.x1,
                        y0: d.y0,
                        y1: d.y1
                    }, {
                        x0: (d.x0 - p.x0) / (p.x1 - p.x0) * 2 * Math.PI,
                        x1: (d.x1 - p.x0) / (p.x1 - p.x0) * 2 * Math.PI,
                        y0: Math.max(0, d.y0 - p.y0),
                        y1: Math.max(0, d.y1 - p.y0)
                    });

                    return t => {
                        const b = i(t);
                        d.x0 = b.x0;
                        d.x1 = b.x1;
                        d.y0 = b.y0;
                        d.y1 = b.y1;
                    };
                })
                .attr("d", arc)
                .style("visibility", d => isVisible(d) ? "visible" : "hidden");

            // Helper to determine if a segment should be visible during zoom
            function isVisible(d) {
                return d.x0 >= 0 && d.x1 <= 2 * Math.PI && d.y0 >= 0;
            }
        }

        // Function to fully reset the sunburst
        function resetSunburst() {
            currentRoot = root;

            // Update center text
            centerText.select(".center-category")
                .text("All Squirrels");

            centerText.select(".center-count")
                .text("Click to explore");

            const t = g.transition().duration(750);

            // Transition all paths back to their original positions
            paths.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate({
                        x0: d.x0,
                        x1: d.x1,
                        y0: d.y0,
                        y1: d.y1
                    }, {
                        x0: d.x0_orig,
                        x1: d.x1_orig,
                        y0: d.y0_orig,
                        y1: d.y1_orig
                    });

                    return t => {
                        const b = i(t);
                        d.x0 = b.x0;
                        d.x1 = b.x1;
                        d.y0 = b.y0;
                        d.y1 = b.y1;
                    };
                })
                .attr("d", arc)
                .style("visibility", "visible");
        }
    });

    // Helper function to process data into nested hierarchical structure
    function processNestedData(data) {
        // Process data into nested hierarchy: Age -> Fur Color -> Activities

        // Create a nested structure
        const nestedData = {
            name: "root",
            children: []
        };

        // First level: Age (Adult, Juvenile)
        const ageGroups = ["Adult", "Juvenile"];

        ageGroups.forEach(age => {
            const ageGroup = {
                name: age,
                children: []
            };

            // Filter data for this age
            const ageData = data.filter(d => d.Age === age);

            // Second level: Fur Color (Gray, Cinnamon, Black)
            const furColors = ["Gray", "Cinnamon", "Black"];

            furColors.forEach(color => {
                // Filter data for this age and fur color
                const colorData = ageData.filter(d => d["Primary Fur Color"] === color);

                // Only create nodes for combinations that exist
                if (colorData.length > 0) {
                    const colorGroup = {
                        name: color,
                        children: []
                    };

                    // Third level: Activities
                    const activities = [
                        { name: "Running", field: "Running" },
                        { name: "Chasing", field: "Chasing" },
                        { name: "Climbing", field: "Climbing" },
                        { name: "Eating", field: "Eating" },
                        { name: "Foraging", field: "Foraging" },
                        { name: "Other Activities", field: "Other Activities" }
                    ];

                    activities.forEach(activity => {
                        // Count squirrels with this activity in this age and fur color group
                        const activityCount = colorData.filter(d => d[activity.field] === "TRUE").length;

                        // Only add activities with non-zero counts
                        if (activityCount > 0) {
                            colorGroup.children.push({
                                name: activity.name,
                                value: activityCount
                            });
                        }
                    });

                    // Add fur color group to age group if it has activities
                    if (colorGroup.children.length > 0) {
                        ageGroup.children.push(colorGroup);
                    } else {
                        // If no activities, add a direct count for this fur color
                        ageGroup.children.push({
                            name: color,
                            value: colorData.length
                        });
                    }
                }
            });

            // Add age group to root if it has children
            if (ageGroup.children.length > 0) {
                nestedData.children.push(ageGroup);
            }
        });

        return nestedData;
    }
})();