class SquirrelMapVis {
    constructor() {
        this.squirrelData = [];
        this.drawnPaths = []; // Store the raw paths
        this.currentRadius = 50; // Default radius in meters
        this.directAddedElements = []; // Track elements added directly to map
        this.isDrawing = false; // Track if user is currently drawing
        this.currentDrawingPoints = []; // Store points for current drawing
        this.currentDrawingLine = null; // Reference to the line being drawn
        this.mapInitialized = false; // Track if map is fully initialized
        this.patchLeaflet();
        this.initVis();
    }

    // Patch Leaflet to fix the touchleave error
    patchLeaflet() {
        try {
            // Only patch if Leaflet is loaded
            if (typeof L !== 'undefined') {
                console.log("Patching Leaflet event handling...");
                
                // Add touchleave to the list of events if it's missing
                if (L.DomEvent && L.DomEvent.POINTER_EVENTS) {
                    // For newer versions of Leaflet
                    if (!L.DomEvent.POINTER_EVENTS.touchleave) {
                        L.DomEvent.POINTER_EVENTS.touchleave = 'touchend';
                    }
                }
                
                // Patch the on method to handle touchleave
                const originalOn = L.DomEvent.on;
                L.DomEvent.on = function(obj, types, fn, context) {
                    if (types === 'touchleave') {
                        // Use touchend instead of touchleave
                        return originalOn.call(this, obj, 'touchend', fn, context);
                    }
                    return originalOn.call(this, obj, types, fn, context);
                };
                
                // Patch the Evented class if it exists
                if (L.Evented && L.Evented.prototype) {
                    const originalOn = L.Evented.prototype.on;
                    L.Evented.prototype.on = function(types, fn, context) {
                        if (types === 'touchleave') {
                            // Use touchend instead of touchleave
                            return originalOn.call(this, 'touchend', fn, context);
                        }
                        return originalOn.call(this, types, fn, context);
                    };
                }
                
                console.log("Leaflet patched successfully");
            }
        } catch (error) {
            console.error("Error patching Leaflet:", error);
        }
    }

