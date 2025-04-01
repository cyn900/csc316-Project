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
        .text("Cynthia Zhou, Jonathan Chen, Melissa Cecilia, Naura Taufiq");

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
        .style("max-width", "1500px")
        .style("margin-left", "auto")
        .style("margin-right", "auto");
        
    motivationSection.append("p")
        .attr("class", "home-motivation-text")
        .style("font-style", "italic")
        .style("color", "#555")
        .style("font-size", "2.2rem")
        .style("line-height", "1.5")
        .text("Our project explores the behaviors of Central Park's squirrels, drawing insights into what conditions " +
            "influence their activities and interactions. This project is powered by the 2018 Central Park Squirrel Census, sourced from NYC Open Data." +
            " ");

    motivationSection.append("p")
        .attr("class", "home-motivation-text2")
        .style("font-style", "bold")
        .style("color", "rgba(191, 27, 27, 0.8)")
        .style("font-size", "1.5rem")
        .style("line-height", "1.5")
        .text("*No squirrels were harmed in this process*");

    // Add animation classes and initial states to elements
    header.style("opacity", "0")
        .style("transform", "translateY(-20px)");

    stampSection.style("opacity", "0")
        .style("transform", "translateY(20px)");

    const stamp = content.select("#home-stamp")
        .style("opacity", "0")
        .style("transform", "scale(0.8) rotate(-15deg)");

    const mainHeading = content.select("#home-heading")
        .style("opacity", "0")
        .style("transform", "translateY(30px)");

    const subtitle = content.select("#home-subtitle")
        .style("opacity", "0")
        .style("transform", "translateY(20px)");

    const motivation = content.select(".home-motivation-section")
        .style("opacity", "0")
        .style("transform", "translateY(20px)");

    // Sequence the animations with faster timings
    // Header animation
    header.transition()
        .duration(500)    // Reduced from 800 to 500
        .delay(100)      // Reduced from 200 to 100
        .style("opacity", "1")
        .style("transform", "translateY(0)");

    // Stamp section animation
    stampSection.transition()
        .duration(500)    // Reduced from 800 to 500
        .delay(300)      // Reduced from 600 to 300
        .style("opacity", "1")
        .style("transform", "translateY(0)");

    // Stamp animation with rotation
    stamp.transition()
        .duration(600)    // Reduced from 1000 to 600
        .delay(500)      // Reduced from 1000 to 500
        .style("opacity", "1")
        .style("transform", "scale(1) rotate(0deg)");

    // Main heading animation
    mainHeading.transition()
        .duration(500)    // Reduced from 800 to 500
        .delay(700)      // Reduced from 1400 to 700
        .style("opacity", "1")
        .style("transform", "translateY(0)");

    // Subtitle animation
    subtitle.transition()
        .duration(500)    // Reduced from 800 to 500
        .delay(900)      // Reduced from 1800 to 900
        .style("opacity", "1")
        .style("transform", "translateY(0)");

    // Motivation section animation
    motivation.transition()
        .duration(500)    // Reduced from 800 to 500
        .delay(1100)     // Reduced from 2200 to 1100
        .style("opacity", "1")
        .style("transform", "translateY(0)");

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
            top: 12%;
            left: 40%;
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

        /* Update transition properties to be faster */
        .home-header,
        .home-stamp-section,
        #home-stamp,
        #home-heading,
        #home-subtitle,
        .home-motivation-section {
            transition: all 0.5s ease-out;  // Reduced from 0.8s to 0.5s
        }

        /* Update hover effect timing */
        .home-icon img,
        #home-stamp img,
        #home-subtitle {
            transition: all 0.2s ease;  // Reduced from 0.3s to 0.2s
        }

        .home-icon img:hover {
            transform: scale(1.1);
        }

        #home-stamp img:hover {
            transform: scale(1.05);
        }

        #home-subtitle:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
})();
