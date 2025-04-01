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
            .style("grid-template-columns", "1.4fr 1.6fr")  // Changed from "2fr 1fr" to "1.2fr 1.8fr"
            .style("gap", "4rem")
            .style("padding", "0 4rem")
            .style("background", "transparent");

        // Create left section for wordcloud first (switched from right)
        const leftSection = container.append("div")
            .attr("class", "story-right-section"); // Keep the class name for consistent styling

        // Create right section for text content (switched from left)
        const rightSection = container.append("div")
            .attr("class", "story-left-section")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("gap", "2rem");

        // Add title at the top of right section
        rightSection.append("div")
            .attr("class", "story-title-container")
            .html(`
                <h2 class="story-title">Squirrel Sighting Stories</h2>
                <p class="story-description">This is a word cloud of the most common words found in stories by sighters! Click words to explore related stories.</p>
            `);

        // Add story container at the bottom of right section
        const storyContainer = rightSection.append("div")
            .attr("class", "story-container");

        // Add story header with refresh button
        const storyHeader = storyContainer.append("div")
            .attr("class", "story-header");

        // Add instructions to the header
        storyHeader.append("div")
            .attr("class", "story-instructions")
            .html('<i class="fas fa-info-circle"></i> Click reset to unclick all the words.');

        // Add button container
        const buttonContainer = storyHeader.append("div")
            .attr("class", "button-container");

        // Add story display
        const storyDisplay = storyContainer.append("div")
            .attr("class", "story-display");

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

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
        @import url(https://db.onlinewebfonts.com/c/07cb29fdcb073fff840edc6de2067b50?family=Amsterdam+Four_ttf);
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

            .story-left-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                height: 100%;
                margin-right: 10%;
            }

            .story-title-container {
                margin-bottom: 2rem;
            }

            .story-description {
                font-size: 1.2rem;
                line-height: 1.6;
                color: #666;
                margin-top: 1rem;
            }

            .story-container {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                border: 2px solid #eee;
                border-radius: 8px;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .story-right-section {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                padding: 2rem;
            }

            .story-right-section svg {
                width: 100%;
                height: 100%;
                max-width: 600px;  // Match the layout width
                max-height: 400px; // Match the layout height
                display: block;
                margin: auto;
            }

            .story-controls {
                margin-bottom: 2rem;
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
            .size([600, 400])  // Changed from [800, 400] to [600, 400]
            .words(wordArray)
            .padding(8)  // Increased padding between words
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Impact")
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();

        function draw(words) {
            const cloudContainer = leftSection.append("svg")
                .attr("viewBox", `0 0 600 400`)  // Match the layout size
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("width", "100%")
                .style("height", "auto")
                .append("g")
                .attr("transform", `translate(${600/2},${400/2})`);  // Center based on new dimensions

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