    async initVis() {
        console.log("Initializing squirrel map...");
        let vis = this;

        // Add basic CSS for map with improved z-index handling
        const mapStyle = document.createElement('style');
        mapStyle.textContent = `
            #squirrel_map {
                height: 500px;
                width: 100%;
                position: relative;
                z-index: 1;
            }
            
            .drawing-mode {
                cursor: crosshair !important;
            }
            
            .drawing-instructions {
                background: rgba(255, 255, 255, 0.8);
                padding: 8px;
                border-radius: 4px;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            /* Ensure proper z-index for Leaflet elements */
            .leaflet-pane {
                z-index: 400;
            }
            .leaflet-overlay-pane {
                z-index: 410;
            }
            .leaflet-marker-pane {
                z-index: 420;
            }
            .leaflet-tooltip-pane {
                z-index: 430;
            }
            .leaflet-popup-pane {
                z-index: 440;
            }
            .leaflet-control {
                z-index: 800;
            }
            
            /* Custom styling for our lines */
            .test-line {
                stroke-width: 8px !important;
                stroke: red !important;
                opacity: 1 !important;
            }
            
            .test-line-label {
                z-index: 1000 !important;
            }
            
            /* Dashboard styling */
            .stat-item {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 10px;
                border-left: 4px solid #6B4423;
            }
            
            .radius-display {
                font-size: 16px;
                font-weight: bold;
                color: #6B4423;
            }
            
            .stat-value {
                font-weight: bold;
                font-size: 18px;
                color: #333;
            }
            
            .btn-pulse {
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
                }
            }
            
            .activity-bar {
                height: 20px;
                background: #e9ecef;
                border-radius: 3px;
                margin-top: 5px;
                overflow: hidden;
            }
            
            .activity-fill {
                height: 100%;
                background: #6B4423;
                transition: width 0.5s ease-in-out;
            }
            
            .age-distribution {
                display: flex;
                margin-top: 8px;
            }
            
            .age-bar {
                flex-grow: 1;
                height: 24px;
                margin-right: 4px;
                border-radius: 3px;
                position: relative;
                overflow: hidden;
                background: #e9ecef;
            }
            
            .age-bar:last-child {
                margin-right: 0;
            }
            
            .age-fill {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: #6B4423;
                transition: height 0.5s ease-in-out;
            }
            
            .age-label {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                color: white;
                text-shadow: 0 0 2px rgba(0,0,0,0.7);
                padding: 2px 0;
            }
            
            .color-swatch {
                display: inline-block;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                margin-right: 5px;
                vertical-align: middle;
            }
            
            .section-divider {
                border-top: 1px solid #dee2e6;
                margin: 15px 0;
            }
            
            .collapsible-section {
                margin-bottom: 10px;
            }
            
            .collapsible-header {
                background: #f8f9fa;
                padding: 8px 10px;
                border-radius: 4px;
                cursor: pointer;
                border-left: 4px solid #6B4423;
                font-weight: bold;
            }
            
            .collapsible-content {
                padding: 10px;
                background: #fff;
                border: 1px solid #dee2e6;
                border-top: none;
                border-radius: 0 0 4px 4px;
                display: none;
            }
        `;
        document.head.appendChild(mapStyle);
        
        // Move dashboard to left column
        const dashboardContainer = d3.select("#viz8 .col-md-6:first-child")
            .append("div")
            .attr("class", "squirrel-dashboard")
            .style("padding", "15px")
            .style("margin-top", "20px")
            .style("background", "rgba(248, 249, 250, 1)")
            .style("border-radius", "4px")
            .style("box-shadow", "0 1px 5px rgba(0,0,0,0.1)")
            .style("max-height", "500px")
            .style("overflow-y", "auto");

        // Dashboard content
        dashboardContainer.append("h3")
            .text("Squirrel Path Analysis")
            .style("margin-top", "0")
            .style("margin-bottom", "15px");
        
        // Add drawing instructions (initially hidden)
        dashboardContainer.append("div")
            .attr("class", "drawing-instructions")
            .attr("id", "drawing-instructions")
            .html("<strong>Drawing Mode Active:</strong> Click on map to add points. Double-click to finish.")
            .style("display", "none")
            .style("background", "#e8f4f8")
            .style("border-left", "4px solid #17a2b8");
            
        // Stats section with improved styling
        dashboardContainer.append("div")
            .attr("class", "stat-item")
            .html("<strong>Squirrels in path:</strong> <span id='count' class='stat-value'>0</span>")
            .style("margin-bottom", "10px");
            
        // Create a two-column layout for color and age
        const twoColContainer = dashboardContainer.append("div")
            .style("display", "flex")
            .style("gap", "10px")
            .style("margin-bottom", "10px");
            
        // Column 1: Fur Color Distribution
        twoColContainer.append("div")
            .attr("class", "stat-item")
            .style("flex", "1")
            .html(`
                <strong>Fur Colors:</strong>
                <div id="color-breakdown" style="margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><span class="color-swatch" style="background-color: #808080;"></span>Gray</span>
                        <span id="gray-count">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><span class="color-swatch" style="background-color: #D2691E;"></span>Cinnamon</span>
                        <span id="cinnamon-count">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span><span class="color-swatch" style="background-color: #333333;"></span>Black</span>
                        <span id="black-count">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span><span class="color-swatch" style="background-color: #EEEEEE; border: 1px solid #ccc;"></span>Unknown</span>
                        <span id="unknown-color-count">0</span>
                    </div>
                </div>
            `);
            
        // Column 2: Age Distribution with numbers
        twoColContainer.append("div")
            .attr("class", "stat-item")
            .style("flex", "1")
            .html(`
                <strong>Age Groups:</strong>
                <div id="age-breakdown" style="margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Adult</span>
                        <span id="adult-count">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Juvenile</span>
                        <span id="juvenile-count">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Unknown</span>
                        <span id="unknown-age-count">0</span>
                    </div>
                </div>
                <div class="age-distribution" style="margin-top: 10px;">
                    <div class="age-bar">
                        <div id="adult-bar" class="age-fill" style="height: 0%"></div>
                        <div class="age-label">A</div>
                    </div>
                    <div class="age-bar">
                        <div id="juvenile-bar" class="age-fill" style="height: 0%"></div>
                        <div class="age-label">J</div>
                    </div>
                    <div class="age-bar">
                        <div id="unknown-age-bar" class="age-fill" style="height: 0%"></div>
                        <div class="age-label">U</div>
                    </div>
                </div>
            `);
            
        // Add time of day section
        dashboardContainer.append("div")
            .attr("class", "stat-item")
            .html(`
                <strong>Time of Day:</strong>
                <div style="display: flex; margin-top: 8px;">
                    <div style="flex: 1; text-align: center; padding: 5px; background: #f0f0f0; border-radius: 3px 0 0 3px;">
                        <span style="font-weight: bold;">AM</span>
                        <div id="am-count" style="font-size: 16px;">0</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 5px; background: #e0e0e0; border-radius: 0 3px 3px 0;">
                        <span style="font-weight: bold;">PM</span>
                        <div id="pm-count" style="font-size: 16px;">0</div>
                    </div>
                </div>
            `)
            .style("margin-bottom", "10px");
            
        // Add activities section (collapsible)
        const activitiesSection = dashboardContainer.append("div")
            .attr("class", "collapsible-section");
            
        activitiesSection.append("div")
            .attr("class", "collapsible-header")
            .html("Squirrel Activities <span style='float: right;'>▼</span>")
            .on("click", function() {
                const content = d3.select(this.parentNode).select(".collapsible-content");
                const isVisible = content.style("display") !== "none";
                content.style("display", isVisible ? "none" : "block");
                d3.select(this).select("span").html(isVisible ? "▼" : "▲");
            });
            
        const activitiesContent = activitiesSection.append("div")
            .attr("class", "collapsible-content");
            
        // Add activity bars
        const activities = ["Running", "Chasing", "Climbing", "Eating", "Foraging"];
        activities.forEach(activity => {
            activitiesContent.append("div")
                .style("margin-bottom", "8px")
                .html(`
                    <div style="display: flex; justify-content: space-between;">
                        <span>${activity}</span>
                        <span id="${activity.toLowerCase()}-percent">0%</span>
                    </div>
                    <div class="activity-bar">
                        <div id="${activity.toLowerCase()}-bar" class="activity-fill" style="width: 0%"></div>
                    </div>
                `);
        });
            
        // Radius control with visual indicator
        dashboardContainer.append("div")
            .attr("class", "radius-control")
            .style("margin-bottom", "20px")
            .style("margin-top", "20px")
            .style("background", "#f8f9fa")
            .style("padding", "15px")
            .style("border-radius", "4px")
            .style("border-left", "4px solid #6B4423")
            .html(`
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>Buffer Radius:</strong>
                    <span id="radiusValue" class="radius-display">${this.currentRadius} meters</span>
                </div>
                <input id="radius" type="range" min="10" max="200" step="5" value="${this.currentRadius}" 
                    style="width: 100%;">
            `);
            
        // Set up radius slider event
        d3.select("#radius").on("input", function() {
            const value = this.value;
            d3.select("#radiusValue").text(value + " meters");
            vis.currentRadius = parseInt(value);
            vis.updateBuffers();
        });
        
        // Add draw button - keep only this one
        dashboardContainer.append("button")
            .attr("id", "drawButton")
            .text("Draw Path on Map")
            .attr("class", "btn btn-primary")
            .style("width", "100%")
            .style("margin-bottom", "10px")
            .style("font-weight", "bold")
            .on("click", function() {
                vis.toggleDrawMode();
            });
            
        // Add reset button
        dashboardContainer.append("button")
            .attr("id", "resetButton")
            .text("Reset Map")
            .attr("class", "btn btn-secondary")
            .style("width", "100%")
            .on("click", () => {
                vis.drawnPaths = [];
                // Remove all directly added elements
                vis.directAddedElements.forEach(el => {
                    if (el && vis.map) vis.map.removeLayer(el);
                });
                vis.directAddedElements = [];
                vis.updateDashboard([]);
                
                // Add back the reference marker
                const fixedMarker = L.marker([40.7810, -73.966], {
                    title: "Central Park Reference"
                }).addTo(vis.map);
                vis.directAddedElements.push(fixedMarker);
                
                // Reset the map view
                vis.map.setView([40.7810, -73.966], 14);
            });

        // Wait for DOM to be fully ready before initializing map
        setTimeout(() => {
            this.initMap();
        }, 500);

        // Load squirrel data
        try {
            vis.squirrelData = await d3.csv("data/individual.csv").then(data => {
                return data.map(d => ({
                    lat: +d.Y,
                    lng: +d.X,
                    properties: d
                }));
            });
            console.log(`Loaded ${vis.squirrelData.length} squirrel records`);
        } catch (error) {
            console.error("Error loading squirrel data:", error);
        }
    }
    
