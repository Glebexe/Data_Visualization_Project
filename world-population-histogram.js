function WorldPopulationHistogram() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'World Population';
    this.icon = "assets/verticalBars.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'world-population-histogram';

    // Title to display above the plot.
    this.title = 'World Population from 1960 to 2021';

    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = 'billions';
    
    let self = this;

    let marginSize = 35;
    let mergingStep = 4;    
    
    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom 
        // have double margin size to make space for axis and 
        // tick labels on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function() {
          return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
          return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: false,

        // Number of axis tick labels to draw so that they are 
        // not drawn on top of one another.
        numXTickLabels: 11,
        numYTickLabels: 5
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        this.data = loadTable(
            './data/Global_annual_population.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Title of the whole visualisation  
        this.mainTitle = createSpan(this.title).parent('header');

        // Set min and max years: assumes data is sorted by date.
        this.startYear = this.data.getNum(0, 0);
        this.endYear = this.data.getNum(this.data.getRowCount() - 1, 0);

        // Find lowest and highest populations for mapping to canvas height.
        this.populationBottom = floor(this.data.getNum(0,1));
        this.populationTop = ceil(this.data.getNum(this.data.getRowCount() - 1,1));

        //Create slider and slider title
        this.slidersTitle = createDiv("Merge Step").addClass('selectTitle').parent('rightSideContainer');
        this.stepSlider = createSlider(1, this.data.getRowCount()-2, 6, 1);
        this.stepSlider.parent('rightSideContainer')
    };

    this.destroy = function() {
        this.stepSlider.remove();
        this.slidersTitle.remove();
        this.mainTitle.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.populationBottom,
                            this.populationTop,
                            this.layout,
                            this.mapPopulationToHeight.bind(this),
                            0);

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,this.yAxisLabel,this.layout);
        
        let averagePopulations = drawBars();
        
        // Draw interface which interacts with cursor.
        drawAdditionalInterface(averagePopulations);
    };
    
    function drawBars(){
        //Set bars width.
        mergingStep = self.stepSlider.value();
        let rectStep = self.layout.plotWidth() / (self.data.getRowCount()/mergingStep);

        // Draw histrogram.
        let tmpPopulationForMerging = [];
        let averagePopulations = [];
        for (let i = 0; i < self.data.getRowCount()-1; i++) {
            
            // Draw a bar when the right amount of values are stored in tmpPopulationForMerging
            // or it is the end of the plot.
            if((tmpPopulationForMerging.length == mergingStep) || (i+1 == self.data.getRowCount())){
                
                // Calculate the average population of the current time step.
                let sum = 0;
                for(let j = 0; j < tmpPopulationForMerging.length; j++)
                    sum += tmpPopulationForMerging[j];
                let aletagePopulation = sum/mergingStep;
                
                // Draw a bar.
                fill(116, 233, 228);
                stroke(255);                
                rect(self.mapYearToWidth(self.data.getNum(i-tmpPopulationForMerging.length,0)),
                     self.mapPopulationToHeight(aletagePopulation),
                     rectStep,
                     self.layout.bottomMargin-self.mapPopulationToHeight(aletagePopulation));
                
                // Add current average population for the additional interface.
                averagePopulations.push(aletagePopulation);
                
                // Reset tmpPopulationForMerging array.
                tmpPopulationForMerging = [];
                tmpPopulationForMerging.push(self.data.getNum(i,1));
            }
            else{
                tmpPopulationForMerging.push(self.data.getNum(i,1))
            }
            
            // The number of x-axis labels to skip so that only
            // numXTickLabels are drawn.
            let xLabelSkip = ceil(self.data.getRowCount() / self.layout.numXTickLabels);

            // Draw the tick label marking the start of the previous year.
            if (i % xLabelSkip == 0 && i > 0) {
              drawXAxisTickLabel(self.data.getNum(i-1,0), self.layout, self.mapYearToWidth.bind(self));
            }            
        }
        
        return averagePopulations;
    }
    
    function drawAdditionalInterface(averagePopulations){
        stroke(100);
        // Draw additional interface when cursor is in the boundaries of the plot.
        if(mouseX > self.layout.leftMargin && mouseX < self.layout.rightMargin &&
          mouseY < self.layout.bottomMargin && mouseY > self.layout.topMargin){
            
            currHight = self.mapPopulationToHeight(averagePopulations[floor((mouseX-self.layout.leftMargin)/(self.layout.plotWidth()/((self.data.getRowCount()-1)/mergingStep)))]);
            
            // Draw one vertical and one horizontal line.
            line(mouseX,self.layout.topMargin, mouseX, self.layout.bottomMargin);
            line(self.layout.leftMargin,currHight, self.layout.rightMargin,currHight);
            
            // Draw a small circle on top of the bar.
            stroke(255);
            fill(116, 233, 228)
            ellipse(mouseX,currHight,15,15);
            
            // Draw background shape for population numder. 
            stroke(0);
            fill(255);
            beginShape();
            vertex(mouseX,currHight);
            vertex(mouseX+15, currHight-10);
            vertex(mouseX+15,currHight-15);
            vertex(mouseX+70,currHight-15);
            vertex(mouseX+70,currHight+15);
            vertex(mouseX+15,currHight+15);
            vertex(mouseX+15,currHight+10);
            vertex(mouseX,currHight);
            endShape(CLOSE);
            
            // Draw population numder displayed with two decimal places and 'B' letter.
            fill(0);
            if(averagePopulations[floor((mouseX-self.layout.leftMargin)/(self.layout.plotWidth()/((self.data.getRowCount()-1)/mergingStep)))] != null)
                text(averagePopulations[floor((mouseX-self.layout.leftMargin)/(self.layout.plotWidth()/((self.data.getRowCount()-1)/mergingStep)))]
                     .toFixed(2) + "B", mouseX+40, currHight)            
        }
    }

    this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,   // Draw left-to-right from margin.
               this.layout.rightMargin);
    };

    this.mapPopulationToHeight = function(value) {
    return map(value,
           this.populationBottom,
           this.populationTop,
           this.layout.bottomMargin,   // Draw bottom-to-top from margin.
           this.layout.topMargin);
    };
}
