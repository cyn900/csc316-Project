class SquirrelMapVis {
    constructor() {
        this.squirrelData = [];
        this.drawnPaths = []; // Store the raw paths
        this.currentRadius = 50; // Default radius in meters
        this.directAddedElements = []; // Track elements added directly to map
        this.initVis();
    }

    async initVis() {
        console.log("Initializing squirrel map...");
        let vis = this;

        // Add stronger CSS for all map elements
        const mapStyle = document.createElement('style');
        mapStyle.textContent = `
            #squirrel_map {
                height: 500px !important;
                width: 100% !important;
                position: relative !important;
                z-index: 1 !important;
            }
            
            /* Force visibility for all Leaflet elements */
            .leaflet-pane {
                z-index: 1000 !important;
            }
            
            .leaflet-overlay-pane {
                z-index: 1001 !important;
            }
            
            /* Extremely visible debug elements */
            .super-visible-path {
                stroke: #FF00FF !important; /* Hot pink */
                stroke-width: 20px !important; /* Very thick */
                stroke-opacity: 1 !important;
                filter: drop-shadow(0 0 10px yellow) !important;
            }
            
            .super-visible-circle {
                stroke: #00FFFF !important; /* Cyan */
                stroke-width: 8px !important;
                fill: yellow !important;
                fill-opacity: 0.8 !important;
                filter: drop-shadow(0 0 10px red) !important;
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
            .style("box-shadow", "0 1px 5px rgba(0,0,0,0.1)");

        // Dashboard content
        dashboardContainer.append("h3")
            .text("Path Analysis")
            .style("margin-top", "0")
            .style("margin-bottom", "15px");
            
        dashboardContainer.append("div")
            .attr("class", "stat-item")
            .html("<strong>Squirrels in path:</strong> <span id='count'>0</span>")
            .style("margin-bottom", "10px");
            
        dashboardContainer.append("div")
            .attr("class", "stat-item")
            .html("<strong>Most common color:</strong> <span id='color'>-</span>")
            .style("margin-bottom", "20px");
            
        dashboardContainer.append("label")
            .html("<strong>Buffer radius:</strong> <span id='radiusValue'>" + this.currentRadius + "</span>m")
            .style("display", "block")
            .style("margin-bottom", "5px");
            
        dashboardContainer.append("input")
            .attr("id", "radius")
            .attr("type", "range")
            .attr("min", "10")
            .attr("max", "200")
            .attr("step", "5")
            .attr("value", this.currentRadius)
            .style("width", "100%")
            .style("margin-bottom", "15px")
            .on("input", function() {
                const value = this.value;
                d3.select("#radiusValue").text(value);
                vis.currentRadius = parseInt(value);
                vis.updateBuffers();
            });
            
        dashboardContainer.append("button")
            .attr("id", "resetButton")
            .text("Reset All Lines")
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
            });

        // Initialize the map
        vis.map = L.map('squirrel_map', {
            center: [40.7810, -73.966],
            zoom: 14,
            zoomControl: true
        });

        // Add tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Add fixed visible elements for testing
        const fixedMarker = L.marker([40.7810, -73.966], {
            title: "Central Park Reference"
        }).addTo(vis.map);
        vis.directAddedElements.push(fixedMarker);
        
        // Add LARGE debug circle
        const debugCircle = L.circle([40.7810, -73.966], {
            radius: 200,
            className: 'super-visible-circle'
        }).addTo(vis.map);
        vis.directAddedElements.push(debugCircle);
        
        // Add LARGE debug line
        const debugLine = L.polyline([
            [40.780, -73.965],
            [40.782, -73.967]
        ], {
            color: '#FF00FF', // Hot pink
            weight: 20,
            opacity: 1,
            className: 'super-visible-path'
        }).addTo(vis.map);
        vis.directAddedElements.push(debugLine);

        // Configure draw control
        const drawControl = new L.Control.Draw({
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#FF00FF', // Hot pink
                        weight: 20,
                        opacity: 1,
                        className: 'super-visible-path'
                    }
                },
                polygon: false,
                circle: false,
                rectangle: false,
                marker: false,
                circlemarker: false
            },
            edit: false
        });
        vis.map.addControl(drawControl);

        // Event listeners
        vis.map.on('draw:created', function(e) {
            console.log("Line drawn:", e);
            const coords = e.layer.getLatLngs();
            vis.drawnPaths.push(coords);
            
            // Add directly to map with super visibility
            const path = L.polyline(coords, {
                color: '#FF00FF', // Hot pink
                weight: 20,
                opacity: 1,
                className: 'super-visible-path'
            }).addTo(vis.map);
            vis.directAddedElements.push(path);
            
            vis.updateBuffers();
        });

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
        setTimeout(() => vis.map.invalidateSize(), 500);
    }

    updateBuffers() {
        const vis = this;
        
        // No paths? Exit early
        if (vis.drawnPaths.length === 0) {
            vis.updateDashboard([]);
            return;
        }

        // Convert paths to GeoJSON features
        const features = vis.drawnPaths.map(coords => {
            // Convert LatLng objects to GeoJSON format [lng, lat]
            const points = coords.map(coord => [coord.lng, coord.lat]);
            return turf.lineString(points);
        });
        
        // Create feature collection and buffer
        const lines = turf.featureCollection(features);
        const buffer = turf.buffer(lines, vis.currentRadius, {units: 'meters'});
        
        // Add buffer directly to map
        const bufferLayer = L.geoJSON(buffer, {
            style: {
                color: '#6B4423',
                weight: 2,
                opacity: 0.6,
                fillColor: '#8B5A2B',
                fillOpacity: 0.2
            }
        }).addTo(vis.map);
        vis.directAddedElements.push(bufferLayer);
        
        // Find squirrels within buffer
        const selectedSquirrels = vis.findSquirrelsInBuffer(buffer);
        console.log(`Found ${selectedSquirrels.length} squirrels in buffer`);
        
        // Update dashboard
        vis.updateDashboard(selectedSquirrels);
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
        // Update count
        d3.select("#count").text(selectedSquirrels.length || 0);
        
        // If we have squirrels, compute most common fur color
        if (selectedSquirrels.length > 0) {
            // Count fur colors
            const colorCounts = {};
            selectedSquirrels.forEach(squirrel => {
                const color = squirrel['Primary Fur Color'] || 'Unknown';
                colorCounts[color] = (colorCounts[color] || 0) + 1;
            });
            
            // Find most common
            let mostCommon = 'Unknown';
            let maxCount = 0;
            
            Object.entries(colorCounts).forEach(([color, count]) => {
                if (count > maxCount) {
                    mostCommon = color;
                    maxCount = count;
                }
            });
            
            d3.select("#color").text(mostCommon);
        } else {
            d3.select("#color").text("-");
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.turf) {
        console.error("Turf.js is required but not loaded!");
        return;
    }
    
    // Delay map initialization
    setTimeout(() => new SquirrelMapVis(), 200);
});