(function() {
    // Add styles dynamically
    const styles = `
    @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

        #about-us {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }
        .about-intro {
            font-size: 1.5rem;
            color: #444;
            margin-bottom: 3rem;
            line-height: 1.6;
        }
        .member {
            text-align: center;
        }
        .member img {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            object-fit: cover;
            transition: transform 0.3s ease-in-out;
        }
        .member img:hover {
            transform: scale(1.1);
        }
        .member h3 {
            margin: 1rem 0 0.3rem;
            font-size: 1.7rem;
        }
        .member p {
            margin: 0;
            font-size: 1.2rem;
            color: #666;
        }
        .email {
            font-size: 1rem;
            color: #007bff;
            text-decoration: none;
            display: block;
            margin-top: 0.3rem;
        }
        .email:hover {
            text-decoration: underline;
        }
        .section {
            padding: 2rem 0;
        }
        @media (max-width: 768px) {
            .members-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;

    // Inject styles into the document
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Select the container
    const container = d3.select("#about-us");

    // Add a title
    container.append("h1")
        .text("About Us")
        .style("text-align", "center")
        .style("margin-bottom", "4rem")
        .style("font-family", "Amsterdam Four_ttf")
        .style("font-size", "3rem");

    // Add an introduction section
    container.append("p")
        .attr("class", "about-intro")
        .html("We’re a team of data enthusiasts passionate about uncovering insights into the wildlife of New York City. <br>Through data visualization and analysis, we explore how environmental factors influence squirrel behavior in Central Park. 🐿️");

    // Data for the team members
    const teamMembers = [
        { name: "Cynthia Zhou", role: "Wanna see squirrels?!", email: "cyn.zhou@mail.utoronto.ca", photo: "img/cynthia.png" },
        { name: "Jonathan Chen", role: "Squirrels are pretty fire.", email: " jonathanjs.chen@mail.utoronto.ca", photo: "img/jonathan.webp" },
        { name: "Melissa Cecilia", role: "You don't like squirrels? You're nuts.", email: "melissa.cecilia@mail.utoronto.ca", photo: "img/melissa.webp" },
        { name: "Naura Taufiq", role: "What’s a squirrel’s favorite channel? Nutflix.", email: "naura.taufiq@mail.utoronto.ca", photo: "img/naura.jpg" }
    ];

    // Create a grid for the team members
    const membersGrid = container.append("div")
        .attr("class", "members-grid")
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
            <a href="mailto:${d.email}" class="email">${d.email}</a>
        `);
})();
