// Load the CSV data
// First load word frequencies for the word cloud
d3.csv("data/word_frequencies.csv").then(function(wordData) {
    // Then load stories data
    d3.csv("data/stories.csv").then(function(storyData) {
        // Extract the stories
        const stories = storyData.map(d => d["Note Squirrel & Park Stories"]);
        let selectedWord = null;

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
                    <h2 class="story-title">Squirrel Sighting Stories</h2>
                </div>
                <div class="story-text-content">
                    <p>This is a word cloud of the most common words found in stories by sighters! Click a word to explore a related story.</p>
                </div>
            `);

        // Create right section for wordcloud and controls
        const rightSection = container.append("div")
            .attr("class", "story-right-section");

        // Create controls container
        const controls = rightSection.append("div")
            .attr("class", "story-controls");

        // Add story display
        const storyDisplay = controls.append("div")
            .attr("class", "story-display");

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
        @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);

            .story-left-section {
                padding: 2rem;
                max-width: 400px;
                margin: 0 auto;
            }

            .story-title-container {
                margin-bottom: 7rem;
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

            .story-display {
                padding: 15px;
                border: 2px solid #eee;
                min-height: 100px;
                margin-bottom: 2rem;
                font-size: 1.1rem;
                line-height: 1.6;
            }

            .highlighted-word {
                color: #bf1b1b;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);

        // Use the word frequencies from the CSV
        const wordArray = wordData.map(d => ({
            text: d.Word,
            size: Math.sqrt(+d.Frequency) * 3 // Scale the size appropriately
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
                .style("fill", "#bf1b1b")  // Default color
                .style("cursor", "pointer")
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                .text(d => d.text)
                .on("click", function(event, d) {
                    // Deselect previous word
                    d3.selectAll("text").style("fill", "#bf1b1b");

                    // Select new word
                    selectedWord = d.text;
                    d3.select(this).style("fill", "#ff6b6b");

                    // Fetch a related story immediately
                    fetchStory();
                });
        }

        function fetchStory() {
            if (!selectedWord) return;

            // Filter stories containing the selected word
            const filteredStories = stories.filter(story =>
                story.toLowerCase().includes(selectedWord.toLowerCase())
            );

            if (filteredStories.length === 0) {
                storyDisplay.html("<em>No stories found matching the selected word.</em>");
                return;
            }

            // Select a random story
            const randomStory = filteredStories[Math.floor(Math.random() * filteredStories.length)];

            // Highlight the selected word in the story
            const highlightedStory = randomStory.replace(
                new RegExp(`\\b(\\w*${selectedWord}\\w*)\\b`, "gi"),
                `<span class="highlighted-word">$1</span>`
            );

            storyDisplay.html(highlightedStory);
        }
    });
});
