(function() {
    // Set up dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 100, bottom: 60, left: 100 };

    // Create main container with grid layout
    const container = d3.select("#linechart")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(3, 1fr)")  // Three equal columns
        .style("gap", "2rem")
        .style("padding", "2rem 4rem");

    // Add left text
    container.append("div")
        .attr("class", "linechart-text left")
        .text("let's try to see");

    // Create center section for title and chart
    const centerSection = container.append("div")
        .attr("class", "linechart-center");

    // Add title
    centerSection.append("h2")
        .attr("class", "linechart-title")
        .text("TEMPERATURE REPORT");

    // Create SVG container
    const svg = centerSection.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    // Add right text
    container.append("div")
        .attr("class", "linechart-text right")
        .text("instead...");

    // Add filter section below the chart
    const filterSection = centerSection.append("div")
        .attr("class", "linechart-filters");

    // Add filter text
    filterSection.append("p")
        .attr("class", "filter-text")
        .html(`
            Interactive Elements: Filter by activity (running/chasing/etc) and color (black/gray/cinnamon/etc), to see how
            different factors affect the count.
        `);

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.cdnfonts.com/css/cocogoose')
    
        .linechart-text {
            font-size: 2rem;
            font-weight: bold;
            padding-top: 2rem;
        }

        .linechart-text.left {
            text-align: right;
        }

        .linechart-text.right {
            text-align: left;
        }

        .linechart-title {
            color: #bf1b1b;
            font-size: 3rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2rem;
            font-family: "COCOGOOSE", sans-serif;
        }

        .linechart-center {
            grid-column: 2;
            width: 100%;
        }

        .filter-text {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-top: 2rem;
            text-align: center;
        }

        .linechart-filters {
            margin-top: 2rem;
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // Placeholder data for the line chart
    const data = Array.from({length: 30}, (_, i) => ({
        temperature: i,
        count: Math.random() * 200 + 50
    }));

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, 30])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, 300])
        .range([height - margin.bottom, margin.top]);

    // Create line generator
    const line = d3.line()
        .x(d => x(d.temperature))
        .y(d => y(d.count))
        .curve(d3.curveNatural);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5))
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -10)
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("temperature"));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .call(g => g.append("text")
            .attr("x", 10)
            .attr("y", margin.top)
            .attr("fill", "black")
            .text("# of appearance"));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#bf1b1b")
        .attr("stroke-width", 2)
        .attr("d", line);
})();
