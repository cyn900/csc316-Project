(function() {
    // Set up dimensions
    const width = 600;
    const height = 450;
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
    rightSection.html(`
        <h3 class="network-facts-title">Animal Interactions</h3>
        
        <div class="network-info-container">
            <div id="network-info-display">
                <p class="network-default-text">Click on a node to see detailed information about that animal's interactions.</p>
                
                <div class="network-explanation">
                    <p><strong>About the visualization:</strong></p>
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
            // Reset to default text
            infoDisplay.html(`
                <p class="network-default-text">Click on a node to see detailed information about that animal's interactions.</p>
                
                <div class="network-explanation">
                    <p><strong>About the visualization:</strong></p>
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
                <p><strong>What do these percentages mean?</strong></p>
            `;
        
        if (connections.length > 0) {
            const topConnection = connections[0];
            const percentage = (topConnection.value * 100).toFixed(1);
            
            html += `
                <p>For example, when you see "${d.id}" and "${topConnection.name}" together:</p>
                <ul class="network-example-list">
                    <li>There were ${animalCounts[d.id]} total ${d.id} sightings</li>
                    <li>There were ${animalCounts[topConnection.name]} total ${topConnection.name} sightings</li>
                    <li>They were seen together ${topConnection.count} times</li>
                </ul>
                
                <p>The ${percentage}% means: <strong>If you spot a ${d.id} in the park, there's a ${percentage}% chance you'll also see a ${topConnection.name} nearby.</strong></p>
                
                <p>We calculate this by taking the number of times they were seen together (${topConnection.count}) divided by the total number of opportunities to see them together (${Math.min(animalCounts[d.id], animalCounts[topConnection.name])}).</p>
            `;
        }
        
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

            // Create nodes array properly
            const nodes = topAnimals.map(animal => ({
                id: animal,
                group: animal === "squirrel" ? 1 : 2,
                size: animalCounts[animal]
            }));

            // Clear previous network
            svg.selectAll("*").remove();

            // Create force simulation with proper nodes array
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-800))  // Reduced strength
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.size) * 2.5 + 5));  // Reduced padding

            // Create the links
            const link = svg.append("g")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("class", "network-link")
                .attr("stroke-width", d => Math.sqrt(d.value) * 4)
                .attr("stroke", "#bf1b1b")
                .attr("stroke-opacity", 0.8);
            
            // Create the nodes with proper data
            const node = svg.append("g")
                .selectAll("g")
                .data(nodes)  // Use the nodes array directly
                .enter().append("g")
                .attr("class", "network-node")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", handleNodeClick);

            // Add circles to nodes
            node.append("circle")
                .attr("r", d => Math.sqrt(d.size) * 2.5)
                .attr("fill", d => d.id === "squirrel" ? "#D2691E" : "#bf1b1b")
                .attr("class", d => d.id === "squirrel" ? "squirrel-node" : "animal-node");

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
                    updateInfoDisplay(null);
                } else {
                    // Highlight the selected node and its connections
                    selectedNode = d.id;
                    highlightConnections(d);
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

            function highlightConnections(d) {
                const connectedNodes = getConnectedNodes(d.id);

                // Update nodes
                node.selectAll("circle")
                    .transition()
                    .duration(200)
                    .attr("fill", node => {
                        if (node.id === "squirrel") return "#D2691E";
                        if (connectedNodes.has(node.id)) {
                            return "#bf1b1b";
                        }
                        return "#ddd";
                    })
                    .attr("r", node => {
                        const baseSize = Math.sqrt(node.size) * 2.5;
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
                        const baseWidth = Math.sqrt(l.value) * 4;
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
                    .attr("fill", d => d.id === "squirrel" ? "#D2691E" : "#bf1b1b")
                    .attr("r", d => Math.sqrt(d.size) * 2.5)
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
            gap: 2rem;
            background: transparent;
            width: 90%;
            max-width: 600px;
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
            width: 90%;
            height: auto;
            aspect-ratio: 4/3;
            background: transparent !important;
            margin: 0 auto;
        }

        .network-right-section {
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .network-facts-title {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            font-family: 'Amsterdam Four_ttf';
        }

        .network-info-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.7);
            height: calc(450px - 3rem - 30px);  /* Match SVG height minus title space and scroll indicator */
            max-height: calc(450px - 3rem - 30px);
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
            height: 40px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9));
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
            font-size: 0.9rem;
            color: #666;
        }
        
        .network-percentage-explanation {
            margin-top: 1rem;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .network-explanation {
            margin-top: 1rem;
            font-size: 0.9rem;
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

    // Update the updateInfoDisplay function to check scroll status after content changes
    const originalUpdateInfoDisplay = updateInfoDisplay;
    updateInfoDisplay = function(d) {
        // Call the original function
        originalUpdateInfoDisplay(d);
        
        // Check scroll status after a short delay to allow DOM to update
        setTimeout(() => {
            const container = document.querySelector('.network-info-container');
            const scrollIndicator = document.querySelector('.network-scroll-indicator');
            
            if (container && scrollIndicator) {
                const isScrollable = container.scrollHeight > container.clientHeight;
                const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
                
                if (isScrollable && !isScrolledToBottom) {
                    scrollIndicator.style.display = 'flex';
                    scrollIndicator.style.opacity = '0.8';
                } else {
                    scrollIndicator.style.opacity = '0';
                    setTimeout(() => {
                        if (!isScrollable || isScrolledToBottom) {
                            scrollIndicator.style.display = 'none';
                        }
                    }, 300);
                }
            }
        }, 100);
    };
})();