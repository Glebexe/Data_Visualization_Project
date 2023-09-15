// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
let gallery;

function setup() {
    // Create a canvas to fill the content div from index.html.
    const c = createCanvas(1200, 576);    
    c.parent('content'); 

    // Create a new gallery object.
    gallery = new Gallery();

    // Add the visualisation objects here.
    gallery.setup();
    gallery.addVisual(new TechDiversityRace());
    gallery.addVisual(new TechDiversityGender());
    gallery.addVisual(new PayGapByJob2017());
    gallery.addVisual(new PayGapTimeSeries());
    gallery.addVisual(new ClimateChange());
    gallery.addVisual(new WorldPopulationHistogram());
    gallery.addVisual(new VehiclesBoxplot());
    gallery.addVisual(new GDPHeatmap());
    gallery.addVisual(new GPUsBubbleChart());
    gallery.addVisual(new OlimpicMedalsStreamgraph());
}

function draw() {
    background(255);
    if (gallery.selectedVisual != null) {
        gallery.selectedVisual.draw();
    }
}
