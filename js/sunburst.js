(function() {
    // Update dimensions
    const width = 600;  
    const height = 300; 

    // Create main container with grid layout
    const container = d3.select("#sunbust")
        .style("display", "grid")
        .style("grid-template-columns", "1fr 2fr 1fr")  // Changed to 3 columns
        .style("gap", "4rem")
        .style("padding", "0 4rem")
        .style("background", "transparent");

    // Create left section for placeholder
    const leftSection = container.append("div")
        .attr("class", "sunburst-side-section")
        .style("margin-top", "400px")  // Add margin to push text down
        .html(`
            <p>random text to fill the space probabaly somet instruction on how to read thisnckas ashchasdj csabfjash ah asudas d aa sa d a d sd f das sd das das x sd asd as as sad sad as d d sf sd as das d ad as das a</p>
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

    // Create right section for placeholder
    const rightSection = container.append("div")
        .attr("class", "sunburst-side-section")
        .html(`
            <p>random text to fill the space probabaly somet instruction on how to read thisnckas ashchasdj csabfjash ah asudas d aa sa d a d sd f das sd das das x sd asd as as sad sad as d d sf sd as das d ad as das a</p>
            <img src="img/squirrel.png" alt="Squirrel" class="sunburst-squirrel-img">
        `);

    // Update CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .sunburst-title-container {
            padding: 1.5rem 2rem;
            margin-bottom: 2rem;  // Reduced margin
            text-align: center;
            width: 100%;
        }

        .sunburst-title {
            color: black;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }

        .sunburst-side-section {
            font-size: 1.2rem;
            line-height: 1.8;
            padding: 2rem;
            max-width: 300px;
            margin: 0 auto;
            align-self: flex-start;  // Align to top to make margin-top work
        }

        .sunburst-center-section {
            width: 80%;          // Added width constraint
            height: 60%;
            margin: 0 auto;      // Center the section
        }

        .sunburst-squirrel-img {
            width: 100%;
            max-width: 300px;
            margin-top: 2rem;
        }
    `;
    document.head.appendChild(style);

    // Load and process data
    d3.csv("data/individual.csv").then(data => {
        // Process data into hierarchical structure
        const hierarchyData = processData(data);

        // Create partition layout
        const partition = d3.partition()
            .size([2 * Math.PI, width / 2]);

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeRed[9]);

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

        // Add paths
        const paths = svg.selectAll("path")
            .data(root.descendants())
            .enter()
            .append("path")
            .attr("d", arc)
            .style("fill", d => color((d.children ? d : d.parent).data.name))
            .style("opacity", 0.8)
            .style("stroke", "white")
            .style("stroke-width", "2px");

        // Add interactivity
        paths.on("mouseover", function(event, d) {
                d3.select(this)
                    .style("opacity", 1);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .style("opacity", 0.8);
            })
            .on("click", clicked);

        // Click handler for zooming
        function clicked(event, p) {
            // Add zoom functionality
        }
    });

    // Helper function to process data into hierarchical structure
    function processData(data) {
        // Process the data into a hierarchical structure
        // This will need to be customized based on your data structure
        const hierarchy = {
            name: "root",
            children: [
                {
                    name: "Activities",
                    children: [
                        { name: "Running", value: data.filter(d => d.Running === "TRUE").length },
                        { name: "Chasing", value: data.filter(d => d.Chasing === "TRUE").length },
                        { name: "Climbing", value: data.filter(d => d.Climbing === "TRUE").length },
                        { name: "Eating", value: data.filter(d => d.Eating === "TRUE").length },
                        { name: "Foraging", value: data.filter(d => d.Foraging === "TRUE").length }
                    ]
                },
                {
                    name: "Sounds",
                    children: [
                        { name: "Kuks", value: data.filter(d => d.Kuks === "TRUE").length },
                        { name: "Quaas", value: data.filter(d => d.Quaas === "TRUE").length },
                        { name: "Moans", value: data.filter(d => d.Moans === "TRUE").length }
                    ]
                },
                {
                    name: "Tail Movements",
                    children: [
                        { name: "Flags", value: data.filter(d => d['Tail flags'] === "TRUE").length },
                        { name: "Twitches", value: data.filter(d => d['Tail twitches'] === "TRUE").length }
                    ]
                }
            ]
        };
        return hierarchy;
    }
})();
