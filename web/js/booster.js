class Booster {
    constructor(id, type, firstLaunch, col) {
        this.id = id;
        this.type = type;
        this.launches = [];
        this.launchOrders = [];
        this.mountainOrder = [];
        this.col = col;
        this.addLaunch(firstLaunch);
    }

    addLaunch(launch) {
        this.launches.push(launch);
        this.launchOrders.push(launch.getBoosterOrder(this.id));
    }

    getLastLaunch() {
        return this.launches[this.launches.length-1];
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
}