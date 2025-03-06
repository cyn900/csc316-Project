class SquirrelMapVis {
    constructor() {
        this.initVis();
    }

    initVis() {
        console.log("trying to initialize map");

        let vis = this;

        vis.map = L.map('squirrel_map', {
            zoomSnap: 0.25
        }).setView([40.7810,-73.966],13.9);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

    }
}

// Instantiate the SquirrelMapVis class after the DOM has loaded
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("event listener triggered");
    new SquirrelMapVis();
});
