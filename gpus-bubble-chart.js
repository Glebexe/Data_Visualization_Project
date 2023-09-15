function GPUsBubbleChart() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'GPUs';
    this.icon = "assets/bubbleChart.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'gpus-upgraded-scatterplot';

    // Title to display above the plot.
    this.title = 'GPUs GFLOPS from 2016 to 2020 with circle proportional to gpu memory size';

    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = 'GFLOPS';

    let marginSize = 35;
    
    let self = this;

    // Layout object to store all common plot layout parameters 
    // and methods.
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
        grid: true,

        // Number of axis tick labels to draw so that they are 
        // not drawn on top of one another.
        numYTickLabels: 8
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically 
    // by the gallery when a visualisation is added.
    this.preload = function() {
    this.data = loadTable(
        './data/GPUs.csv', 'csv', 'header',
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
        this.startYear = this.data.getNum(this.data.getRowCount() - 1, 'Year')-1; // -1 to make a gap at the start
        this.endYear = this.data.getNum(0, 'Year')+1; // +1 to make a gap at the end

        // Set min and max number of GFLOPs for mapping to canvas height.
        this.minGFLOPS = 0;
        this.maxGFLOPS = max(this.data.getColumn('GFLOPS'))*1.1; //*1.1 to make a gap at the top
        
        // Find min and max memory size for mapping to circles diameter.
        this.minMemorySize = min(this.data.getColumn('Memory_size'));
        this.maxMemorySize = max(this.data.getColumn('Memory_size'));
        
        // Set boundaries for circle size
        this.minCircleSize = 10;
        this.maxCircleSize = 100;
    };

    this.destroy = function() {
        this.mainTitle.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minGFLOPS,
                            this.maxGFLOPS,
                            this.layout,
                            this.mapGFLOPSToHeight.bind(this),
                            0);

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
                       this.yAxisLabel,
                       this.layout);


        drawBubbles();
    };
    
    function drawBubbles(){
        // Loop over all rows and draw circles 
        // with its size proportional to the memory size.
        fill(0);
        for (let i = 0; i < self.data.getRowCount(); i++) {
            
            //draw grid
            if (i == 0 || self.data.getNum(i,'Year') != self.data.getNum(i-1,'Year')) {
                drawXAxisTickLabel(self.data.getNum(i,'Year'), self.layout, self.mapYearToWidth.bind(self));
            }
            
            let x = self.mapYearToWidth(self.data.getNum(i,'Year'));
            let y = self.mapGFLOPSToHeight(self.data.getNum(i,'GFLOPS'));
            let radius = self.mapMemorySizeToDiameter(self.data.getNum(i,'Memory_size')) / 2;
            
            //if mouse over a circle, highlight it and print gpu name
            if(mouseX > x-radius && mouseX < x+radius && mouseY > y-radius && mouseY < y+radius){
                let gpuName = self.data.get(i,'Name');
                strokeWeight(5);
                
                strokeWeight(5);
                stroke(255,255,255);
                text(gpuName,x+4.5*gpuName.length+radius,y-radius);
                
                if(gpuName.split(' ')[0] == 'GeForce' || gpuName.split(' ')[0] == 'RTX')
                    stroke(0,255,0);
                else if(gpuName.split(' ')[0] == 'Radeon')
                    stroke(255,0,0);
                else
                    stroke(0,0,255);
            }
            
            circle(x, y, radius*2);
            
            strokeWeight(1);
            noStroke();
        }
    }

    this.mapYearToWidth = function(value) {
        return map(value,
                   this.startYear,
                   this.endYear,
                   this.layout.leftMargin,   // Draw left-to-right from margin.
                   this.layout.rightMargin);
    };

    this.mapGFLOPSToHeight = function(value) {
        return map(value,
               this.minGFLOPS,
               this.maxGFLOPS,
               this.layout.bottomMargin,   // Draw bottom-to-top from margin.
               this.layout.topMargin);
    };

    this.mapMemorySizeToDiameter = function(value) {
        return map(value,
               this.minMemorySize,
               this.maxMemorySize,
               this.minCircleSize,  
               this.maxCircleSize);
    };
}
