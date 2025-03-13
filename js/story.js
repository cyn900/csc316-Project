// Load the CSV data
d3.csv("data/stories.csv").then(function(data) {
    // Extract the stories
    const stories = data.map(d => d["Note Squirrel & Park Stories"]);
    let selectedWords = [];

    // Create main container with grid layout
    const container = d3.select("#wordcloud")
        .style("display", "grid")
        .style("grid-template-columns", "1fr 2fr")  // 1:2 ratio
        .style("gap", "4rem")
        .style("padding", "0 4rem")
        .style("background", "transparent");

    // Create left section for text content
    const leftSection = container.append("div")
        .attr("class", "story-left-section")
        .html(`
            <div class="story-title-container">
                <h2 class="story-title">Squirrel Stories</h2>
            </div>
            <div class="story-text-content">
                <p>This is a world cloud of the most common words found in stories by sighters! Try to click on one of them and click fetch a random story to see what kind of stories sighters tell.</p>
            </div>
        `);

    // Create right section for wordcloud and controls
    const rightSection = container.append("div")
        .attr("class", "story-right-section");

    // Create controls container
    const controls = rightSection.append("div")
        .attr("class", "story-controls");

    // Add HTML button
    const button = controls.append("button")
        .attr("class", "story-button")
        .text("Fetch Random Story");

    // Add story display
    const storyDisplay = controls.append("div")
        .attr("class", "story-display");

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
    @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

        .story-left-section {
            padding: 2rem;
            max-width: 400px;
            margin: 0 auto;
        }

        .story-title-container {
            margin-bottom: 2rem;
        }

        .story-title {
            font-size: 50px;
            font-family: "Amsterdam Four_ttf";
            color: black;
            font-weight: 500;
        }

        .story-text-content {
            font-size: 1.2rem;
            line-height: 1.8;
        }

        .story-controls {
            margin-bottom: 2rem;
        }

        .story-button {
            padding: 10px 20px;
            cursor: pointer;
            background: #bf1b1b;
            color: white;
            border: none;
            font-size: 1rem;
        }

        .story-display {
            padding: 15px;
            border: 2px solid #eee;
            min-height: 100px;
            margin-bottom: 2rem;
        }
    `;
    document.head.appendChild(style);

    // Process words with better filtering
    const wordCounts = {};
    stories.forEach(story => {
        const words = story.toLowerCase().match(/[a-z']+/g) || [];
        words.forEach(word => {
            if (word.length > 1) { // Exclude single-letter words
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });

    // Create word cloud
    const wordArray = Object.keys(wordCounts).map(word => ({
        text: word,
        size: wordCounts[word] * 10
    }));

    const layout = d3.layout.cloud()
        .size([800, 400])
        .words(wordArray)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", draw);

    layout.start();

    function draw(words) {
        // Create SVG in the right section instead of directly in #wordcloud
        const cloudContainer = rightSection.append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", `translate(${layout.size()[0]/2},${layout.size()[1]/2})`);

        cloudContainer.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Impact")
            .style("fill", "#bf1b1b")  // Updated to match theme color
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
            .text(d => d.text)
            .on("click", function(event, d) {
                const idx = selectedWords.indexOf(d.text);
                if (idx === -1) {
                    selectedWords.push(d.text);
                    d3.select(this).style("fill", "#ff6b6b");
                } else {
                    selectedWords.splice(idx, 1);
                    d3.select(this).style("fill", "#bf1b1b");
                }
            });
    }

    // Story fetching logic
    button.on("click", () => {
        const filteredStories = selectedWords.length > 0
            ? stories.filter(story => 
                selectedWords.some(word => 
                    story.toLowerCase().includes(word.toLowerCase())
                )
            ) : stories;

        if (filteredStories.length === 0) {
            storyDisplay.html("<em>No stories found matching selected words</em>");
            return;
        }

        const randomStory = filteredStories[Math.floor(Math.random() * filteredStories.length)];
        storyDisplay.html(randomStory);
    });
});