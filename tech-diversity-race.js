function TechDiversityRace() {

    // Name for the visualisation to appear in the bottom navigation bar.
    this.name = 'Tech Diversity: Race';
    this.icon = "assets/pieChart.jpg";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'tech-diversity-race';
    
    // Title to display above the plot.
    this.title = 'Racial proportion of employees in tech companies in 2018';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        let self = this;
        this.data = loadTable(
        './data/tech-diversity/race-2018.csv', 'csv', 'header',
        // Callback function to set the value
        // this.loaded to true.
        function(table) {
            self.loaded = true;
            self.setup();
        });
    };

    this.setup = function() {
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }
        
        // Title of the whole visualisation  
    this.mainTitle = createSpan(this.title).parent('header');

        // Create a title and a select DOM element.
        this.selectTitle = createDiv("Company").addClass('selectTitle').parent('rightSideContainer');
        this.select = createSelect();
        this.select.parent('rightSideContainer');

        // Fill the options with all company names.
        for(let i = 0; i < this.data.columns.length; i++)
            this.select.option(this.data.columns[i]);
    };

    this.destroy = function() {
        this.select.remove();
        this.selectTitle.remove();
        this.mainTitle.remove();
    };

        // Create a new pie chart object.
    this.pie = new PieChart(width/2, height/2, width * 0.4);

    this.draw = function() {
        if (!this.loaded) {
          console.log('Data not yet loaded');
          return;
        }

        // Get the value of the company we're interested in from the
        // select item.
        let companyName = this.select.value();

        // Get the column of raw data for companyName.
        let col = this.data.getColumn(companyName);

        // Convert all data strings to numbers.
        col = stringsToNumbers(col);

        // Copy the row labels from the table (the first item of each row).
        let labels = this.data.getColumn(0);

        // Colour to use for each category.
        let colours = ['blue', 'red', 'green', 'pink', 'purple', 'yellow'];

        // Make a title.
        let title = 'Employee diversity at ' + companyName;

        // Draw the pie chart!
        this.pie.draw(col, labels, colours, title);
    };
}
