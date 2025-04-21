const ORBITS = ["GTO", "LEO (ISS)", "LEO", "Polar", "MEO", "Ballistic lunar transfer", "SSO", "Heliocentric", "TLI", "GEO"];

class Launch {
    constructor(id, num, date, boosters, launchSite, payload, payloadMass, orbit, partner, success, landingSuccess, description) {
        this.id = id;
        this.num = num;
        if ((date.match(/ /g) || []).length > 3) {
            date = date.substring(0, date.lastIndexOf(" "));
        }
        this.dateStr = date;
        this.date = new Date(Date.parse(date));
        this.boosters = boosters;
        this.launchSite = launchSite;
        this.payload = payload;
        this.payloadMass = payloadMass;
        this.orbit = orbit;
        this.partner = partner;
        this.success = success;
        this.landingSuccess = landingSuccess;
        this.description = description;
        this.boosterIds = this.collectBoosterIds();
        this.mountainSplit = null;
    }

    getBoosterOrder(boosterId) {
        return this.boosterIds.indexOf(boosterId);
    }

    collectBoosterIds() {
        let words =this.boosters.split(" ");
        words = words.filter(word => word.startsWith('B') && (word.length == 5 || (word.length>5 && word[5]=='.')));
        words = words.map(boosterId => boosterId.substring(0,5));
        if (words.length<1) {
            words = [this.id];
        }
        if (words.length>1 || this.boosters.indexOf('|')!=-1) {
            console.log("boosters: of " + this.boosters);
            console.log(words);
        }
        return words;
    }

    getLandingResult(order) {
        let landingStr = this.landingSuccess;
        if (this.boosterIds.length>1) {
            landingStr = landingStr.split('|')[order];
        }
        return landingStr.trim();
    }

    isCrewedLaunch() {
        return ((this.payloadMass.search("Crew") != -1 || this.payload.search("Crew") != -1)
        && this.payload.search("abort") == -1);
    }
}