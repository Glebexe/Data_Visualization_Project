function GDPHeatmap() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'GDP';
    this.icon = "assets/heatmap.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'gdp-heatmap';

    // Title to display above the plot.
    this.title = 'GDP of countries from 2006 to 2017 in trillions';

    // Names for each axis.
    this.xAxisLabel = 'year';
    this.yAxisLabel = '';

    let self = this;
    
    // Layout object to store all common plot layout parameters 
    // and methods.
    this.layout = {

        // Margins of left and bottom of the table.
        leftMargin: 20,
        bottomMargin: 20,

        plotWidth: function() {
          return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
          return this.bottomMargin - this.topMargin;
        }
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically 
    // by the gallery when a visualisation is added.
    this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/GDP.csv', 'csv', 'header',
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

        // Find lowest and highest gdps for colour mapping.
        this.lowestGDP = this.data.getRow(0).get(3);
        this.highestGDP = 0;
        
        for(let i = 0; i < this.data.getRowCount(); i++){
            for(let j = 2; j < this.data.getColumnCount(); j++){
                let gdp = Number(this.data.getRow(i).get(j));
                
                if(this.lowestGDP > gdp)
                    this.lowestGDP = gdp;
                if(this.highestGDP < gdp)
                    this.highestGDP = gdp;
            } 
        }        
        
        this.colourTransitionSpeed = 2;
        
        //Create slider and slider title
        this.slidersTitle = createDiv("Colour transition speed").addClass('selectTitle').parent('rightSideContainer');
        this.stepSlider = createSlider(1, 10, this.colourTransitionSpeed, 0.1);
        this.stepSlider.parent('rightSideContainer')
    };

    this.destroy = function() {
        this.mainTitle.remove();
        this.stepSlider.remove();
        this.slidersTitle.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }
        
        drawTable();
    };
    
    function drawTable(){
        
        colourTransitionSpeed = self.stepSlider.value();
        
        //draw left column grid
        noFill();
        stroke(0);
        strokeWeight(2);
        for(let i = 0; i < self.data.getRowCount()+1; i++){
            rect(20+self.layout.leftMargin,50+50*i-self.layout.bottomMargin,150,50);
        }
        //draw top raw self
        for(let i = 0; i < self.data.getColumnCount()-1; i++){
            rect(170+80*i+self.layout.leftMargin,50-self.layout.bottomMargin,80,50);
        }
        
        //draw table content grid
        for(let i = 0; i < self.data.getRowCount(); i++){
            for(let j = 1; j < self.data.getColumnCount(); j++){
                let colourValue = self.mapGDPtoColour(self.data.getNum(i,j))
                fill(max(0,255-colourTransitionSpeed*colourValue),min(255,colourValue*colourTransitionSpeed),0);
                rect(90 + 80*j+self.layout.leftMargin,100+50*i-self.layout.bottomMargin,80,50);
            }
        }
        
        //fill the left column with names of counties
        fill(0);
        textSize(30);
        for(let i = 0; i < self.data.getRowCount(); i++){
            text(self.data.getRow(i).get(0),95+self.layout.leftMargin,125+50*i-self.layout.bottomMargin);
        }
        //fill the top raw with years 
        textSize(25);
        for(let i = 0; i < self.data.getColumnCount(); i++){
            text(self.data.columns[i+1],210+80*i+self.layout.leftMargin,75-self.layout.bottomMargin);
        }
        //fill the table with gdp values 
        textSize(30);
        for(let i = 0; i < self.data.getRowCount(); i++){
            for(let j = 1; j < self.data.getColumnCount(); j++){
                text((self.data.getNum(i,j)/1000000000000).toFixed(1),130+80*j+self.layout.leftMargin,130+50*i-self.layout.bottomMargin);
            }
        }
    }
    
    
    this.mapGDPtoColour = function(value) {
    return map(value,
               this.lowestGDP,  
               this.highestGDP,
               0,
               255);
    };
}
