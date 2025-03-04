(function() {
    // Set up dimensions
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create container with controls
    const container = d3.select("#network")
        .append("div")
        .attr("class", "network-container");

    // Create title
    container.append("h2")
        .attr("class", "chart-title")
        .text("Animal Interaction Network");

    // Create controls
    const controls = container.append("div")
        .attr("class", "controls");

    // Add animal count slider
    controls.append("div")
        .attr("class", "control-group")
        .html(`
            <label for="animalCount">Number of top animals to show: <span id="animalCountValue">5</span></label>
            <input type="range" id="animalCount" min="3" max="15" value="5">
        `);

    // Create SVG container
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

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
                .attr("class", "link")
                .attr("stroke-width", d => Math.sqrt(d.value) * 5)
                .attr("stroke", d => d.source.id === "squirrel" || d.target.id === "squirrel" 
                    ? "#e74c3c" : "#95a5a6")
                .attr("stroke-opacity", 0.6);

            // Create the nodes
            const node = svg.append("g")
                .selectAll("g")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", handleNodeClick);

            // Add circles to nodes
            node.append("circle")
                .attr("r", d => Math.sqrt(d.size) * 3)
                .attr("fill", d => d.id === "squirrel" ? "#e74c3c" : "#3498db");

            // Add labels to nodes
            node.append("text")
                .text(d => d.id)
                .attr("x", d => Math.sqrt(d.size) * 3 + 5)
                .attr("y", 3)
                .style("font-family", "sans-serif")
                .style("font-size", "12px")
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
                            // Make connected nodes brighter
                            return node.id === "squirrel" ? "#ff6b6b" : "#48dbfb";
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
                            // Make connected links brighter
                            return l.source.id === "squirrel" || l.target.id === "squirrel" 
                                ? "#ff6b6b" : "#48dbfb";
                        }
                        return "#ddd";
                    })
                    .attr("stroke-opacity", l => 
                        (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1
                    )
                    .attr("stroke-width", l => {
                        const baseWidth = Math.sqrt(l.value) * 5;
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
                    .attr("fill", d => d.id === "squirrel" ? "#e74c3c" : "#3498db")
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
                    .attr("stroke", d => d.source.id === "squirrel" || d.target.id === "squirrel" 
                        ? "#e74c3c" : "#95a5a6")
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
                .node.highlighted circle {
                    stroke-width: 3px;
                    stroke: #2c3e50;
                }

                .link.highlighted {
                    stroke-width: 4px;
                }

                .node text.highlighted {
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
        d3.select("#animalCount").on("input", function() {
            const value = this.value;
            d3.select("#animalCountValue").text(value);
            updateNetwork(+value);
        });

        // Initial render
        updateNetwork(5);
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

        input[type="range"] {
            width: 100%;
            max-width: 300px;
        }

        svg {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .node {
            cursor: pointer;
            transition: all 0.2s;
        }

        .node circle {
            stroke: #fff;
            stroke-width: 2px;
            transition: all 0.2s;
        }

        .node text {
            pointer-events: none;
            transition: all 0.2s;
        }

        .node:hover circle {
            stroke: #2c3e50;
            stroke-width: 3px;
        }

        .link {
            stroke-opacity: 0.6;
            transition: all 0.2s;
        }

        .link:hover {
            stroke-opacity: 1;
        }
    `;
    document.head.appendChild(style);
})();
