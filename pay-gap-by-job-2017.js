function PayGapByJob2017() {

  // Name for the visualisation to appear in the bottom navigation bar.
  this.name = 'Pay gap by job: 2017';
  this.icon = "assets/circles.jpg";

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'pay-gap-by-job-2017';
    
  // Title to display above the plot.
  this.title = 'Pay gap between men and women for different jobs in 2017';

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Graph properties.
  this.pad = 20;
  this.dotSizeMin = 15;
  this.dotSizeMax = 40;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    let self = this;
    this.data = loadTable(
      './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });

  };

  this.setup = function() {
      // Title of the whole visualisation  
    this.mainTitle = createSpan(this.title).parent('header');
  };

  this.destroy = function() {
      this.mainTitle.remove();
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw the axes.
    this.addAxes();

    // Get data from the table object.
    let jobs = this.data.getColumn('job_subtype');
    let propFemale = this.data.getColumn('proportion_female');
    let payGap = this.data.getColumn('pay_gap');
    let numJobs = this.data.getColumn('num_jobs');

    // Convert numerical data from strings to numbers.
    propFemale = stringsToNumbers(propFemale);
    payGap = stringsToNumbers(payGap);
    numJobs = stringsToNumbers(numJobs);

    // Set ranges for axes.
    //
    // Use full 100% for x-axis (proportion of women in roles).
    let propFemaleMin = 0;
    let propFemaleMax = 100;

    // For y-axis (pay gap) use a symmetrical axis equal to the
    // largest gap direction so that equal pay (0% pay gap) is in the
    // centre of the canvas. Above the line means men are paid
    // more. Below the line means women are paid more.
    let payGapMin = -20;
    let payGapMax = 20;

    // Find smallest and largest numbers of people across all
    // categories to scale the size of the dots.
    let numJobsMin = min(numJobs);
    let numJobsMax = max(numJobs);

    fill(255);
    stroke(0);
    strokeWeight(1);

    for (i = 0; i < this.data.getRowCount(); i++) {
      // Draw an ellipse for each point.
      // x = propFemale
      // y = payGap
      // size = numJobs
      ellipse(map(propFemale[i],propFemaleMin,propFemaleMax,this.pad, width - this.pad),
              map(payGap[i],payGapMin,payGapMax,height - this.pad,this.pad),
              map(numJobs[i],numJobsMin,numJobsMax,this.dotSizeMin, this.dotSizeMax)
      );
    }
  };

  this.addAxes = function () {
    stroke(200);

    // Add vertical line.
    line(width / 2,
         0 + this.pad,
         width / 2,
         height - this.pad);

    // Add horizontal line.
    line(0 + this.pad,
         height / 2,
         width - this.pad,
         height / 2);
  };
}
