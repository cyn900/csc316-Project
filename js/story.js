// Load the CSV data
// First load word frequencies for the word cloud
d3.csv("data/word_frequencies.csv").then(function(wordData) {
    // Then load stories data
    d3.csv("data/stories.csv").then(function(storyData) {
        // Extract the stories
        const stories = storyData.map(d => d["Note Squirrel & Park Stories"]);
        let selectedWords = new Set();  // Change to Set for better management of selected words

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
                    <p>This is a word cloud of the most common words found in stories by sighters! Click words to explore related stories.</p>
                </div>
            `);

        // Create right section for wordcloud and controls
        const rightSection = container.append("div")
            .attr("class", "story-right-section");

        // Create controls container with refresh button
        const controls = rightSection.append("div")
            .attr("class", "story-controls");

        // Add story container with refresh button
        const storyContainer = controls.append("div")
            .attr("class", "story-container");

        // Add story header with refresh button
        const storyHeader = storyContainer.append("div")
            .attr("class", "story-header");

        // Add instructions to the header
        storyHeader.append("div")
            .attr("class", "story-instructions")
            .html('<i class="fas fa-info-circle"></i> Click words in the cloud to see related stories. Click again to deselect.');

        // Add button container
        const buttonContainer = storyHeader.append("div")
            .attr("class", "button-container");

        // Add reset button
        const resetButton = buttonContainer.append("button")
            .attr("class", "reset-button")
            .html('<i class="fas fa-undo"></i> Reset')
            .on("click", function() {
                // Reset all words to default color
                d3.selectAll("#wordcloud text")
                    .style("fill", "#bf1b1b");
                
                // Clear selected words
                selectedWords.clear();
                
                // Reset story display
                storyDisplay.html("<em>Click on words in the cloud to see related stories!</em>");
            });

        // Add refresh button
        const refreshButton = buttonContainer.append("button")
            .attr("class", "refresh-button")
            .html('<i class="fas fa-sync-alt"></i> New Story')
            .on("click", fetchStory);

        // Add story display
        const storyDisplay = storyContainer.append("div")
            .attr("class", "story-display");

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
        @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

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

            .story-container {
                border: 2px solid #eee;
                border-radius: 8px;
                overflow: hidden;
            }

            .story-header {
                padding: 10px 15px;
                background: #f8f8f8;
                border-bottom: 2px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .story-instructions {
                color: #666;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .story-instructions i {
                color: #bf1b1b;
            }

            .button-container {
                display: flex;
                gap: 10px;
            }

            .reset-button, .refresh-button {
                padding: 8px 16px;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            .reset-button {
                background: #666;
            }

            .reset-button:hover {
                background: #888;
            }

            .refresh-button {
                background: #bf1b1b;
            }

            .refresh-button:hover {
                background: #ff6b6b;
            }

            .reset-button i, .refresh-button i {
                font-size: 12px;
            }

            .story-display {
                padding: 15px;
                min-height: 100px;
                font-size: 1.1rem;
                line-height: 1.6;
            }

            .highlighted-word {
                color: #ff6b6b;
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
                    const word = d.text;
                    const element = d3.select(this);
                    
                    if (selectedWords.has(word)) {
                        // Deselect word
                        selectedWords.delete(word);
                        element.style("fill", "#bf1b1b");
                    } else {
                        // Select word
                        selectedWords.add(word);
                        element.style("fill", "#ff6b6b");
                    }

                    // Fetch a related story immediately
                    fetchStory();
                });
        }

        function fetchStory() {
            if (selectedWords.size === 0) {
                storyDisplay.html("<em>Click on words in the cloud to see related stories!</em>");
                return;
            }

            // Filter stories containing any of the selected words
            const filteredStories = stories.filter(story =>
                Array.from(selectedWords).some(word =>
                    story.toLowerCase().includes(word.toLowerCase())
                )
            );

            if (filteredStories.length === 0) {
                storyDisplay.html("<em>No stories found matching the selected words.</em>");
                return;
            }

            // Select a random story
            const randomStory = filteredStories[Math.floor(Math.random() * filteredStories.length)];

            // Create a regex pattern that matches any of the selected words
            const pattern = Array.from(selectedWords)
                .map(word => `\\b(\\w*${word}\\w*)\\b`)
                .join('|');
            
            // Highlight all selected words in the story
            const highlightedStory = randomStory.replace(
                new RegExp(pattern, 'gi'),
                match => `<span class="highlighted-word">${match}</span>`
            );

            storyDisplay.html(highlightedStory);
        }
    });
});
