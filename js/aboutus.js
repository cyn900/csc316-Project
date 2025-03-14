(function() {
    // Add styles dynamically
    const styles = `
    @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

        #about-us {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .member {
            text-align: center;
        }
        .member img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
        }
        .member h3 {
            margin: 1rem 0 0.5rem;
            font-size: 1.2rem;
        }
        .member p {
            margin: 0;
            color: #666;
        }
        .section {
            padding: 2rem 0;
        }
        .row {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
    `;

    // Inject styles into the document
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Data for the team members
    const teamMembers = [
        { name: "Cynthia Zhou", role: "Student Number", photo: "img/cynthia.png" },
        { name: "Jonathan Chen", role: "Squirrels are pretty fire.", photo: "img/jonathan.webp" },
        { name: "Melissa Cecilia", role: "You don't like squirrels? You're nuts.", photo: "img/melissa.webp" },
        { name: "Naura Taufiq", role: "What’s a squirrel’s favorite channel? Nutflix.", photo: "img/naura.jpg" }
    ];

    // Select the container
    const container = d3.select("#about-us");

    // Add a title
    container.append("h1")
        .text("About Us")
        .style("text-align", "center")
        .style("margin-bottom", "2rem")
        .style("font-family", "Amsterdam Four_ttf")
        .style("font-size", "3rem");

    // Create a grid for the team members
    const membersGrid = container.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(4, 1fr)")
        .style("gap", "2rem")
        .style("padding", "0 4rem");

    // Add each member to the grid
    membersGrid.selectAll(".member")
        .data(teamMembers)
        .enter()
        .append("div")
        .attr("class", "member")
        .html(d => `
            <img src="${d.photo}" alt="${d.name}">
            <h3>${d.name}</h3>
            <p>${d.role}</p>
        `);
})();