(function() {
    // Select the transition page section and add transition ID
    const transitionPage = d3.select("#Transition\\ Page")
        .attr("id", "transition-page");

    // Create the main content container
    const content = transitionPage.append("div")
        .attr("id", "transition-container")
        .attr("class", "transition-content");

    // Add the header content
    const header = content.append("div")
        .attr("id", "transition-header")
        .attr("class", "transition-header");

    // Add the apple icon
    header.append("div")
        .attr("id", "transition-apple-icon")
        .attr("class", "transition-icon apple")
        .html('<img src="img/apple-icon.png" alt="Apple Icon">');

    // Add the main title
    header.append("h1")
        .attr("id", "transition-main-title")
        .attr("class", "transition-title")
        .text("OFFICIAL  FURRY  FEDERATION");

    // Add the tree icon
    header.append("div")
        .attr("id", "transition-tree-icon")
        .attr("class", "transition-icon tree")
        .html('<img src="img/tree-icon.png" alt="Tree icon">');

    // Add the stamp section
    const stampSection = content.append("div")
        .attr("id", "transition-stamp-section")
        .attr("class", "transition-stamp-section");

    // Add centered guide text
    stampSection.append("div")
        .attr("id", "transition-guide-text")
        .attr("class", "transition-guide-text")
        .text("Welcome to the exciting next step of our exploration! Ready to put your newfound knowledge into action? We've designed an interactive map to guide your adventure through Central Park.");

    // Add the main heading (HOW TO FIND)
    content.append("h2")
        .attr("id", "transition-heading")
        .attr("class", "transition-main-heading")
        .text("HOW TO FIND");

    // Add the subtitle (our furry friends)
    content.append("div")
        .attr("id", "transition-subtitle")
        .attr("class", "transition-subtitle")
        .text("OUR FURRY FRIENDS");

    // Add squirrel images to bottom corners
    const bottomLeft = content.append("div")
        .attr("class", "corner-squirrel left")
        .style("position", "absolute")
        .style("bottom", "10rem")
        .style("left", "0")
        .style("z-index", "1")
        .html('<img src="img/squirrel4.png" alt="Squirrel 4">');

    const bottomRight = content.append("div")
        .attr("class", "corner-squirrel right")
        .style("position", "absolute")
        .style("bottom", "10rem")
        .style("right", "0")
        .style("z-index", "1")
        .html('<img src="img/squirrel5.png" alt="Squirrel 5">');

    // Update CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');

        #transition-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
            position: relative;
            background: transparent;
            min-height: 100vh;  /* Ensure full height for positioning */
        }

        .transition-line {
            width: 100%;
            height: 2px;
            background: #000;
            margin: 1rem 0;
        }

        #transition-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 0 1rem;
        }

        .transition-icon img {
            width: 200px;
            height: 120px;
        }

        #transition-main-title {
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
            font-size: 3rem;
            margin: 0;
            letter-spacing: 2px;
        }

        #transition-stamp-section {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0.5rem 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.8rem 1rem;
            position: relative;
            background: transparent;
        }

        .transition-guide-text {
            font-size: 1.2rem;
            color: #000;
            font-weight: bold;
            letter-spacing: 1px;
            text-align: center;
        }

        #transition-heading {
            font-size: 8rem;
            margin: 2rem 0;
            letter-spacing: 4px;
            padding: 0 1rem;
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
            font-style: bold;
            position: relative;
            z-index: 1;
        }

        #transition-subtitle {
            background: #bf1b1b;
            color: white;
            font-size: 3rem;
            padding: 1rem 2rem;
            margin: 0 auto;
            width: fit-content;
            font-weight: bold;
            font-family: "COCOGOOSE", sans-serif;
        }

        #transition-page {
            background: transparent;
        }

        .corner-squirrel img {
            width: 300px;
            height: auto;
            object-fit: contain;
        }

        .corner-squirrel.left img {
            transform: scaleX(-1);  /* Flip the left squirrel */
        }

        .corner-squirrel.right img {
            transform: scaleX(-1);  /* Flip the right squirrel */
        }

        .corner-squirrel {
            position: absolute;
            bottom: 0;
        }

        .corner-squirrel.left {
            left: 0;
        }

        .corner-squirrel.right {
            right: 0;
        }
    `;
    document.head.appendChild(style);
})();