    // Separate map initialization for better control
    initMap() {
        if (this.mapInitialized) return;
        
        console.log("Initializing Leaflet map...");
        let vis = this;
        
        // Make sure the map container exists
        const mapContainer = document.getElementById('squirrel_map');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }
        
        // Initialize the map with simpler options
        vis.map = L.map('squirrel_map', {
            center: [40.7810, -73.966],
            zoom: 14,
            zoomControl: true,
            doubleClickZoom: false, // Disable double-click zoom for our drawing
            preferCanvas: true      // Use canvas for better performance
        });

        // Add tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Add a reference marker
        const fixedMarker = L.marker([40.7810, -73.966], {
            title: "Central Park Reference"
        }).addTo(vis.map);
        vis.directAddedElements.push(fixedMarker);
        
        // Set up custom drawing events
        vis.map.on('click', function(e) {
            if (vis.isDrawing) {
                vis.addDrawingPoint(e.latlng);
            }
        });
        
        vis.map.on('dblclick', function(e) {
            if (vis.isDrawing && vis.currentDrawingPoints.length >= 2) {
                vis.finishDrawing();
                // Prevent zoom
                L.DomEvent.preventDefault(e);
            }
        });
        
        // Force map to refresh when its section becomes visible
        $(document).on('afterLoad', function(origin, destination, direction){
            if($(destination.item).find('#squirrel_map').length > 0) {
                setTimeout(() => {
                    console.log("Map section activated - refreshing map");
                    vis.map.invalidateSize();
                }, 200);
            }
        });
        
