(function() {
    // Set up dimensions
    const width = 600;
    const height = 450;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create visualization directly in the network div
    const network = d3.select("#network");

    // Create title - make it wider and centered
    network.append("div")
        .attr("class", "network-title-container")
        .append("h2")
        .attr("class", "network-chart-title")
        .text("ANIMAL INTERACTION");

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
            <label for="networkAnimalCount">Number of top animals to show: <span id="networkAnimalCountValue">8</span></label>
            <input type="range" id="networkAnimalCount" class="network-range" min="3" max="20" value="8">
        `);

    // Add SVG to left section
    const svg = leftSection.append("svg")
        .attr("class", "network-svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("background", "white")
        .style("border-radius", "8px")
        .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)");

    // Create right section for text
    const rightSection = contentGrid.append("div")
        .attr("class", "network-right-section");

    // Add content to right section
    rightSection.html(`
        <div class="network-info-container">
            <div id="network-info-display">
                
                <div class="network-explanation">
                    <p><strong>About the visualization:</strong></p>
                    <p>• Click on a node to see detailed information about that animal's interactions</p>
                    <p>• Each node represents an animal species observed in Central Park</p>
                    <p>• Connections show which animals are frequently seen together</p>
                    <p>• Percentages indicate how often two animals are seen together relative to their total sightings</p>
                    <p>• Thicker lines indicate stronger connections</p>
                </div>
            </div>
        </div>
        <div class="network-scroll-indicator">
            <div class="network-scroll-arrow"></div>
            <div class="network-scroll-text">Scroll for more</div>
        </div>
    `);

    // Move the updateInfoDisplay function outside of the d3.csv callback
    // so it's accessible in the global scope of the IIFE
    let animalCounts = {};
    let coOccurrences = {};
    let links = [];

    // Create a function to update the info display when a node is clicked
    function updateInfoDisplay(d) {
        const infoDisplay = d3.select("#network-info-display");
        
        if (!d) {
            // Show default text with current animal count
            const currentCount = d3.select("#networkAnimalCount").property("value");
            infoDisplay.html(`
                
                <div class="network-explanation">
                    <p><strong>About the visualization:</strong></p>
                    <p>• Click on a node to see detailed information about that animal's interactions.</p>
                    <p>• Each node represents an animal species observed in Central Park</p>
                    <p>• Connections show which animals are frequently seen together</p>
                    <p>• Percentages indicate how often two animals are seen together relative to their total sightings</p>
                    <p>• Thicker lines indicate stronger connections</p>
                </div>
            `);
            return;
        }
        
        // Get connections for this animal
        const connections = links.filter(l => 
            l.source.id === d.id || l.target.id === d.id
        ).map(l => {
            const otherAnimal = l.source.id === d.id ? l.target : l.source;
            return {
                name: otherAnimal.id,
                value: l.value,
                count: coOccurrences[d.id][otherAnimal.id] || coOccurrences[otherAnimal.id][d.id]
            };
        }).sort((a, b) => b.value - a.value);
        
        // Create HTML for the info display
        let html = `
            <h4 class="network-animal-name">${d.id}</h4>
            <p>Total sightings: ${animalCounts[d.id]}</p>
            
            <div class="network-connections">
                <p><strong>Connections:</strong></p>
                <ul class="network-connection-list">
        `;
        
        connections.forEach(conn => {
            html += `
                <li>
                    <span class="network-connection-name">${conn.name}</span>: 
                    <span class="network-connection-value">${(conn.value * 100).toFixed(1)}%</span>
                    <span class="network-connection-count">(${conn.count} shared sightings)</span>
                </li>
            `;
        });
        
        html += `
                </ul>
            </div>
            
            <div class="network-percentage-explanation">
    
            `;
        
        
        html += `
            </div>
        `;
        
        infoDisplay.html(html);
    }

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
            // Update global variables
            animalCounts = {};
            animalSightings.flat().forEach(animal => {
                animalCounts[animal] = (animalCounts[animal] || 0) + 1;
            });

            // Get top N animals (always including squirrel)
            const topAnimals = ["squirrel", ...Object.entries(animalCounts)
                .filter(([animal]) => animal !== "squirrel")
                .sort(([,a], [,b]) => b - a)
                .slice(0, topN - 1)
                .map(([animal]) => animal)];

            // Update global coOccurrences
            coOccurrences = {};
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

            // Update global links
            links = [];
            topAnimals.forEach((animal1, i) => {
                topAnimals.slice(i + 1).forEach(animal2 => {
                    const count = coOccurrences[animal1][animal2];
                    // Calculate the total number of sightings where both animals could have been seen together
                    const totalPossibleCooccurrences = animalSightings.filter(sighting =>
                        sighting.includes(animal1) || sighting.includes(animal2)
                    ).length;
                    const strength = count / totalPossibleCooccurrences;

                    // Always include links to/from squirrel, and include other links if they have any co-occurrences
                    if (animal1 === "squirrel" || animal2 === "squirrel" || count > 0) {
                        links.push({
                            source: animal1,
                            target: animal2,
                            value: strength
                        });
                    }
                });
            });

            // Create nodes array properly
            const nodes = topAnimals.map(animal => ({
                id: animal,
                group: animal === "squirrel" ? 1 : 2,
                size: animalCounts[animal]
            }));

            // Clear previous network
            svg.selectAll("*").remove();

            // Create separate groups for links, nodes, and labels with specific order
            const linkGroup = svg.append("g").attr("class", "link-group");
            const nodeGroup = svg.append("g").attr("class", "node-group");
            const labelGroup = svg.append("g").attr("class", "label-group");

            // Create the links
            const link = linkGroup.selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("class", "network-link")
                .attr("stroke-width", d => Math.sqrt(d.value) * 4)
                .attr("stroke", "#bf1b1b")
                .attr("stroke-opacity", 0.8);

            // Create the node circles
            const node = nodeGroup.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("r", d => Math.sqrt(d.size) * 2.5)
                .attr("fill", d => d.id === "squirrel" ? "#D2691E" : "#bf1b1b")
                .attr("class", d => d.id === "squirrel" ? "squirrel-node" : "animal-node")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", handleNodeClick);

            // Create labels with dynamic positioning
            const label = labelGroup.selectAll("text")
                .data(nodes)
                .enter().append("text")
                .text(d => d.id)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-family", "sans-serif")
                .style("font-size", "14px")  // Set a consistent font size for all labels
                .style("fill", "#000000")
                .style("font-weight", d => d.id === "squirrel" ? "bold" : "normal")
                .style("pointer-events", "none")
                .attr("transform", d => {
                    const radius = Math.sqrt(d.size) * 2.5;
                    const textLength = d.id.length * 6;
                    // Position labels to the right of nodes if they don't fit inside
                    return radius * 2 > textLength ? 
                        `translate(${d.x},${d.y})` : 
                        `translate(${d.x + radius + 5},${d.y})`;
                });

            // Handle node click
            let selectedNode = null;
            function handleNodeClick(event, d) {
                const isFirstClick = !selectedNode; // Check before updating selectedNode
                
                if (selectedNode === d.id) {
                    // If clicking the same node again, reset the view
                    selectedNode = null;
                    resetHighlight();
                    updateInfoDisplay(null);
                } else {
                    // Highlight the selected node and its connections
                    selectedNode = d.id;
                    highlightConnections(d, isFirstClick);
                    updateInfoDisplay(d);
                }
                event.stopPropagation();
            }

            // Add click handler to svg background to reset highlight
            svg.on("click", () => {
                selectedNode = null;
                resetHighlight();
                updateInfoDisplay(null);
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

            function highlightConnections(d, isFirstClick) {
                const connectedNodes = getConnectedNodes(d.id);
                const duration = isFirstClick ? 0 : 200;

                // Update node circles immediately for first click
                nodeGroup.selectAll("circle")
                    .transition()
                    .duration(duration)
                    .attr("fill", node => {
                        if (node.id === "squirrel") return "#D2691E";
                        if (connectedNodes.has(node.id)) {
                            return "#bf1b1b";
                        }
                        return "#dddddd";
                    })
                    .attr("opacity", node => connectedNodes.has(node.id) ? 1 : 0.3)
                    .attr("stroke", node => node.id === d.id ? "#000000" : "none")
                    .attr("stroke-width", node => node.id === d.id ? 2 : 0);

                // Update labels
                labelGroup.selectAll("text")
                    .transition()
                    .duration(duration)
                    .style("opacity", node => connectedNodes.has(node.id) ? 1 : 0.3)
                    .style("fill", "#000000")  // Keep text black even during highlighting
                    .style("font-weight", node => 
                        node.id === "squirrel" || connectedNodes.has(node.id) ? "bold" : "normal"
                    );

                // Update links immediately for first click
                link.transition()
                    .duration(duration)
                    .attr("stroke", l => {
                        if (l.source.id === d.id || l.target.id === d.id) {
                            return "#bf1b1b";
                        }
                        return "#dddddd";
                    })
                    .attr("stroke-opacity", l =>
                        (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1
                    );
            }

            function resetHighlight() {
                // Reset node circles
                nodeGroup.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("fill", d => d.id === "squirrel" ? "#D2691E" : "#bf1b1b")
                    .attr("opacity", 1) // Restore full opacity
                    .attr("stroke", "none")  // Remove the border
                    .attr("stroke-width", 0)  // Set stroke width to 0
                    .style("filter", null);

                // Reset labels
                labelGroup.selectAll("text")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("fill", "#000000")
                    .style("font-weight", d => d.id === "squirrel" ? "bold" : "normal");

                // Reset links
                link.transition()
                    .duration(200)
                    .attr("stroke", "#bf1b1b")
                    .attr("stroke-opacity", 0.6)
                    .attr("stroke-width", d => Math.sqrt(d.value) * 4);
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

                .squirrel-node {
                    fill: #D2691E !important;
                }
                
                .animal-node {
                    fill: #bf1b1b;
                }

                .network-example-list {
                    margin: 0.5rem 0;
                    padding-left: 1.5rem;
                }
                
                .network-example-list li {
                    margin-bottom: 0.3rem;
                }
            `;

            // Update positions on each tick
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(50))  // Fixed link distance
                .force("charge", d3.forceManyBody().strength(-300))  // Reduced repulsion strength
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.size) * 2 + 10));  // Adjusted collision radius

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                label
                    .attr("transform", d => {
                        const radius = Math.sqrt(d.size) * 2.5;
                        const textLength = d.id.length * 6;
                        // Dynamically position labels based on node size
                        return radius * 2 > textLength ? 
                            `translate(${d.x},${d.y})` : 
                            `translate(${d.x + radius + 5},${d.y})`;
                    });
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
            
            // Reset the info display when number changes
            updateInfoDisplay(null);
        });

        // Initial render
        updateNetwork(8);
    });

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
    @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

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
            width: 100%;
            max-width: 1300px;
            margin-left: auto;
            margin-right: auto;
        }

        .network-chart-title {
            color: #ffffff !important;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            font-family: 'COCOGOOSE', sans-serif;
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
            gap: 2rem;
            background: transparent;
            width: 90%;
            max-width: 600px;
            margin-left: 10%;
            margin: 0 auto;
        }

        .network-controls {
            padding: 0;
            background: transparent;
        }

        .network-control-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }

        .network-control-group label {
            color: #000;
            font-weight: 500;
            font-size: 1.1rem;
            width: 200%;
        }

        .network-range {
            width: 200%;
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
            width: 30px;
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
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-right: 100%;
        }

        .network-right-section {
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100%;
            margin-left: -35%;
            margin-right: 40%;
        }

        .network-facts-title {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            font-family: 'COCOGOOSE', sans-serif;
        }

        .network-info-container {
            overflow-y: auto;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.7);
            height: 550px;
            scrollbar-width: thin;
            position: relative;
        }
        
        .network-info-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .network-info-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
        }
        
        .network-info-container::-webkit-scrollbar-thumb {
            background-color: rgba(191, 27, 27, 0.5);
            border-radius: 3px;
        }
        
        .network-info-container::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            pointer-events: none;
            z-index: 1;
        }
        
        .network-scroll-indicator {
            text-align: center;
            margin-top: 5px;
            height: 25px;
            opacity: 0.8;
            transition: opacity 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .network-scroll-arrow {
            width: 8px;
            height: 8px;
            border-left: 2px solid #bf1b1b;
            border-bottom: 2px solid #bf1b1b;
            transform: rotate(-45deg);
            animation: scroll-bounce 1.5s infinite;
            display: inline-block;
        }
        
        .network-scroll-text {
            font-size: 0.8rem;
            color: #bf1b1b;
            font-weight: 500;
        }
        
        @keyframes scroll-bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0) rotate(-45deg);
            }
            40% {
                transform: translateY(-3px) rotate(-45deg);
            }
            60% {
                transform: translateY(-2px) rotate(-45deg);
            }
        }
        
        .network-right-section:hover .network-scroll-indicator {
            opacity: 1;
        }

        #network-info-display {
            padding: 1rem;
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
            margin-top: 1rem !important;
            font-size: 0.9rem;
        }

        .network-animal-name {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
            color: #bf1b1b;
            text-transform: capitalize;
        }
        
        .network-connection-list {
            list-style-type: none;
            padding-left: 0.5rem;
            margin: 0.5rem 0;
        }
        
        .network-connection-list li {
            margin-bottom: 0.5rem;
        }
        
        .network-connection-name {
            text-transform: capitalize;
            font-weight: 500;
        }
        
        .network-connection-value {
            font-weight: bold;
            color: #bf1b1b;
        }
        
        .network-connection-count {
            font-size: 1rem;
            color: #666;
        }
        
        .network-explanation {
            margin-top: 1rem;
            font-size: 1.2rem;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);

    // Add JavaScript to hide scroll indicator when scrolled to bottom
    setTimeout(() => {
        const container = document.querySelector('.network-info-container');
        const scrollIndicator = document.querySelector('.network-scroll-indicator');
        
        if (container && scrollIndicator) {
            // Initially hide the scroll indicator
            scrollIndicator.style.display = 'none';
            
            // Function to check scroll status and update indicator
            function updateScrollIndicator() {
                const isScrollable = container.scrollHeight > container.clientHeight;
                const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
                
                // Only show the indicator if content is scrollable and not at bottom
                if (isScrollable && !isScrolledToBottom) {
                    scrollIndicator.style.display = 'flex';
                    scrollIndicator.style.opacity = '0.8';
                } else {
                    // If not scrollable or at bottom, hide the indicator
                    scrollIndicator.style.opacity = '0';
                    // Use setTimeout to hide after fade out animation completes
                    setTimeout(() => {
                        if (!isScrollable || isScrolledToBottom) {
                            scrollIndicator.style.display = 'none';
                        }
                    }, 300);
                }
            }
            
            // Add scroll event listener
            container.addEventListener('scroll', updateScrollIndicator);
            
            // Check on initial load and whenever content changes
            updateScrollIndicator();
            
            // Also check when info display content changes
            const observer = new MutationObserver(updateScrollIndicator);
            observer.observe(document.getElementById('network-info-display'), { 
                childList: true, 
                subtree: true,
                characterData: true
            });
            
            // Check again after a short delay to account for any rendering delays
            setTimeout(updateScrollIndicator, 500);
        }
    }, 100);
})();