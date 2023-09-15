function OlimpicMedalsStreamgraph() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'Olimpic Medals';
    this.icon = "assets/streamgraph.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'olimpic-medals-streamgraph';

    // Title to display above the plot.
    this.title = 'Total number of olimpic medals for contries from 2000 to 2016';

    // Names for axis.
    this.xAxisLabel = 'year';

    let marginSize = 35;
    
    let self = this;

    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,

        // Margin positions around the plot. Left and bottom 
        // have double margin size to make space for axis and 
        // medals numbers on the canvas.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize*6, // *6 to make space for country names
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        }
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
    this.data = loadTable(
        './data/OlimpicMedals.csv', 'csv', 'header',
        // Callback function to set the value
        // this.loaded to true.
        function(table) {
            self.loaded = true;
        });
    };
    
    // Country name constructor to keep all necessary data in an object
    this.createCountryName = function(x_pos, y_pos, name) {
        let countryName = 
        {
            x_pos: undefined,
            y_pos: undefined,
            name: undefined,
            width: undefined,

            setup: function(x_pos, y_pos, name) {
                this.x_pos = x_pos;
                this.y_pos = y_pos;
                this.name = name;
                this.width = name.length*11;
            }
        };

        countryName.setup(x_pos, y_pos, name);

        return countryName;        
    }

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Title of the whole visualisation  
        this.mainTitle = createSpan(this.title).parent('header');

        // Set min and max years: assumes data is sorted by date.
        this.startYear = this.data.columns[1];
        this.endYear = this.data.columns[this.data.getColumnCount()-1];
        
        
        // Find min and max number of medals for mapping to thickness of curve.
        this.minMedalsSum = this.data.getNum(0,'2000');
        this.maxMedalsSum = this.data.getNum(0,'2000');
        
        for(let i = 0; i < this.data.getRowCount(); i++){
            for(let j = 0; j < this.data.getColumnCount(); j++){
                let medals = Number(this.data.getRow(i).get(j));
                
                if(this.minMedalsSum > medals)
                    this.minMedalsSum = medals;
                if(this.maxMedalsSum < medals)
                    this.maxMedalsSum = medals;
            }
        }
        
        this.minCurveThickness = 5;
        this.maxCurveThickness = 100;
        
        // Setup array of contry names
        this.contryNames = [];
        let height = 500;
        for(let i = 0; i < this.data.getRowCount(); i++){
            let medalHeight = this.mapMedalsToHeight(
                this.data.getNum(i,this.data.getColumnCount()-1));
            
            this.contryNames.push(this.createCountryName(
                this.layout.rightMargin + 100,
                height - medalHeight/2, 
                this.data.get(i,0)));
            
            height -= medalHeight;
        }
    };

    this.destroy = function() {
        this.mainTitle.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        
        // Draw x and y axis.
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
                       this.yAxisLabel,
                       this.layout);        
                    
        // Draw grid.
        for(let i = 0; i < this.data.getColumnCount(); i++){
            drawXAxisTickLabel(this.data.columns[i+1], this.layout, this.mapYearToWidth.bind(this));
        }
        
        drawStreams();
    };
    
    function drawStreams(){
        let heights = [500,500,500,500,500] // array which stores the y coordinates of the current height in each year
        
        for(let i = 0; i < self.data.getRowCount(); i++){
            let displayEachYearMedals = false;
            
            fill(100+10*i%255,50*i%255,10+90*i%255);
            
            // Check if cursor is over a country name on the right.
            if(mouseX > self.contryNames[i].x_pos-self.contryNames[i].width/2 
               && mouseX < self.contryNames[i].x_pos+self.contryNames[i].width/2 
               && mouseY < self.contryNames[i].y_pos+15 
               && mouseY > self.contryNames[i].y_pos-15){
                textSize(23.5);
                displayEachYearMedals = true;
            }
            
            //Draw a stripe.
            stroke(0);
            beginShape();
            curveVertex(self.mapYearToWidth(self.data.columns[1]),heights[0]);
            
            for(let j = 1; j < self.data.getColumnCount(); j++){                
                curveVertex(self.mapYearToWidth(self.data.columns[j]),heights[j-1]);                
                heights[j-1] -= self.mapMedalsToHeight(self.data.getNum(i,j));
            }
            
            for(let j = self.data.getColumnCount()-1; j > 0; j--){                         
                curveVertex(self.mapYearToWidth(self.data.columns[j]),heights[j-1]);
            }
            
            curveVertex(self.mapYearToWidth(self.data.columns[1]),heights[0]);
            endShape();
            
            //Draw a rectangle to hide unsharp right stripe end.
            noStroke();
            fill(255);
            rect(self.layout.rightMargin,heights[heights.length-1],30,self.mapMedalsToHeight(self.data.getNum(i,self.data.getColumnCount()-1))+1);
            stroke(0);
            
            // If cursor is over a country name, draw each year medals count for this country.
            if(displayEachYearMedals){
                strokeWeight(5);
                for(let j = 1; j < self.data.getColumnCount(); j++){
                    line(self.mapYearToWidth(self.data.columns[j]), heights[j-1] + self.mapMedalsToHeight(self.data.getNum(i,j)),
                         self.mapYearToWidth(self.data.columns[j]), heights[j-1]);
                    text(self.data.getNum(i,j)+" medals", self.mapYearToWidth(self.data.columns[j])-10, heights[j-1]+20);
                }
            }
            
            // Draw country name on the right.
            strokeWeight(1);
            fill(100+10*i%255,50*i%255,10+90*i%255);
            text(self.contryNames[i].name, 
                 self.contryNames[i].x_pos,
                 self.contryNames[i].y_pos);
            textSize(20);
        }
    }

    this.mapYearToWidth = function(value) {
        return map(value,
                   this.startYear,
                   this.endYear,
                   this.layout.leftMargin,   // Draw left-to-right from margin.
                   this.layout.rightMargin);
    };

    this.mapMedalsToHeight = function(value) {
        return map(value,
               this.minMedalsSum,
               this.maxMedalsSum,
               this.minCurveThickness,   // Draw bottom-to-top from margin.
               this.maxCurveThickness);
    };
}
