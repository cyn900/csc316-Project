// Load the CSV data
d3.csv("data/stories.csv").then(function(data) {
    // Extract the stories
    const stories = data.map(d => d["Note Squirrel & Park Stories"]);
    let selectedWords = [];

    // Create controls container
    const controls = d3.select("#wordcloud")
        .append("div")
        .attr("class", "controls")
        .style("margin-bottom", "20px");

    // Add HTML button
    const button = controls.append("button")
        .text("Fetch Random Story")
        .style("padding", "10px")
        .style("cursor", "pointer");

    // Add story display
    const storyDisplay = controls.append("div")
        .attr("class", "story-display")
        .style("padding", "15px")
        .style("border", "2px solid #eee")
        .style("min-height", "100px");

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
        const cloudContainer = d3.select("#wordcloud")
            .append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", `translate(${layout.size()[0]/2},${layout.size()[1]/2})`);

        cloudContainer.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("font-family", "Impact")
            .style("fill", "steelblue")
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
            .text(d => d.text)
            .on("click", function(event, d) {
                // Toggle word selection
                const idx = selectedWords.indexOf(d.text);
                if (idx === -1) {
                    selectedWords.push(d.text);
                    d3.select(this).style("fill", "#ff6b6b");
                } else {
                    selectedWords.splice(idx, 1);
                    d3.select(this).style("fill", "steelblue");
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