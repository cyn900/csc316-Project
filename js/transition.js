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

    // Add the left text
    stampSection.append("div")
        .attr("id", "transition-stamp-text-left")
        .attr("class", "transition-stamp-text left")
        .text("90% Dead CS Girls");

    // Add the stamp
    stampSection.append("div")
        .attr("id", "transition-stamp")
        .attr("class", "transition-stamp")
        .text("TOP SECRET");

    // Add the right text
    stampSection.append("div")
        .attr("id", "transition-stamp-text-right")
        .attr("class", "transition-stamp-text right")
        .text("CSC316 Winter 2025");

    // Add the main heading (HOW TO FIND)
    content.append("h2")
        .attr("id", "transition-heading")
        .attr("class", "transition-main-heading")
        .text("HOW TO FIND");

    // Add the subtitle (our furry friends)
    content.append("div")
        .attr("id", "transition-subtitle")
        .attr("class", "transition-subtitle")
        .text("our furry friends");

    // Update CSS
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.cdnfonts.com/css/cocogoose');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap');

        #transition-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
            text-align: center;
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
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.5rem 1rem;
        }

        .transition-stamp-text {
            font-size: 1.2rem;
            color: #000;
        }

        #transition-stamp {
            transform: rotate(-15deg);
            color: #bf1b1b;
            border: 3px solid #bf1b1b;
            padding: 0.5rem 2rem;
            font-size: 1.5rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        #transition-heading {
            font-size: 5rem; /* Reduced size */
            margin: 2rem 0;
            letter-spacing: 4px;
            padding: 0 1rem;
            font-family: "COCOGOOSE", sans-serif;
            font-weight: 500;
            font-style: bold;
        }

        #transition-subtitle {
            background: #bf1b1b;
            color: white;
            font-size: 3rem;
            padding: 1rem 2rem;
            margin: 0 auto;
            width: fit-content;
            font-weight: bold;
            font-family: 'Dancing Script', cursive; /* Cursive style */
        }
    `;
    document.head.appendChild(style);
})();
