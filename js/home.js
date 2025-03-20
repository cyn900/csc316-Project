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
        .html('<img src="img/apple-icon.png" alt="Apple Icon">');

    // Add the main title
    header.append("h1")
        .attr("id", "home-main-title")
        .attr("class", "home-title")
        .text("OFFICIAL  FURRY  FEDERATION");

    // Add the tree icon
    header.append("div")
        .attr("id", "home-tree-icon")
        .attr("class", "home-icon tree")
        .html('<img src="img/tree-icon.png" alt="Tree icon">');

    // Add the stamp section
    const stampSection = content.append("div")
        .attr("id", "home-stamp-section")
        .attr("class", "home-stamp-section");

    // Add the left text
    stampSection.append("div")
        .attr("id", "home-stamp-text-left")
        .attr("class", "home-stamp-text left")
        .text("90% Dead CS Girls");

    // Add the right text
    stampSection.append("div")
        .attr("id", "home-stamp-text-right")
        .attr("class", "home-stamp-text right")
        .text("CSC316 Winter 2025");
        
    // Add the stamp positioned to overlap both lines
    content.append("div")
        .attr("id", "home-stamp")
        .attr("class", "home-stamp")
        .html('<img src="img/secret.png" alt="Top Secret Stamp">');

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

    // Add project motivation at the bottom of the page
    const motivationSection = content.append("div")
        .attr("class", "home-motivation-section")
        .style("margin-top", "2rem")
        .style("padding", "1rem")
        .style("text-align", "center")
        .style("border-top", "1px solid rgba(0,0,0,0.1)")
        .style("max-width", "800px")
        .style("margin-left", "auto")
        .style("margin-right", "auto");
        
    motivationSection.append("p")
        .attr("class", "home-motivation-text")
        .style("font-style", "italic")
        .style("color", "#555")
        .style("font-size", "1.8rem")
        .style("line-height", "1.5")
        .text("Our project explores the behaviors of Central Park's squirrels, drawing insights into what conditions influence their activities and interactions. No squirrels were harmed in this process!");

    // Update CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');

        #home-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
            position: relative;
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
            width: 200px;
            height: 120px;
        }

        #home-main-title {
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
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
            position: relative;
        }

        #home-stamp {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            width: 180px;
        }
        
        #home-stamp img {
            width: 150%;
            height: auto;
            display: block;
        }

        #home-heading {
            font-size: 12rem;
            margin: 2rem 0;
            letter-spacing: 4px;
            padding: 0 1rem;
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
            font-style: bold;
            position: relative;
            z-index: 1;
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
