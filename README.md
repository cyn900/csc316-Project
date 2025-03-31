# csc316-Project

## 1. Overview

**Project Description**  
The Squirrel Project explores the behavior and interactions of squirrels in Central Park, NYC. It visualizes data collected from various datasets to reveal patterns in movement, activity, and responses to environmental factors.

**Purpose / Motivation**  
We created this project to gain insights into how factors like human presence, weather, and other animals affect squirrel behavior. The project aims to provide fun, data-driven facts about squirrels while showcasing interactive data visualizations.

## 2. What We Are Handing In

This repository contains:

- **index.html**  
  The main HTML file for the entire project.

- **css/**  
  Contains a single CSS file that provides styling for the entire project.
    - `styles.css`

- **data/**  
  Contains all the data files that were collected for the project.
    - Files: `hectare.csv`, `individual.csv`, `stories.csv`, `word_frequencies.csv`

- **img/**  
  Contains all the image assets used by the project (e.g., photos, icons).

- **js/**  
  Contains JavaScript files, each corresponding to a page in the fullpage layout. All the JavaScript in this folder was written by our team.
    - Files: `home.js`, `aboutus.js`, `barchart.js`, `heatmap.js`, `linechart.js`, `map.js`, `network.js`, `parallelcoordinates.js`, `piechart.js`, `squirrel.js`

- **script/**  
  TODO: Explain
    - 'word_fetching.py'

- **README.md**  
  This file, describing the project structure and other relevant information.

## 3. Which Parts Are Our Code vs. Libraries

- **Our Code**:
    - All files in the `js/` folder are custom code written by our team.
    - The single CSS file in `css/` is also written by us.
    - The `index.html` file is likewise authored by our team.

- **Third-Party Libraries**:
    - D3.js: Creating interactive data visualizations, force-directed graphs, charts, and data manipulation
    - Bootstrap: Layout structure and responsive design
    - FullPage.js: Used for creating full-screen scrolling sections of our project layout
    - leaflet.js: Used for map visualization
    - Turf.js: Used for geospatial analysis
    - pandas: Used for data manipulation

## 4. Project Website & Screencast Links

- **Project Website (Deployed Version)**  
  TODO: [Project Website URL]

- **Screencast / Demo Video**  
  TODO: [Screencast Video Link]

## 5. Non-obvious Features of our Interface

- When fetching stories, if multiple words are selected, at least one word will appear in the randomly chosen story. It does not guarantee that all selected words are in the story. 
- Buffer Radius in the Squirrel Path Map: It is used to adjust the radius where we look for squirrels in relation to the path. We found during user testing that this feature is not usually used by testers. 
- You can draw multiple paths in the leaflet map. 
