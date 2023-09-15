function VehiclesBoxplot() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'Vehicles prices';
    this.icon = "assets/boxplot.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'vehicles-boxplot';

    // Title to display above the plot.
    this.title = 'Prices of cars with different drives types on Craigslist';

    // Names for each axis.
    this.xAxisLabel = 'drive';
    this.yAxisLabel = '$';

    let self = this;
    let driveNames = ['fwd','rwd','4wd'];
    
    let marginSize = 35;
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
        grid: false,

        // Number of axis tick labels to draw so that they are 
        // not drawn on top of one another.
        numYTickLabels: 7,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically 
    // by the gallery when a visualisation is added.
    this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/vehiclesPrepared.csv', 'csv', 'header',
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

        // Create an arrays of three type of engines
        let rwd = [];
        let fwd = [];
        let fourwd = [];
        
        for(let i = 0; i < this.data.getRowCount(); i++){
            if(this.data.getRow(i).get(1) == 'rwd')
                rwd.push(Number(this.data.getRow(i).get(0)))
            else if(this.data.getRow(i).get(1) == 'fwd')
                fwd.push(Number(this.data.getRow(i).get(0)))
            else
                fourwd.push(Number(this.data.getRow(i).get(0)))
        }
        
        // Prepare data for visualization by sorting and 
        // removing emissions.
        rwd = sort(rwd).slice(150,rwd.length-150);
        fwd = sort(fwd).slice(150,fwd.length-150);
        fourwd = sort(fourwd).slice(150,fourwd.length-150);
        
        // Set the lowest and highest car prices for mapping to canvas height.
        this.bottomPrice = 0;   
        this.topPrice = max(rwd[rwd.length-1],fwd[fwd.length-1],fourwd[fourwd.length-1]);
        
        // Create an array of percentiles for plotting purpose.
        this.drivePercentiles = [];
        
        this.drivePercentiles.push(drivePercentilesInit(rwd));
        this.drivePercentiles.push(drivePercentilesInit(fwd));
        this.drivePercentiles.push(drivePercentilesInit(fourwd));
    };
    
    function drivePercentilesInit(array){
        
        let percentiles = [];
        percentiles.push(array[round(array.length/100*2.5)]); // minimun
        percentiles.push(array[round(array.length/100*25)]); // lower centile
        percentiles.push(array[round(array.length/100*50)]); // median
        percentiles.push(array[round(array.length/100*75)]); // upper centile
        percentiles.push(array[round(array.length/100*97.5)]); // maximum centile
        
        return percentiles;
    }

    this.destroy = function() {
        this.mainTitle.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.bottomPrice,
                            this.topPrice,
                            this.layout,
                            this.mapPriceToHeight.bind(this),
                            0);

        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,this.yAxisLabel,this.layout);
        
        // Draw 3 boxplots
        for(let i = 0; i < 3; i++){            
        
            drawXAxisTickCategoricalLabel(this.mapDriveTypeToWidth(i+1), this.layout, driveNames[i]);
            
            drawBoxplot(this.mapDriveTypeToWidth(i+1),this.drivePercentiles[i]);            
        }
    };
    
    function drawBoxplot(centerX, percentiles){
        
        // Draw top two perpendicular lines.
        stroke(0);
        strokeWeight(5);
        line(centerX-50, self.mapPriceToHeight(percentiles[4]), centerX+50, self.mapPriceToHeight(percentiles[4]));
        strokeWeight(2);
        line(centerX,self.mapPriceToHeight(percentiles[4]),centerX,self.mapPriceToHeight(percentiles[3]));
        
        // Draw rectangle.
        fill(234,141,247);
        rect(centerX-50,
             self.mapPriceToHeight(percentiles[3]),
             100,
             self.mapPriceToHeight(percentiles[1])-self.mapPriceToHeight(percentiles[3]));
        
        // Draw middle horizontal line.
        stroke(0);
        strokeWeight(5);
        line(centerX-49, self.mapPriceToHeight(percentiles[2]), centerX+49, self.mapPriceToHeight(percentiles[2]));
        
        
        // Draw bottom two perpendicular lines.
        strokeWeight(2);        line(centerX,self.mapPriceToHeight(percentiles[1]),centerX,self.mapPriceToHeight(percentiles[0]));
        
        strokeWeight(5);
        line(centerX-50, self.mapPriceToHeight(percentiles[0]), centerX+50, self.mapPriceToHeight(percentiles[0]));
        strokeWeight(2);
    }
    
    this.mapDriveTypeToWidth = function(value) {
    return map(value,
               0,
               4,
               this.layout.leftMargin,   // Draw left-to-right from margin.
               this.layout.rightMargin);
    };

    this.mapPriceToHeight = function(value) {
    return map(value,
           this.bottomPrice,
           this.topPrice,
           this.layout.bottomMargin,   // Draw bottom-to-top from margin.
           this.layout.topMargin);
    };
}