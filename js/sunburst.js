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
        .style("max-width", "100%")
        .html(`
            <div class="legend-container">
                <h3>Guide to Sunburst</h3>
                <p>• Inner ring: Age (Adult/Juvenile)</p>
                <p>• Middle ring: Fur Color (Gray/Cinnamon/Black)</p>
                <p>• Outer ring: Activities</p>
                <p>• Click on sections to zoom in</p>
                <p>• Click the "Reset" button below to zoom out</p>
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

    // Add reset button below the SVG with improved visibility
    centerSection.append("div")
        .attr("class", "reset-button-container")
        .append("button")
        .attr("id", "sunburst-reset-button")
        .attr("class", "sunburst-reset-button")
        .html('<i class="reset-icon"></i> Reset Zoom')
        .style("display", "block")  // Ensure it's visible
        .style("margin", "20px auto")
        .style("z-index", "1000");  // Ensure it's on top

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
        .style("background-color", "rgba(255, 255, 255, 0.95)")
        .style("border", "2px solid #bf1b1b")
        .style("border-radius", "6px")
        .style("padding", "12px")
        .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("min-width", "200px")
        .style("z-index", "1000");

    // Create right section for placeholder
    const rightSection = container.append("div")
        .attr("class", "sunburst-side-section");
        
    // Add legend to the right section
    rightSection.append("div")
        .attr("class", "sunburst-legend")
        .html(`
            <h3>Color Legend</h3>
            <div class="legend-section">
                <h4>Age (Inner Ring)</h4>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #76bb65;"></span>
                    <span class="legend-label">Adult</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #a9d6a0;"></span>
                    <span class="legend-label">Juvenile</span>
                </div>
            </div>
            
            <div class="legend-section">
                <h4>Fur Color (Middle Ring)</h4>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #bf1b1b;"></span>
                    <span class="legend-label">Gray</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #e85a5a;"></span>
                    <span class="legend-label">Cinnamon</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #fa8072;"></span>
                    <span class="legend-label">Black</span>
                </div>
            </div>
            
            <div class="legend-section">
                <h4>Activities (Outer Ring)</h4>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #bf5b1b;"></span>
                    <span class="legend-label">Running</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #bf821b;"></span>
                    <span class="legend-label">Chasing</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #f1af2e;"></span>
                    <span class="legend-label">Climbing</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #ffb347;"></span>
                    <span class="legend-label">Eating</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #fdca40;"></span>
                    <span class="legend-label">Foraging</span>
                </div>
                <div class="legend-item">
                    <span class="color-box" style="background-color: #e6a23c;"></span>
                    <span class="legend-label">Other Activities</span>
                </div>
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
            padding: 1.5rem;
            max-width: 100% !important;
            width: 100%;
            margin: 0 auto;
            align-self: flex-start;
        }

        .sunburst-center-section {
            width: 100%;
            height: 100%;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .sunburst-squirrel-img {
            width: 100%;
            max-width: 300px;
            margin-top: 2rem;
        }
        
        .sunburst-squirrel-container {
            width: 100%;
            max-width: 100%;
        }
        
        .sunburst-tooltip {
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
        
        .legend-container, .info-box {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 100%;
        }
        
        .legend-container h3, .info-box h3 {
            margin-top: 0;
            font-size: 20px;
            margin-bottom: 15px;
        }
        
        .legend-container p {
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .reset-button-container {
            margin-top: 20px;
            margin-bottom: 30px;
            text-align: center;
            width: 100%;
            position: relative;
            z-index: 1000;
        }
        
        .sunburst-reset-button {
            background: linear-gradient(135deg, #bf1b1b 0%, #e63e3e 100%);
            color: white;
            border: none;
            border-radius: 30px;
            padding: 12px 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(191, 27, 27, 0.3);
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: relative;
            z-index: 1001;
        }
        
        .sunburst-reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(191, 27, 27, 0.4);
            background: linear-gradient(135deg, #e63e3e 0%, #bf1b1b 100%);
        }
        
        .sunburst-reset-button:active {
            transform: translateY(1px);
            box-shadow: 0 2px 5px rgba(191, 27, 27, 0.4);
        }
        
        .reset-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-radius: 50%;
            position: relative;
        }
        
        .reset-icon:before {
            content: "";
            position: absolute;
            top: -2px;
            left: 50%;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 0 4px 6px 4px;
            border-color: transparent transparent white transparent;
            transform: translateX(-50%) rotate(45deg);
        }
        
        
        /* Make sure our reset button is visible */
        #sunburst-reset-button, .sunburst-reset-button {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Sunburst Legend Styles */
        .sunburst-legend {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
            width: 100%;
        }
        
        .sunburst-legend h3 {
            margin-top: 0;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #bf1b1b;
            padding-bottom: 8px;
            text-align: center;
        }
        
        .legend-section {
            margin-bottom: 20px;
        }
        
        .legend-section h4 {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #333;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            padding-bottom: 5px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .color-box {
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border-radius: 4px;
            border: 1px solid rgba(0,0,0,0.1);
        }
        
        .legend-label {
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .legend-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    // Add CSS to hide any unwanted reset buttons
    const hideResetStyle = document.createElement('style');
    hideResetStyle.textContent = `
        /* Hide any reset buttons in the bottom left corner */
        body > button:not(#sunburst-reset-button):not(#sunburst-backup-reset),
        #sunburst > button,
        button.reset {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(hideResetStyle);

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
                <div style="font-weight: bold; font-size: 16px; color: #bf1b1b; margin-bottom: 8px; border-bottom: 1px solid rgba(191, 27, 27, 0.2); padding-bottom: 4px;">${d.data.name}</div>
                <div style="color: #333; line-height: 1.4;">
                    <div>Path: ${pathDescription.join(" → ")}</div>
                    <div>Count: ${d.value} squirrels</div>
                    <div>Percentage: ${((d.value / root.value) * 100).toFixed(1)}%</div>
                </div>
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
            // Reset to root
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
                
            console.log("Reset sunburst called");
        }

        // Connect the reset button to the resetSunburst function
        d3.select("#sunburst-reset-button").on("click", function() {
            console.log("Reset button clicked");
            resetSunburst();
        });
        
        // Make sure the button is visible
        d3.select("#sunburst-reset-button")
            .style("display", "inline-flex")
            .style("visibility", "visible")
            .style("opacity", "1");
            
        // Create a second reset button if needed - using proper DOM checking
        setTimeout(() => {
            const resetButton = document.getElementById("sunburst-reset-button");
            // Check if button exists and is visible using computed style
            if (!resetButton || window.getComputedStyle(resetButton).display === "none") {
                console.log("Creating backup reset button");
                centerSection.append("button")
                    .attr("id", "sunburst-backup-reset")
                    .attr("class", "backup-reset-button")
                    .style("background", "linear-gradient(135deg, #bf1b1b 0%, #e63e3e 100%)")
                    .style("color", "white")
                    .style("border", "none")
                    .style("border-radius", "30px")
                    .style("padding", "12px 25px")
                    .style("font-size", "16px")
                    .style("font-weight", "bold")
                    .style("cursor", "pointer")
                    .style("margin", "20px auto")
                    .style("display", "block")
                    .text("Reset Zoom")
                    .on("click", resetSunburst);
            }
        }, 500);
        
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