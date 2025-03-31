(function() {
    // Set up dimensions and margins
    const width = 1200;
    const height = 700;
    const margin = { top: 40, right: 100, bottom: 40, left: 100 };
    const timelineHeight = 40;
    const timelineMargin = { top: 10, bottom: 10 };

    // Define variables at the top level
    let processedData = [];
    let currentMetric;
    let x, y, line, xAxis, yAxis, xGrid, yGrid, chartGroup, timeScale, brushGroup;
    let rawData;

    const metrics = [
        { id: 'avgCount', label: 'Average Count', field: 'Number of Squirrels', agg: 'mean' },
        { id: 'totalCount', label: 'Total Count', field: 'Number of Squirrels', agg: 'sum' },
        { id: 'avgTime', label: 'Average Time', field: 'Total Time of Sighting', agg: 'mean' },
        { id: 'totalTime', label: 'Total Time', field: 'Total Time of Sighting', agg: 'sum' }
    ];

    currentMetric = metrics[0];  // Initialize current metric

    // Create main container with grid layout
    const container = d3.select("#linechart")
        .style("display", "grid")
        .style("grid-template-columns", "1fr 3fr")
        .style("gap", "2rem")
        .style("padding", "2rem")
        .style("width", "100%")
        .style("max-width", "1600px")
        .style("margin", "0 auto");

    // Create left section for text
    const leftSection = container.append("div")
        .attr("class", "linechart-left-section")
        .html(`
            <div class="linechart-text-container">
                <h2 class="linechart-heading">Temperature's Impact</h2>
                <div class="linechart-description">
                    <p>This visualization shows how temperature affects squirrel behavior in Central Park. The line graph reveals patterns in:</p>
                    <ul>
                        <li>Activity levels across different temperatures</li>
                        <li>Time spent in specific behaviors</li>
                        <li>Population distribution throughout the day</li>
                    </ul>
                    <p>Use the interactive features to explore how squirrels adapt their behavior to temperature changes.</p>
                </div>
            </div>
        `);

    // Update the center section
    const centerSection = container.append("div")
        .attr("class", "linechart-center");

    // Add title
    centerSection.append("h2")
        .attr("class", "linechart-title")
        .text("SQUIRRELS SIGHTINGS");

    // Add metric selection buttons before the SVG
    const buttonContainer = centerSection.append("div")
        .attr("class", "metric-buttons");

    // Create SVG container
    const svg = centerSection.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("background", "white")
        .style("border-radius", "8px")
        .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)");

    // Add tooltip div to the container
    const tooltipDiv = d3.select("#linechart")
        .append("div")
        .attr("class", "timeline-tooltip")
        .style("opacity", 0);

    let tooltipHideTimeout = null;
    let brushTooltipHideTimeout = null;

    function processDataForMetric(data, metric) {
        const groupedData = d3.group(data, d => Math.round(d.temperature));
        return Array.from(groupedData, ([temp, values]) => ({
            temperature: +temp,
            value: metric.agg === 'mean' 
                ? d3.mean(values, d => d.value)
                : d3.sum(values, d => d.value)
        })).sort((a, b) => a.temperature - b.temperature);
    }

    function processRawData(data, metric) {
        return data.map(d => {
            // Parse date from MMDDYYYY format
            const dateStr = d["Date"];
            const month = dateStr.substring(0, 2);
            const day = dateStr.substring(2, 4);
            const year = dateStr.substring(4);
            const date = new Date(year, parseInt(month) - 1, day);  // month is 0-based in JS Date

            return {
                date: date,
                temperature: +d["Temperature Celsius"],
                value: +d[metric.field] || 0
            };
        })
        .filter(d => !isNaN(d.date.getTime()) && !isNaN(d.temperature))  // Filter out invalid dates and temperatures
        .sort((a, b) => a.date - b.date);
    }

    function updateChart(data) {
        if (!data || !data.length || !x || !y) return;  // Add more safety checks

        try {
            // Update scales
            x.domain([d3.min(data, d => d.temperature) - 1, d3.max(data, d => d.temperature) + 1]);
            y.domain([0, d3.max(data, d => d.value) * 1.1]);

            // Update axes with transitions
            xAxis.transition().duration(750).call(d3.axisBottom(x).ticks(10));
            yAxis.transition().duration(750).call(d3.axisLeft(y).ticks(8));

            // Update y-axis label
            yAxis.select(".y-axis-label")
                .text(currentMetric.label + (currentMetric.field === 'Total Time of Sighting' ? ' (minutes)' : ''));

            // Update grid
            xGrid.transition().duration(750)
                .call(d3.axisBottom(x)
                    .ticks(10)
                    .tickSize(-(height - margin.top - margin.bottom - timelineHeight - timelineMargin.top))
                    .tickFormat(""));
            
            yGrid.transition().duration(750)
                .call(d3.axisLeft(y)
                    .ticks(8)
                    .tickSize(-(width - margin.left - margin.right))
                    .tickFormat(""));

            // Update line
            const path = chartGroup.selectAll(".line")
                .data([data]);

            path.enter()
                .append("path")
                .attr("class", "line")
                .merge(path)
                .transition()
                .duration(750)
                .attr("fill", "none")
                .attr("stroke", "#bf1b1b")
                .attr("stroke-width", 3)
                .attr("d", line);

            path.exit().remove();

            // Update dots
            const dots = chartGroup.selectAll("circle")
                .data(data);

            const dotsEnter = dots.enter()
                .append("circle");

            dots.merge(dotsEnter)
                .transition()
                .duration(750)
                .attr("cx", d => x(d.temperature))
                .attr("cy", d => y(d.value))
                .attr("r", 4)
                .attr("fill", "#bf1b1b")
                .attr("stroke", "white")
                .attr("stroke-width", 2);

            dots.exit().remove();

            // Update hover behavior
            chartGroup.selectAll("circle")
                .on("mouseover", function(event, d) {
                    // Cancel any pending tooltip hide for circles
                    if (tooltipHideTimeout) {
                        clearTimeout(tooltipHideTimeout);
                        tooltipHideTimeout = null;
                    }

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 6);

                    svg.selectAll(".tooltip-group").remove();

                    // Calculate all metrics for this temperature
                    const tempData = rawData.filter(item => 
                        Math.round(+item["Temperature Celsius"]) === Math.round(d.temperature)
                    );

                    const allMetrics = metrics.map(metric => {
                        let value;
                        if (metric.agg === 'mean') {
                            value = d3.mean(tempData, item => +item[metric.field] || 0);
                        } else {
                            value = d3.sum(tempData, item => +item[metric.field] || 0);
                        }
                        return {
                            label: metric.label,
                            value: value,
                            isTime: metric.field === 'Total Time of Sighting',
                            isCurrentMetric: metric.id === currentMetric.id
                        };
                    });

                    const tooltip = svg.append("g")
                        .attr("class", "tooltip-group")
                        .attr("transform", `translate(${x(d.temperature)},${y(d.value) - 15})`);

                    // Make tooltip background larger to accommodate all metrics
                    tooltip.append("rect")
                        .attr("class", "tooltip-bg")
                        .attr("x", -120)
                        .attr("y", -85)
                        .attr("width", 240)
                        .attr("height", 115)
                        .attr("fill", "white")
                        .attr("stroke", "#bf1b1b")
                        .attr("stroke-width", 1.5)
                        .attr("rx", 6);

                    const tooltipText = tooltip.append("text")
                        .attr("class", "tooltip-text")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "18px")
                        .attr("fill", "#333");

                    // Add temperature
                    tooltipText.append("tspan")
                        .attr("x", 0)
                        .attr("dy", -60)
                        .attr("font-weight", "bold")
                        .attr("font-size", "18px")
                        .attr("fill", "#bf1b1b")
                        .text(`Temperature: ${d.temperature}°C`);

                    // Add all metrics
                    allMetrics.forEach((metric, i) => {
                        tooltipText.append("tspan")
                            .attr("x", 0)
                            .attr("dy", 18)
                            .attr("fill", metric.isCurrentMetric ? "#bf1b1b" : "#333")
                            .attr("font-weight", metric.isCurrentMetric ? "bold" : "normal")
                            .attr("font-size", "15px")
                            .text(`${metric.label}: ${metric.value?.toFixed(1) || 0}${metric.isTime ? ' min' : ''}`);
                    });
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 4);

                    // Delay removal by 500ms (0.5sec)
                    tooltipHideTimeout = setTimeout(() => {
                        svg.selectAll(".tooltip-group").remove();
                    }, 500);
                });
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    function brushed(event) {
        if (!event.selection) {
            // If the brush is cleared, reset to full extent
            brushGroup.call(brush.move, [margin.left, width - margin.right]);
            return;
        }

        // Get the current selection
        const [x0, x1] = event.selection.map(timeScale.invert);

        // Ensure minimum width of the brush (e.g., 1 day)
        const minWidth = timeScale(d3.timeDay.offset(timeScale.invert(0), 1)) - timeScale(timeScale.invert(0));
        if (event.selection[1] - event.selection[0] < minWidth) {
            const center = (event.selection[0] + event.selection[1]) / 2;
            const newX0 = center - minWidth / 2;
            const newX1 = center + minWidth / 2;
            brushGroup.call(brush.move, [newX0, newX1]);
            return;
        }

        // Filter and update the data
        const filteredData = processedData.filter(d => d.date >= x0 && d.date <= x1);
        const newData = processDataForMetric(filteredData, currentMetric);
        updateChart(newData);
    }

    // Load and process data
    d3.csv("data/hectare.csv").then(function(data) {
        // Store the raw filtered data
        rawData = data.filter(d => d["Temperature Celsius"] && d["Date"] && !isNaN(+d["Temperature Celsius"]));

        // Initial data processing
        processedData = processRawData(rawData, currentMetric);
        const averagedData = processDataForMetric(processedData, currentMetric);

        // Create scales first
        x = d3.scaleLinear()
            .domain([
                d3.min(averagedData, d => d.temperature) - 1,
                d3.max(averagedData, d => d.temperature) + 1
            ])
            .range([margin.left, width - margin.right]);

        y = d3.scaleLinear()
            .domain([0, d3.max(averagedData, d => d.value) * 1.1])
            .range([height - margin.bottom - timelineHeight - timelineMargin.top, margin.top]);

        // Create line generator
        line = d3.line()
            .x(d => x(d.temperature))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // Create axes
        xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom - timelineHeight - timelineMargin.top})`)
            .call(d3.axisBottom(x).ticks(10))
            .call(g => g.append("text")
                .attr("x", width - margin.right)
                .attr("y", -10)
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .attr("font-size", "30px")
                .attr("font-weight", "bold")
                .text("Temperature (°C)"));

        yAxis = svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(8))
            .call(g => g.append("text")
                .attr("class", "y-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -(height - margin.bottom - timelineHeight - timelineMargin.top) / 2)
                .attr("y", -60)
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("font-size", "30px")
                .attr("font-weight", "bold")
                .text(currentMetric.label));

        // Add grid lines
        xGrid = svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height - margin.bottom - timelineHeight - timelineMargin.top})`)
            .call(d3.axisBottom(x)
                .ticks(10)
                .tickSize(-(height - margin.top - margin.bottom - timelineHeight - timelineMargin.top))
                .tickFormat(""))
            .style("stroke-opacity", 0.1);

        yGrid = svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y)
                .ticks(8)
                .tickSize(-(width - margin.left - margin.right))
                .tickFormat(""))
            .style("stroke-opacity", 0.1);

        // Create chart group
        chartGroup = svg.append("g").attr("class", "chart-group");

        // Create time scale
        timeScale = d3.scaleTime()
            .domain(d3.extent(processedData, d => d.date))
            .range([margin.left, width - margin.right]);

        // Add timeline axis first (bottom layer)
        const timelineAxis = svg.append("g")
            .attr("class", "timeline-axis")
            .attr("transform", `translate(0,${height - timelineHeight - timelineMargin.bottom})`)
            .call(d3.axisBottom(timeScale)
                .ticks(10)
                .tickFormat(d3.timeFormat("%m/%d")));

        // Create timeline brush with updated configuration
        const brush = d3.brushX()
            .extent([[margin.left, height - timelineHeight - timelineMargin.bottom], 
                    [width - margin.right, height - timelineMargin.bottom]])
            .on("start brush end", brushed);  // Handle all brush events

        brushGroup = svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [margin.left, width - margin.right]);

        // Add brush handle styling and ensure they're visible
        brushGroup.selectAll(".handle")
            .attr("fill", "#bf1b1b")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("pointer-events", "all");  // Ensure handles can receive events

        brushGroup.select(".overlay")
            .on("mousemove", function(event) {
                // Cancel any pending hide for the brush tooltip
                if (brushTooltipHideTimeout) {
                    clearTimeout(brushTooltipHideTimeout);
                    brushTooltipHideTimeout = null;
                }

                const [x0] = d3.pointer(event);
                const date = timeScale.invert(x0);
                const nearestData = findNearestData(date);

                if (nearestData) {
                    const formattedDate = d3.timeFormat("%B %d, %Y")(nearestData.date);
                    const value = nearestData.value.toFixed(1);

                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);

                    tooltipDiv.html(`Date: ${formattedDate}<br/>Value: ${value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", function() {
                // Delay the hide for the tooltip div by 500ms
                brushTooltipHideTimeout = setTimeout(() => {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                }, 500);
            });

        brushGroup.select(".selection")
            .attr("pointer-events", "all")
            .style("cursor", "grab")
            .on("mousedown.drag", function() {
                d3.select(this).style("cursor", "grabbing");
            })
            .on("mouseup.drag", function() {
                d3.select(this).style("cursor", "grab");
            });

        // Add the hover functionality to the brush overlay
        brushGroup.select(".overlay")
            .on("mousemove", function(event) {
                const [x0] = d3.pointer(event);
                const date = timeScale.invert(x0);
                const nearestData = findNearestData(date);
                
                if (nearestData) {
                    const formattedDate = d3.timeFormat("%B %d, %Y")(nearestData.date);
                    const value = nearestData.value.toFixed(1);
                    
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", .9);
                    
                    tooltipDiv.html(`Date: ${formattedDate}<br/>Value: ${value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", function() {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Helper function to find nearest data point
        function findNearestData(date) {
            if (!processedData.length) return null;
            
            return processedData.reduce((prev, curr) => {
                const prevDiff = Math.abs(prev.date - date);
                const currDiff = Math.abs(curr.date - date);
                return currDiff < prevDiff ? curr : prev;
            });
        }

        // Add metric buttons
        buttonContainer.selectAll("button")
            .data(metrics)
            .enter()
            .append("button")
            .attr("class", d => `metric-button ${d.id === 'avgCount' ? 'active' : ''}`)
            .text(d => d.label)
            .on("click", function(event, d) {
                buttonContainer.selectAll(".metric-button").classed("active", false);
                d3.select(this).classed("active", true);
                currentMetric = d;
                processedData = processRawData(rawData, currentMetric);
                const selection = d3.brushSelection(brushGroup.node());
                if (selection) {
                    const [x0, x1] = selection.map(timeScale.invert);
                    const filteredData = processedData.filter(d => d.date >= x0 && d.date <= x1);
                    updateChart(processDataForMetric(filteredData, currentMetric));
                } else {
                    updateChart(processDataForMetric(processedData, currentMetric));
                }
            });

        // Initial chart render
        updateChart(averagedData);
    });

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.cdnfonts.com/css/cocogoose');
    
    .linechart-left-section {
        padding: 2rem;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-top: 4rem;
    }

    .linechart-heading {
        font-family: "COCOGOOSE", sans-serif;
        font-size: 2.5rem;
        color: #bf1b1b;
        margin-bottom: 1.5rem;
        line-height: 1.2;
    }

    .linechart-description {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #333;
    }

    .linechart-description ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }

    .linechart-description li {
        margin-bottom: 0.5rem;
    }

    .linechart-text.left,
    .linechart-text.right {
        display: none;
    }

    .linechart-title {
        color: #bf1b1b;
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin: 0 0 2rem 0;
        font-family: "COCOGOOSE", sans-serif;
        line-height: 1.2;
    }

    .linechart-center {
        grid-column: 2;
        width: 100%;
        min-width: 0;  /* Allow proper scaling */
    }

    .filter-text {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-top: 2rem;
        text-align: center;
        color: #666;
    }

    .linechart-filters {
        margin-top: 2rem;
        text-align: center;
    }

    .grid line {
        stroke: rgba(0, 0, 0, 0.1);
        stroke-width: 1px;
    }

    .grid path {
        stroke-width: 0;
    }

    .brush .selection {
        fill: #bf1b1b;
        fill-opacity: 0.2;
        stroke: #bf1b1b;
        stroke-width: 2px;
        cursor: grab;
        pointer-events: all;
    }

    .brush .handle {
        fill: #bf1b1b;
        stroke: #fff;
        stroke-width: 2px;
        cursor: ew-resize;
        pointer-events: all;
    }

    .brush .overlay {
        cursor: crosshair;
        pointer-events: all;
    }

    .timeline-axis text {
        font-size: 20px;
        font-weight: 500;
    }

    .timeline-axis path,
    .timeline-axis line {
        stroke: #666;
        stroke-width: 2px;
    }

    /* Make the chart elements more prominent */
    .line {
        stroke-width: 3px;
    }

    circle {
        stroke-width: 2px;
    }

    .x-axis text,
    .y-axis text {
        font-size: 20px !important;
        font-weight: 500;
    }

    .x-axis path,
    .y-axis path,
    .x-axis line,
    .y-axis line {
        stroke-width: 2px;
        stroke: #333;
    }

    .tooltip {
        font-weight: 500;
        font-size: 14px !important;
    }

    /* Ensure the SVG container scales properly */
    svg {
        display: block;
        width: 100%;
        height: auto;
    }

    .metric-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .metric-button {
        padding: 0.5rem 1rem;
        border: 2px solid #bf1b1b;
        border-radius: 4px;
        background: white;
        color: #bf1b1b;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .metric-button:hover {
        background: #bf1b1b;
        color: white;
    }

    .metric-button.active {
        background: #bf1b1b;
        color: white;
    }

    /* Update existing styles to accommodate buttons */
    .linechart-center {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .timeline-tooltip {
        position: absolute;
        text-align: center;
        padding: 15px;
        font-size: 15px;
        background: white;
        border: 2px solid #bf1b1b;
        border-radius: 6px;
        pointer-events: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        min-width: 250px;
        max-width: 300px;
    }

    /* Update axis label and tick styles */
    .x-axis .tick text,
    .y-axis .tick text {
        font-size: 20px !important;
    }

    /* Make axis labels more prominent */
    .x-axis text,
    .y-axis .y-axis-label {
        font-size: 30px !important;
        font-weight: bold !important;
    }

    /* Update timeline axis text */
    .timeline-axis text {
        font-size: 20px;
        font-weight: 500;
    }
    `;
    document.head.appendChild(style);
})();
