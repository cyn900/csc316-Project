(function() {
    // Select the home page section and add home ID
    const homePage = d3.select("#Home\\ Page")
        .attr("id", "home-page");

    // Create the main content container
    const content = homePage.append("div")
        .attr("id", "home-container")
        .attr("class", "home-content");

    // Add the header content
    const header = content.append("div")
        .attr("id", "home-header")
        .attr("class", "home-header");

    // Add the apple icon
    header.append("div")
        .attr("id", "home-apple-icon")
        .attr("class", "home-icon apple")
        .html('<img src="img/apple-icon.svg" alt="Apple icon">');

    // Add the main title
    header.append("h1")
        .attr("id", "home-main-title")
        .attr("class", "home-title")
        .text("OFFICIAL FURRY FEDERATION");

    // Add the tree icon
    header.append("div")
        .attr("id", "home-tree-icon")
        .attr("class", "home-icon tree")
        .html('<img src="img/tree-icon.svg" alt="Tree icon">');

    // Add the stamp section
    const stampSection = content.append("div")
        .attr("id", "home-stamp-section")
        .attr("class", "home-stamp-section");

    // Add the left text
    stampSection.append("div")
        .attr("id", "home-stamp-text-left")
        .attr("class", "home-stamp-text left")
        .text("90% Dead CS Girls");

    // Add the stamp
    stampSection.append("div")
        .attr("id", "home-stamp")
        .attr("class", "home-stamp")
        .text("TOP SECRET");

    // Add the right text
    stampSection.append("div")
        .attr("id", "home-stamp-text-right")
        .attr("class", "home-stamp-text right")
        .text("CSC316 Winter 2025");

    // Add the main heading
    content.append("h2")
        .attr("id", "home-heading")
        .attr("class", "home-main-heading")
        .text("SQUIRRELS");

    // Add the subtitle
    content.append("div")
        .attr("id", "home-subtitle")
        .attr("class", "home-subtitle")
        .text("OF THE BIG APPLE");


    // Update CSS
    const style = document.createElement('style');
    style.textContent = `
        #home-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
        }

        .home-line {
            width: 100%;
            height: 2px;
            background: #000;
            margin: 1rem 0;
        }

        #home-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 0 1rem;
        }

        .home-icon img {
            width: 60px;
            height: 60px;
        }

        #home-main-title {
            font-family: 'Stencil Std', 'Arial Black', sans-serif;
            font-size: 3rem;
            margin: 0;
            letter-spacing: 2px;
        }

        #home-stamp-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.5rem 1rem;
        }

        .home-stamp-text {
            font-size: 1.2rem;
            color: #000;
        }

        #home-stamp {
            transform: rotate(-15deg);
            color: #bf1b1b;
            border: 3px solid #bf1b1b;
            padding: 0.5rem 2rem;
            font-size: 1.5rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        #home-heading {
            font-size: 8rem;
            font-weight: 900;
            margin: 2rem 0;
            letter-spacing: 4px;
            padding: 0 1rem;
        }

        #home-subtitle {
            background: #bf1b1b;
            color: white;
            font-size: 3rem;
            padding: 1rem 2rem;
            margin: 0 auto;
            width: fit-content;
            font-weight: bold;
        }

    `;
    document.head.appendChild(style);
})();
