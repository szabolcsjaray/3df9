function collectLandingData() {
    for (let i = 0; i < launches.length; i++) {
        let launch = launches[i];
    }
}

class Landing {
    constructor(name) {
        this.launches = [];
    }

    addLaunch(launch) {
        this.launches.push(launch);
    }
}