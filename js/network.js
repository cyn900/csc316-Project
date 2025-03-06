(function() {
    // Set up dimensions
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create visualization directly in the network div
    const network = d3.select("#network");

    // Create title
    network.append("div")
        .attr("class", "network-title-container")
        .append("h2")
        .attr("class", "network-chart-title")
        .text("Animal Interaction");

    // Create grid content container
    const contentGrid = network.append("div")
        .attr("class", "network-content-grid");

    // Create left section for controls and visualization
    const leftSection = contentGrid.append("div")
        .attr("class", "network-left-section");

    // Add controls to left section
    const controls = leftSection.append("div")
        .attr("class", "network-controls");

    controls.append("div")
        .attr("class", "network-control-group")
        .html(`
            <label for="networkAnimalCount">Number of top animals to show: <span id="networkAnimalCountValue">3</span></label>
            <input type="range" id="networkAnimalCount" class="network-range" min="3" max="15" value="3">
        `);

    // Add SVG to left section
    const svg = leftSection.append("svg")
        .attr("class", "network-svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create right section for text
    const rightSection = contentGrid.append("div")
        .attr("class", "network-right-section");

    // Add content to right section
    rightSection.append("h3")
        .attr("class", "network-facts-title")
        .text("Fun Facts:");

    rightSection.append("div")
        .attr("class", "network-facts-content")
        .html(`
            <p>squirrel<br>Sightings: 700</p>
            <p>Connections:<br>human: 100.0%<br>dog: 100.0%</p>
            <p class="network-interaction-text">Interactive Elements: Slider to show the number of top animals to show. You can also move the nodes around. Tooltip showing the detailed information.</p>
        `);

    // Load data
    d3.csv("data/hectare.csv").then(function(data) {
        // Clean and process animal names
        function cleanAnimalName(name) {
            return name.toLowerCase()
                .replace(/[^\w\s]/g, '') // Remove special characters
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .trim()
                .replace(/^(and|or)\s+/, '') // Remove leading "and" or "or"
                .replace(/s$/, ''); // Remove trailing 's'
        }

        // Group similar animals
        function normalizeAnimalName(name) {
            const normalizations = {
                'small bird': ['small bird', 'tiny bird', 'little bird', 'songbird', 'song bird'],
                'bird': ['bird', 'birds', 'small birds', 'other birds'],
                'pigeon': ['pigeon', 'pigeons'],
                'dog': ['dog', 'dogs', 'doggie'],
                'human': ['human', 'humans'],
                'squirrel': ['squirrel', 'squirrels'],
                'rat': ['rat', 'rats'],
                'duck': ['duck', 'ducks'],
                'horse': ['horse', 'horses'],
                'chipmunk': ['chipmunk', 'chipmunks'],
                'sparrow': ['sparrow', 'sparrows'],
                'bluejay': ['blue jay', 'bluejay'],
                'robin': ['robin', 'robins']
            };

            const cleaned = cleanAnimalName(name);
            for (const [normalized, variants] of Object.entries(normalizations)) {
                if (variants.includes(cleaned)) {
                    return normalized;
                }
            }
            return cleaned;
        }

        // Extract and clean animal sightings
        const animalSightings = data.map(d => {
            const animals = d["Other Animal Sightings"] || "";
            const cleanedAnimals = ["squirrel", ...animals.split(",")
                .map(a => normalizeAnimalName(a))
                .filter(a => a !== "" && a !== "squirrel")];
            return [...new Set(cleanedAnimals)]; // Remove duplicates within same sighting
        });

        function updateNetwork(topN) {
            // Count animal frequencies
            const animalCounts = {};
            animalSightings.flat().forEach(animal => {
                animalCounts[animal] = (animalCounts[animal] || 0) + 1;
            });

            // Get top N animals (always including squirrel)
            const topAnimals = ["squirrel", ...Object.entries(animalCounts)
                .filter(([animal]) => animal !== "squirrel")
                .sort(([,a], [,b]) => b - a)
                .slice(0, topN - 1)
                .map(([animal]) => animal)];

            // Calculate co-occurrences between top animals
            const coOccurrences = {};
            topAnimals.forEach(animal1 => {
                coOccurrences[animal1] = {};
                topAnimals.forEach(animal2 => {
                    if (animal1 !== animal2) {
                        const count = animalSightings.filter(sighting =>
                            sighting.includes(animal1) && sighting.includes(animal2)
                        ).length;
                        coOccurrences[animal1][animal2] = count;
                    }
                });
            });

            // Create nodes
            const nodes = topAnimals.map(animal => ({
                id: animal,
                group: animal === "squirrel" ? 1 : 2,
                size: animalCounts[animal]
            }));

            // Create links with minimum threshold for visibility
            const links = [];
            topAnimals.forEach((animal1, i) => {
                topAnimals.slice(i + 1).forEach(animal2 => {
                    const count = coOccurrences[animal1][animal2];
                    const totalSightings = Math.min(animalCounts[animal1], animalCounts[animal2]);
                    const strength = count / totalSightings;

                    if (strength > 0.1) {
                        links.push({
                            source: animal1,
                            target: animal2,
                            value: strength
                        });
                    }
                });
            });

            // Clear previous network
            svg.selectAll("*").remove();

            // Create force simulation
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-1000))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.size) * 4));

            // Create the links
            const link = svg.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("class", "network-link")
                .attr("stroke-width", d => Math.sqrt(d.value) * 6)
                .attr("stroke", "#bf1b1b")
                .attr("stroke-opacity", 0.8);

            // Create the nodes
            const node = svg.append("g")
                .selectAll("g")
                .data(nodes)
                .enter().append("g")
                .attr("class", "network-node")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", handleNodeClick);

            // Add circles to nodes
            node.append("circle")
                .attr("r", d => Math.sqrt(d.size) * 4)
                .attr("fill", "#bf1b1b");

            // Add labels to nodes
            node.append("text")
                .text(d => d.id)
                .attr("x", d => Math.sqrt(d.size) * 3 + 5)
                .attr("y", 3)
                .style("font-family", "sans-serif")
                .style("font-size", "14px")
                .style("font-weight", d => d.id === "squirrel" ? "bold" : "normal");

            // Add tooltips
            node.append("title")
                .text(d => {
                    const connections = [...links.filter(l => 
                        l.source.id === d.id || l.target.id === d.id
                    )].map(l => {
                        const otherAnimal = l.source.id === d.id ? l.target.id : l.source.id;
                        return `${otherAnimal}: ${(l.value * 100).toFixed(1)}%`;
                    }).join('\n');
                    return `${d.id}\nSightings: ${animalCounts[d.id]}\nConnections:\n${connections}`;
                });

            // Handle node click
            let selectedNode = null;
            function handleNodeClick(event, d) {
                if (selectedNode === d.id) {
                    // If clicking the same node again, reset the view
                    selectedNode = null;
                    resetHighlight();
                } else {
                    // Highlight the selected node and its connections
                    selectedNode = d.id;
                    highlightConnections(d);
                }
                event.stopPropagation();
            }

            // Add click handler to svg background to reset highlight
            svg.on("click", () => {
                selectedNode = null;
                resetHighlight();
            });

            function getConnectedNodes(nodeId) {
                const connected = new Set();
                links.forEach(link => {
                    if (link.source.id === nodeId) {
                        connected.add(link.target.id);
                    } else if (link.target.id === nodeId) {
                        connected.add(link.source.id);
                    }
                });
                connected.add(nodeId); // Add the selected node itself
                return connected;
            }

            function highlightConnections(d) {
                const connectedNodes = getConnectedNodes(d.id);

                // Update nodes
                node.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("fill", node => {
                        if (connectedNodes.has(node.id)) {
                            return "#bf1b1b";
                        }
                        return "#ddd";
                    })
                    .attr("r", node => {
                        const baseSize = Math.sqrt(node.size) * 3;
                        return connectedNodes.has(node.id) ? baseSize * 1.2 : baseSize;
                    });

                // Update labels
                node.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("opacity", node => connectedNodes.has(node.id) ? 1 : 0.3)
                    .style("font-size", node => 
                        connectedNodes.has(node.id) ? "14px" : "12px"
                    )
                    .style("font-weight", node => 
                        connectedNodes.has(node.id) ? "bold" : "normal"
                    );

                // Update links
                link.transition()
                    .duration(200)
                    .attr("stroke", l => {
                        if (l.source.id === d.id || l.target.id === d.id) {
                            return "#bf1b1b";
                        }
                        return "#ddd";
                    })
                    .attr("stroke-opacity", l => 
                        (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1
                    )
                    .attr("stroke-width", l => {
                        const baseWidth = Math.sqrt(l.value) * 6;
                        return (l.source.id === d.id || l.target.id === d.id) 
                            ? baseWidth * 1.5 : baseWidth;
                    });

                // Add glow effect to connected nodes
                node.selectAll("circle")
                    .filter(node => connectedNodes.has(node.id))
                    .style("filter", "url(#glow)");
            }

            function resetHighlight() {
                // Reset nodes
                node.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("fill", "#bf1b1b")
                    .attr("r", d => Math.sqrt(d.size) * 3)
                    .style("filter", null);

                // Reset labels
                node.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("font-size", "12px")
                    .style("font-weight", d => d.id === "squirrel" ? "bold" : "normal");

                // Reset links
                link.transition()
                    .duration(200)
                    .attr("stroke", "#bf1b1b")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", d => Math.sqrt(d.value) * 5);
            }

            // Add glow filter definition
            const defs = svg.append("defs");
            const filter = defs.append("filter")
                .attr("id", "glow");

            filter.append("feGaussianBlur")
                .attr("stdDeviation", "3")
                .attr("result", "coloredBlur");

            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode")
                .attr("in", "coloredBlur");
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

            // Update CSS styles
            style.textContent += `
                .network-node.highlighted circle {
                    stroke-width: 3px;
                    stroke: #2c3e50;
                }

                .network-link.highlighted {
                    stroke-width: 4px;
                }

                .network-node text.highlighted {
                    font-weight: bold;
                    font-size: 14px;
                }
            `;

            // Update positions on each tick
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("transform", d => `translate(${d.x},${d.y})`);
            });

            // Drag functions
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
        }

        // Add slider event listener
        d3.select("#networkAnimalCount").on("input", function() {
            const value = this.value;
            d3.select("#networkAnimalCountValue").text(value);
            updateNetwork(+value);
        });

        // Initial render
        updateNetwork(3);
    });

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        #network {
            width: 100%;
            margin: 0;
            padding: 0 4rem;
            background: transparent;
        }

        .network-title-container {
            background: #bf1b1b;
            padding: 1rem 2rem;
            margin-bottom: 2rem;
            text-align: center;
            width: calc(60% - 2rem);
        }

        .network-chart-title {
            color: #ffffff !important;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }

        .network-content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 4rem;
            background: transparent;
        }

        .network-left-section {
            display: flex;
            flex-direction: column;
            gap: 3rem;
            background: transparent;
            width: 100%;
            max-width: 800px;
            margin: 0;
        }

        .network-controls {
            padding: 0;
            background: transparent;
        }

        .network-control-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .network-control-group label {
            color: #000;
            font-weight: 500;
            font-size: 1.1rem;
        }

        .network-range {
            width: 100%;
            max-width: 100%;
            height: 6px;
            background: rgba(0, 0, 0, 0.1);
            -webkit-appearance: none;
            appearance: none;
            border-radius: 3px;
        }

        .network-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #bf1b1b;
            border-radius: 50%;
            cursor: pointer;
        }

        .network-svg {
            width: 100%;
            height: auto;
            aspect-ratio: 4/3;
            background: transparent !important;
        }

        .network-right-section {
            padding: 0;
        }

        .network-facts-title {
            font-size: 2rem;
            font-weight: normal;
            margin-bottom: 2rem;
            font-style: italic;
        }

        .network-facts-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .network-facts-content p {
            margin: 0;
            line-height: 1.6;
        }

        .network-interaction-text {
            margin-top: 2rem !important;
            font-size: 0.9rem;
        }

        .network-node circle {
            stroke: none;
            transition: all 0.2s;
            fill: #bf1b1b;
        }

        .network-node text {
            pointer-events: none;
            transition: all 0.2s;
            font-size: 14px;
            fill: #000;
        }

        .network-link {
            stroke-opacity: 0.8;
            stroke-width: 2px;
            transition: all 0.2s;
        }

        .network-link:hover {
            stroke-opacity: 1;
        }

        @media (max-width: 768px) {
            .network-content-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
})();
