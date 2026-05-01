var maxBoosterLaunchNum = 0;

class Booster {
    constructor(id, type, firstLaunch, col) {
        this.id = id;
        this.type = type;
        this.launches = [];
        this.launchOrders = [];
        this.mountainOrder = [];
        this.col = col;
        this.addLaunch(firstLaunch);
        this.refurbs = [];
    }

    addLaunch(launch) {
        this.launches.push(launch);
        maxBoosterLaunchNum = (maxBoosterLaunchNum > this.launches.length ? maxBoosterLaunchNum : this.launches.length);
        this.launchOrders.push(launch.getBoosterOrder(this.id));
    }

    getLastLaunch() {
        return this.launches[this.launches.length-1];
    }

    getLanding(landingI) {
        let launch = this.launches[landingI];
        let launchOrder = this.launchOrders[landingI];
        return launch.getLandingResult(launchOrder);
    }

    getLastLanding() {
        let lastLaunch = this.getLastLaunch();
        let lastLaunchOrder = this.launchOrders[this.launchOrders.length-1];
        console.log(lastLaunch.getLandingResult(lastLaunchOrder));
        return lastLaunch.getLandingResult(lastLaunchOrder);
    }

    isActive() {
        return this.getLastLanding().startsWith("Success");
    }

    isActiveStill() {
        if (!this.isActive()) {
            return false;
        }
        return (days(this.getLastLaunch().date, new Date()) < 365/2);
    }

    addRefurb(refurb) {
        this.refurbs.push(refurb);
    }

    clearRefurbs() {
        this.refurbs = [];
    }

    isBlock5() {
        return this.id >= "B1046";
    }
}