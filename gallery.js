function Gallery() {
    
    let self = this;
    
    
    this.visuals = [];
	this.selectedVisual = null;

	let visualbarItemClick = function() {
		//remove any existing borders
		let items = selectAll(".sideBarItem");
		for (let i = 0; i < items.length; i++) {
			items[i].style('border', '0')
		}

		let visualName = this.id().split("leftSidebar")[0];
		self.selectVisual(visualName);

		//call loadPixels to make sure most recent changes are saved to pixel array
		loadPixels();

	}

	//add a new visual icon to the html page
	let addVisualIcon = function(icon, name) {
		let sideBarItem = createDiv("<img src='" + icon + "'></div>");
		sideBarItem.class('sideBarItem')
		sideBarItem.id(name + "sideBarItem")
		sideBarItem.parent('leftSidebar');
		sideBarItem.mouseClicked(visualbarItemClick);
	};
    
    let arrowPrevClick = function() {
        for(let i = 0; i < self.visuals.length; i++){
            if(self.visuals[i].name == self.selectedVisual.name && i-1 >= 0){
                //remove any existing borders
                let items = selectAll(".sideBarItem");
                for (let j = 0; j < items.length; j++) {
                    items[j].style('border', '0')
                }
                
                self.selectVisual(self.visuals[i-1].name+"sideBarItem");
            }
        }
    }
    
    let arrowNextClick = function() {
        for(let i = 0; i < self.visuals.length; i++){
            if(self.visuals[i].name == self.selectedVisual.name && i+1 < self.visuals.length){
                
                //remove any existing borders
                let items = selectAll(".sideBarItem");
                for (let j = 0; j < items.length; j++) {
                    items[j].style('border', '0')
                }
                
                self.selectVisual(self.visuals[i+1].name+"sideBarItem");
                break;
            }
        }
    }

    this.setup = function() {
        select(".arr left").mouseClicked(arrowPrevClick);
        select(".arr right").mouseClicked(arrowNextClick);
    }
    
	//add a visual to the visuals array
	this.addVisual = function(visual) {
		//check that the object visual has an icon and a name
		if (!visual.hasOwnProperty("icon") || !visual.hasOwnProperty("name")) {
			alert("make sure your visual has both a name and an icon");
		}
		this.visuals.push(visual);
		addVisualIcon(visual.icon, visual.name);
		//if no visual is selected (ie. none have been added so far)
		//make this visual the selected one.
		if (this.selectedVisual == null) {
			this.selectVisual(visual.name+"sideBarItem");
		}
        
         // Preload data if necessary.
        if (visual.hasOwnProperty('preload')) {
          visual.preload();
        }
	};

	this.selectVisual = function(visualName) {
        
        if(this.selectedVisual != null && this.selectedVisual.hasOwnProperty('destroy')) {
            this.selectedVisual.destroy();
        }
        
		//search through the visuals for one that's name matches
		//visualName                                
		for (let i = 0; i < this.visuals.length; i++) {
			if (this.visuals[i].name+"sideBarItem" == visualName) {
                
				//select the visual and highlight it on the visualbar
				this.selectedVisual = this.visuals[i];
				select("#" + visualName).style("border", "2px solid blue");

                // Initialise visualisation if necessary.
                if (this.selectedVisual.hasOwnProperty('setup')) {
                    this.selectedVisual.setup();
                }
                        
                select("#visualizationTitle").html(this.visuals[i].name, false);
			}
		}
	};
}
