var refurbsData = [];

function collectRefurbsData() {
    refurbsData = []; 
    for(let j = 0; j < MAX_LANDING; j++) {
        refurbsData[j] = [];
    }

    for(let i = 0; i < boosters.length; i++) {
        let booster = boosters[i];
        for(let refurbNo = 0; refurbNo < booster.refurbs.length; refurbNo++) {
            refurbsData[refurbNo].push(booster.refurbs[refurbNo]);
        }
    }
    console.log("refurbsData:");
    console.log(refurbsData);
}

function calculateFlightNoX(flightNo) {
    return (baseX + (rightAxisX - baseX) * (flightNo / MAX_LANDING) );
}

function findPreviousRefurbData(refurb) {
    if (refurb.flightNo < 2) {
        return null;
    }
    rdI = refurb.flightNo - 2;
    for(let i = 0; i< refurbsData[rdI].length; i++) {
        if (refurbsData[rdI][i].booster == refurb.booster) {
            return refurbsData[rdI][i];
        }
    }
    return null;
}

function drawRefurbStats() {
    let lastAverX = -1;
    let lastAverY = -1;
    let lastMedianY = -1;
    for(let flightNo = 0; flightNo < MAX_LANDING - 1; flightNo++) {
        let x = calculateFlightNoX(flightNo+1);
        refurbsData[flightNo].sort(function(a,b) {
            return b.timeBetween - a.timeBetween;
        });
        let timeSum = 0;
        let b5Num = 0;
        let medianY = -1;
        for(let i = 0; i < refurbsData[flightNo].length; i++) {
            let y =  calcRefurbY(refurbsData[flightNo][i].timeBetween);
            if (medianY == -1 && i > Math.floor(refurbsData[flightNo].length / 2) - 1) {
                medianY = y;
            }
            
            setColor("#30A0FF");
            if (refurbsData[flightNo][i].booster != null) {
                if (refurbsData[flightNo][i].booster.isBlock5()) {
                    timeSum += refurbsData[flightNo][i].timeBetween;
                    b5Num++;
                    setColor("white");
                }
            }
            refurbsData[flightNo][i].x = x;
            refurbsData[flightNo][i].y = y;
            c.beginPath();
            c.arc(x, y, sc(2), 0, 2 * Math.PI);
            c.fill();
            let prevRefurb = findPreviousRefurbData(refurbsData[flightNo][i]);
            if (prevRefurb != null) {
                if (y > scrHeight/10 && prevRefurb.y > scrHeight/10) {
                    c.lineWidth = sc(0.3);
                    drawLine(prevRefurb.x, prevRefurb.y, x, y);
                }
            }
        }
        if (b5Num > 0) {
            let averageTime = timeSum / b5Num;
            let averY = calcRefurbY(averageTime);
            if (lastAverX != -1) {
                c.lineWidth = sc(1.5);
                setColor("orange");
                drawLine(lastAverX, lastMedianY, x, medianY);
                setColor("yellow");
                drawLine(lastAverX, lastAverY, x, averY);
            }

            lastAverX = x;
            lastAverY = averY;
            lastMedianY = medianY;
        }
    }
}

function drawRefurbsFlightNoMarks() {
    c.font = ""+sc(15)+"px Arial";
    for(let flightNo = 0; flightNo < MAX_LANDING - 1; flightNo++) {
        let x = calculateFlightNoX(flightNo+1);
        setColor("white");
        c.lineWidth = sc(1);
        drawLine(x, baseY - sc(6), x, baseY + sc(10));
        centerText(""+(flightNo+1), x, baseY + sc(25));
        setColor("black");
        c.lineWidth = sc(0.8);
        drawLine(x, baseY, x, scrHeight/10);
    }
    setColor("white");
}

function refurbsDiagram() {
    collectRefurbsData();
    drawRefurbsFlightNoMarks();
    drawRefurbTimeScale();
    drawRefurbStats();
    signImage();
}

class Refurb {
    constructor(flightNo, prevLaunch, nextLaunch) {
        this.flightNo = flightNo;
        this.prevLaunch = prevLaunch;
        this.nextLaunch = nextLaunch;
        this.timeBetween = nextLaunch.date.getTime()-prevLaunch.date.getTime();
        this.booster = null;
        if (nextLaunch.boosters.length == 1) {
            this.booster = nextLaunch.boosters[0];
        }
    }
}