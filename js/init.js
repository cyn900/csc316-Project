// Initialize general page settings
(function() {
    // Apply background to all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.backgroundImage = 'url("img/bg.png")';
        section.style.backgroundSize = 'cover';
        section.style.backgroundRepeat = 'no-repeat';
        section.style.backgroundPosition = 'center';
    });
})(); 