        // Initial map refresh
        setTimeout(() => {
            vis.map.invalidateSize();
            console.log("Initial map refresh completed");
        }, 1000);
        
        this.mapInitialized = true;
    }
    
    // Toggle drawing mode
    toggleDrawMode() {
        const drawButton = document.getElementById('drawButton');
        const instructions = document.getElementById('drawing-instructions');
        const mapElement = document.getElementById('squirrel_map');
        
        if (this.isDrawing) {
            // Cancel drawing
            this.isDrawing = false;
            drawButton.textContent = "Start Drawing Path";
            drawButton.classList.remove('btn-danger');
            drawButton.classList.add('btn-primary');
            instructions.style.display = 'none';
            
            // Remove the temporary line
            if (this.currentDrawingLine) {
                this.map.removeLayer(this.currentDrawingLine);
                this.currentDrawingLine = null;
            }
            
            // Reset points
            this.currentDrawingPoints = [];
            
            // Reset cursor
            if (mapElement) {
                mapElement.classList.remove('drawing-mode');
            }
        } else {
            // Start drawing
            this.isDrawing = true;
            drawButton.textContent = "Cancel Drawing";
            drawButton.classList.remove('btn-primary');
            drawButton.classList.add('btn-danger');
            instructions.style.display = 'block';
            
            // Reset points
            this.currentDrawingPoints = [];
            
            // Set cursor
            if (mapElement) {
                mapElement.classList.add('drawing-mode');
            }
        }
    }
    
    // Add a point to the current drawing
    addDrawingPoint(latlng) {
        if (!this.isDrawing) return;
        
        console.log("Adding point:", latlng);
        
        // Add point to our array
        this.currentDrawingPoints.push(latlng);
        
        // If we have at least 2 points, draw or update the line
        if (this.currentDrawingPoints.length >= 2) {
            if (this.currentDrawingLine) {
                // Update existing line
                this.currentDrawingLine.setLatLngs(this.currentDrawingPoints);
            } else {
                // Create new line with improved visibility
                this.currentDrawingLine = L.polyline(this.currentDrawingPoints, {
                    color: '#FF0000',
                    weight: 8,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.map);
            }
        }
        
        // Add a small marker at each point for better visibility
        const pointMarker = L.circleMarker(latlng, {
            radius: 5,
            color: '#000',
            weight: 2,
            fillColor: '#FF0000',
            fillOpacity: 1
        }).addTo(this.map);
        
        this.directAddedElements.push(pointMarker);
    }
    
    // Finish drawing the current line
    finishDrawing() {
        if (!this.isDrawing || this.currentDrawingPoints.length < 2) return;
        
        console.log("Finishing drawing with", this.currentDrawingPoints.length, "points");
        
        // Remove the temporary line
        if (this.currentDrawingLine) {
            this.map.removeLayer(this.currentDrawingLine);
            this.currentDrawingLine = null;
        }
        
        // Create the final polyline with improved visibility
        const finalLine = L.polyline(this.currentDrawingPoints, {
            color: '#FF0000',
            weight: 8,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);
        
        // Add start and end markers for clarity
        const startPoint = this.currentDrawingPoints[0];
        const endPoint = this.currentDrawingPoints[this.currentDrawingPoints.length - 1];
        
        const startMarker = L.marker(startPoint, {
            icon: L.divIcon({
                className: 'path-marker',
                html: '<div style="background-color: white; padding: 3px; border: 2px solid black; font-weight: bold; color: red;">START</div>',
                iconSize: [50, 25],
                iconAnchor: [25, 12]
            })
        }).addTo(this.map);
        
        const endMarker = L.marker(endPoint, {
            icon: L.divIcon({
                className: 'path-marker',
                html: '<div style="background-color: white; padding: 3px; border: 2px solid black; font-weight: bold; color: red;">END</div>',
                iconSize: [50, 25],
                iconAnchor: [25, 12]
            })
        }).addTo(this.map);
        
        // Store the path and elements
        this.drawnPaths.push([...this.currentDrawingPoints]); // Make a copy
        this.directAddedElements.push(finalLine);
        this.directAddedElements.push(startMarker);
        this.directAddedElements.push(endMarker);
        
        // Update buffers
        this.updateBuffers();
        
        // Reset drawing state
        this.toggleDrawMode();
        
        // Center map on the drawn path
        this.map.fitBounds(finalLine.getBounds(), {
            padding: [50, 50]
        });
        
        // Force a redraw of the map
        this.map.invalidateSize();
    }
    
    // Replace the test line function with a reset function
    addTestLine() {
        alert("The test line feature has been removed. Please draw your own path by clicking 'Start Drawing Path'.");
    }

    updateBuffers() {
        const vis = this;
        
        // Clear previous buffers
        vis.clearBuffers();
        
        // No paths? Exit early
        if (vis.drawnPaths.length === 0) {
            vis.updateDashboard([]);
            return;
        }

        console.log("Updating buffers with", vis.drawnPaths.length, "paths");
        
        try {
            // Convert paths to GeoJSON features
            const features = vis.drawnPaths.map(coords => {
                // Convert LatLng objects to GeoJSON format [lng, lat]
                const points = coords.map(coord => {
                    // Handle both {lat, lng} objects and [lat, lng] arrays
                    const lng = coord.lng !== undefined ? coord.lng : coord[1];
                    const lat = coord.lat !== undefined ? coord.lat : coord[0];
                    return [lng, lat];
                });
                return turf.lineString(points);
            });
            
            // Create feature collection and buffer
            const lines = turf.featureCollection(features);
            const buffer = turf.buffer(lines, vis.currentRadius, {units: 'meters'});
            
            // Add buffer to map with more subtle styling - no border
            const bufferLayer = L.geoJSON(buffer, {
                style: {
                    color: '#6B4423',
                    weight: 0,  // Remove the border
                    opacity: 0, // Make border invisible
                    fillColor: '#8B5A2B',
                    fillOpacity: 0.2  // Make fill more subtle
                }
            }).addTo(vis.map);
            vis.directAddedElements.push(bufferLayer);
            
            // Find squirrels within buffer
            const selectedSquirrels = vis.findSquirrelsInBuffer(buffer);
            console.log(`Found ${selectedSquirrels.length} squirrels in buffer`);
            
            // Update dashboard
            vis.updateDashboard(selectedSquirrels);
        } catch (error) {
            console.error("Error updating buffers:", error);
            alert("Error creating buffer: " + error.message);
        }
    }

    findSquirrelsInBuffer(buffer) {
        // Create GeoJSON points collection for squirrels
        const points = turf.featureCollection(
            this.squirrelData.map(d => turf.point([d.lng, d.lat], d.properties))
        );
        
        // Find points within buffer
        const selected = turf.pointsWithinPolygon(points, buffer);
        return selected.features.map(f => f.properties);
    }

    updateDashboard(selectedSquirrels) {
        // Update count with animation
        const countElement = d3.select("#count");
        const oldCount = parseInt(countElement.text()) || 0;
        const newCount = selectedSquirrels.length || 0;
        
        // Simple animation for count change
        if (oldCount !== newCount) {
            countElement.transition()
                .duration(500)
                .tween("text", function() {
                    const i = d3.interpolateNumber(oldCount, newCount);
                    return function(t) {
                        this.textContent = Math.round(i(t));
                    };
                });
        }
        
        // If we have squirrels, update all stats
        if (selectedSquirrels.length > 0) {
            // Count fur colors
            const colorCounts = {
                'Gray': 0,
                'Cinnamon': 0,
                'Black': 0,
                'Unknown': 0
            };
            
            selectedSquirrels.forEach(squirrel => {
                const color = squirrel['Primary Fur Color'];
                if (color === 'Gray') {
                    colorCounts.Gray++;
                } else if (color === 'Cinnamon') {
                    colorCounts.Cinnamon++;
                } else if (color === 'Black') {
                    colorCounts.Black++;
                } else {
                    colorCounts.Unknown++;
                }
            });
            
            // Update color counts
            d3.select("#gray-count").text(colorCounts.Gray);
            d3.select("#cinnamon-count").text(colorCounts.Cinnamon);
            d3.select("#black-count").text(colorCounts.Black);
            d3.select("#unknown-color-count").text(colorCounts.Unknown);
            
            // Update age distribution
            const ageCounts = {
                'Adult': 0,
                'Juvenile': 0,
                'Unknown': 0
            };
            
            selectedSquirrels.forEach(squirrel => {
                const age = squirrel['Age'];
                if (age === 'Adult') {
                    ageCounts.Adult++;
                } else if (age === 'Juvenile') {
                    ageCounts.Juvenile++;
                } else {
                    ageCounts.Unknown++;
                }
            });
            
            // Update age counts
            d3.select("#adult-count").text(ageCounts.Adult);
            d3.select("#juvenile-count").text(ageCounts.Juvenile);
            d3.select("#unknown-age-count").text(ageCounts.Unknown);
            
            // Calculate percentages
            const adultPercent = (ageCounts.Adult / selectedSquirrels.length) * 100;
            const juvenilePercent = (ageCounts.Juvenile / selectedSquirrels.length) * 100;
            const unknownPercent = (ageCounts.Unknown / selectedSquirrels.length) * 100;
            
            // Update bars
            d3.select("#adult-bar").transition().duration(500).style("height", `${adultPercent}%`);
            d3.select("#juvenile-bar").transition().duration(500).style("height", `${juvenilePercent}%`);
            d3.select("#unknown-age-bar").transition().duration(500).style("height", `${unknownPercent}%`);
            
            // Update time of day counts
            const amCount = selectedSquirrels.filter(s => s.Shift === 'AM').length;
            const pmCount = selectedSquirrels.filter(s => s.Shift === 'PM').length;
            
            d3.select("#am-count").text(amCount);
            d3.select("#pm-count").text(pmCount);
            
            // Update activity bars
            const activities = ["Running", "Chasing", "Climbing", "Eating", "Foraging"];
            activities.forEach(activity => {
                const count = selectedSquirrels.filter(s => s[activity] === 'TRUE').length;
                const percent = (count / selectedSquirrels.length) * 100;
                
                d3.select(`#${activity.toLowerCase()}-bar`)
                    .transition()
                    .duration(500)
                    .style("width", `${percent}%`);
                    
                d3.select(`#${activity.toLowerCase()}-percent`)
                    .text(`${Math.round(percent)}%`);
            });
        } else {
            // Reset all stats if no squirrels
            d3.select("#gray-count").text("0");
            d3.select("#cinnamon-count").text("0");
            d3.select("#black-count").text("0");
            d3.select("#unknown-color-count").text("0");
            
            // Reset age counts and bars
            d3.select("#adult-count").text("0");
            d3.select("#juvenile-count").text("0");
            d3.select("#unknown-age-count").text("0");
            d3.select("#adult-bar").style("height", "0%");
            d3.select("#juvenile-bar").style("height", "0%");
            d3.select("#unknown-age-bar").style("height", "0%");
            
            // Reset time of day
            d3.select("#am-count").text("0");
            d3.select("#pm-count").text("0");
            
            // Reset activity bars
            const activities = ["Running", "Chasing", "Climbing", "Eating", "Foraging"];
            activities.forEach(activity => {
                d3.select(`#${activity.toLowerCase()}-bar`).style("width", "0%");
                d3.select(`#${activity.toLowerCase()}-percent`).text("0%");
            });
        }
    }

    // Method to clear only buffer layers
    clearBuffers() {
        const vis = this;
        // Filter out and remove only buffer layers, keeping the paths
        const bufferLayers = vis.directAddedElements.filter(el => 
            el && el.options && el.options.style && el.options.style.fillColor === '#8B5A2B'
        );
        
        bufferLayers.forEach(layer => {
            if (layer && vis.map) vis.map.removeLayer(layer);
        });
        
        // Update the directAddedElements array to remove the buffer layers
        vis.directAddedElements = vis.directAddedElements.filter(el => 
            !(el && el.options && el.options.style && el.options.style.fillColor === '#8B5A2B')
        );
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.turf) {
        console.error("Turf.js is required but not loaded!");
        return;
    }
    
    // Create a dedicated container for the map if it doesn't exist
    const mapContainer = document.getElementById('squirrel_map');
    if (!mapContainer) {
        console.log("Creating map container");
        const container = document.createElement('div');
        container.id = 'squirrel_map';
        
        // Find the right column to add it to
        const rightColumn = document.querySelector("#viz8 .col-md-6:last-child");
        if (rightColumn) {
            rightColumn.appendChild(container);
        } else {
            console.error("Could not find right column for map");
        }
    }
    
    // Delay map initialization to ensure DOM is ready
    setTimeout(() => {
        const squirrelMap = new SquirrelMapVis();
    }, 500);
});