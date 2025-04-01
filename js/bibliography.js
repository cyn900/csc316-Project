(function() {
    // Select the bibliography page section and add bibliography ID
    const bibliographyPage = d3.select("#Bibliography\\ Page")
        .attr("id", "bibliography-page");

    // Create the main content container
    const content = bibliographyPage.append("div")
        .attr("id", "bibliography-container")
        .attr("class", "bibliography-content");

    // Add the header content
    const header = content.append("div")
        .attr("id", "bibliography-header")
        .attr("class", "bibliography-header");

    // Add the apple icon
    header.append("div")
        .attr("id", "bibliography-apple-icon")
        .attr("class", "bibliography-icon apple")
        .html('<img src="img/apple-icon.png" alt="Apple Icon">');

    // Add the main title
    header.append("h1")
        .attr("id", "bibliography-main-title")
        .attr("class", "bibliography-title")
        .text("BIBLIOGRAPHY");

    // Add the tree icon
    header.append("div")
        .attr("id", "bibliography-tree-icon")
        .attr("class", "bibliography-icon tree")
        .html('<img src="img/tree-icon.png" alt="Tree icon">');

    // Add the stamp section
    const stampSection = content.append("div")
        .attr("id", "bibliography-stamp-section")
        .attr("class", "bibliography-stamp-section");

    // Add the left text with NYC Open Data
    stampSection.append("div")
        .attr("id", "bibliography-stamp-text-left")
        .attr("class", "bibliography-stamp-text left")
        .html(`Data Sources: <a href="https://data.cityofnewyork.us/browse?category=Environment&Data-Collection_Data-Collection=2018+Central+Park+Squirrel+Census" target="_blank" class="data-source-link">NYC Open Data</a>`);

    // Add the right text
    stampSection.append("div")
        .attr("id", "bibliography-stamp-text-right")
        .attr("class", "bibliography-stamp-text right")
        .text("CSC316 Winter 2025");

    // Create a new custom section with two columns inside your bibliography container
    const customSection = bibliographyPage.append("div")
        .attr("class", "custom-section")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("margin-top", "2rem");

    // Left column with insightful end message instead of placeholder text
    customSection.append("div")
        .attr("class", "left-text")
        .style("flex", "1")
        .style("padding", "40px")
        .style("margin-top", "-15rem")
        .style("margin-left", "7rem")
        .style("color", "#000") 
        .style("text-align", "left")
        .style("line-height", "1.6")
        .style("font-size", "1.1rem")
        .html(`
            <h3 style="margin-top: 0; color: #bf1b1b; font-family: 'COCOGOOSE', sans-serif;">Thanks for exploring with us!</h3>
            <p>This project visualizes the fascinating world of Central Park's squirrels, revealing their behaviors, interactions, and habitats through data.</p>
            <p>As you've seen, these small creatures have complex lives - from their varied activities to their social connections with other park animals.</p>
            <p>Next time you're in a park, take a moment to observe these remarkable urban wildlife ambassadors. They're not just cute; they're essential parts of our urban ecosystems.</p>
            <p style="font-style: italic; margin-top: 20px;">Fun Fact: Squirrels bury nuts and often forget where, helping forests grow!</p>
        `);

    // Right column for the image
    const rightCol = customSection.append("div")
        .attr("class", "right-image")
        .style("flex", "1")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "flex-start")  // Align top with text
        .style("overflow", "hidden")  // Ensure cropping effect
        .style("position", "relative");  // Keep layout intact

    // Append the oversized apple image
    rightCol.append("img")
        .attr("src", "img/apple2.png")
        .attr("alt", "Apple Image")
        .style("width", "130%")  // Increase size
        .style("height", "130%")  // Increase size
        .style("object-fit", "cover")  // Ensure cropping
        .style("margin-right", "-40%")  // Crop left side
        .style("margin-bottom", "-60%");  // Crop bottom side

    // Update CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');

        #bibliography-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
        }

        .bibliography-line {
            width: 100%;
            height: 2px;
            background: #000;
            margin: 1rem 0;
        }

        #bibliography-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 0 1rem;
        }

        .bibliography-icon img {
            width: 200px;
            height: 120px;
        }

        #bibliography-main-title {
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
            font-size: 3rem;
            margin: 0;
            letter-spacing: 2px;
        }

        #bibliography-stamp-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.5rem 1rem;
        }

        .bibliography-stamp-text {
            font-size: 1.2rem;
            color: #000;
        }
        
        .data-source-link {
            color: #bf1b1b;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s ease;
        }
        
        .data-source-link:hover {
            color: #e63e3e;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
})();