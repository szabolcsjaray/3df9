class MountainSplit {
    constructor(launch, booster, height) {
        this.boosterHeights = [];
        this.addBooster(booster, height);
        this.launch = launch;
        this.time = this.launch.date.getTime();
        launch.mountainSplit = this;
    }

    addBooster(booster, height) {
        this.boosterHeights.push(new BoosterHeight(booster, height));
    }

    sortBoostersByHeight() {
        this.boosterHeights.sort(function(a,b) 
        {
            return a.height - b.height;
        });        
    }

    getBoosterOrder(booster) {
        for(let i = 0; i < this.boosterHeights.length; i++) {
            if (this.boosterHeights[i].booster.id == booster.id) {
                return i;
            }
        }
        return 0;
    }
}