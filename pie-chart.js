function PieChart(x, y, diameter) {

  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;
  this.icon = "assets/pieChart.png";

  this.get_radians = function(data) {
    let total = sum(data);
    let radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * TWO_PI);
    }

    return radians;
  };

  this.draw = function(data, labels, colours, title) {

    // Test that data is not empty and that each input array is the
    // same length.
    if (data.length == 0) {
      alert('Data has length zero!');
    } else if (![labels, colours].every((array) => {
      return array.length == data.length;
    })) {
      alert(`Data (length: ${data.length})
Labels (length: ${labels.length})
Colours (length: ${colours.length})
Arrays must be the same length!`);
    }

    // https://p5js.org/examples/form-pie-chart.html

    let angles = this.get_radians(data);
    let lastAngle = 0;
    let colour;

    for (let i = 0; i < data.length; i++) {
      if (colours) {
        colour = colours[i];
      } else {
        colour = map(i, 0, data.length, 0, 255);
      }

      fill(colour);
      stroke(0);
      strokeWeight(1);

      arc(this.x, this.y,
          this.diameter, this.diameter,
          lastAngle, lastAngle + angles[i] + 0.001); // Hack for 0!

      if (labels) {
        this.makeLegendItem(labels[i], i, colour);
      }

      lastAngle += angles[i];
    }

    if (title) {
      noStroke();
      textAlign('center', 'center');
      textSize(24);
      text(title, this.x, this.y - this.diameter * 0.6+15);
    }
  };

  this.makeLegendItem = function(label, i, colour) {
    let x = this.x + 50 + this.diameter / 2;
    let y = this.y + (this.labelSpace * i) - this.diameter / 3;
    let boxWidth = this.labelSpace / 2;
    let boxHeight = this.labelSpace / 2;

    fill(colour);
    rect(x, y, boxWidth, boxHeight);

    fill('black');
    noStroke();
    textAlign('left', 'center');
    textSize(12);
    text(label, x + boxWidth + 10, y + boxWidth / 2);
  };
}
