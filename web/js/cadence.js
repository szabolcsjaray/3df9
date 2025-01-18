var lightest = 100000;
var heaviest = -100000;
var sumMass = 0;
var highestCadence;
var currentCadence;

function isNum(c) {
    return (c>='0' && c<='9');
}

function drawCadenceAxisMarks(highest) {
    c.font = ""+sc(14)+"px Ariana";
    let leftAxisX = calclulateLeftAxisX();
    for(let i= 2;i < highest + 2; i += 2) {
        let y = calculateCadenceY(i, highest);
        strokeStyle("gray");
        c.lineWidth = 0.6;
        drawLine(scrWidth*1/20, y, scrWidth * 19/20, y);
        strokeStyle("white");
        c.lineWidth = 1;
        drawLine(baseX-sc(10), y, baseX +sc(10), y);
        c.beginPath();
        c.fillStyle = "white";
        c.fillText(""+i, baseX - sc(30), y+sc(4));
        
        drawLine(leftAxisX - sc(10), y, leftAxisX + sc(10), y);
        c.beginPath();
        c.fillText(""+i, leftAxisX + sc(12), y+sc(4));

    }
}

function getOrbitIndex(launch) {
    for(let i = 0; i < ORBITS.length; i++) {
        if (launch.orbit.search(ORBITS[i]) != -1) {
            return i;
        }
    }
    return 11;
}

function calculateCadenceY(value, highest) {
    return baseY - ((value / highest) * scrHeight * 14/20);
}

function fillRolling() {
    let rolling = new RollinAverage(MONTH_EPOCH, MONTH_EPOCH*2);
    let rollingStarlink = new RollinAverage(MONTH_EPOCH, MONTH_EPOCH*2);
    for(let i=0; i < launches.length; i++) {
        let launch = launches[i];
        let data = new DataElement(launch.date.getTime(), 1);
        if (launch.payload.indexOf("Starlink") != -1) {
            rollingStarlink.addData(data);
        }
        rolling.addData(data);
    }

    rolling.sort();
    rollingStarlink.sort();

    return [rolling, rollingStarlink];
}

function findHighest(rolling) {
    let highest = 0;
    let firstDate = launches[0].date;
    let value;
    for(let x = firstDate.getTime(); x < rolling.highest; x += MONTH_EPOCH/30) {
        value = rolling.getSum(x);
        highest = (highest <value ? value : highest);
    }
    currentCadence = value;
    highestCadence = highest;
    return highest;
}

function drawAverageCadenceLine(firstDate, rollings, highest) {
    let lastX = null;
    let lastY = null;
    c.lineWidth = 2;
    setColor("#ccc");
    let rolling = rollings[0];
    let rollingStarlink = rollings[1];

    let lastValue;

    allCol = "#eee";
    //var slCol = "#2a56b5"
    slCol = "#2ab556"
    diffCol = "#eb3443"

    setColor(slCol);
    for(x = firstDate.getTime(); x < rollingStarlink.highest; x += MONTH_EPOCH/30) {
        let value = rollingStarlink.getSum(x);
        lastValue = value;
        let coordX = calculateX2(x);
        let coordY = calculateCadenceY(value, highest);

        if (lastX != null) {
            drawLine(lastX, lastY, coordX, coordY);
        }
        lastX = coordX;
        lastY = coordY;
    /*c.beginPath();
        c.fillRect(cubeX, scrHeight * 3/20 - 10, 10, 10);*/
    }

    lastX = null;
    setColor(diffCol);
    for(x = firstDate.getTime(); x < rollingStarlink.highest; x += MONTH_EPOCH/30) {
        let value = rolling.getSum(x)- rollingStarlink.getSum(x);
        lastValue = value;
        let coordX = calculateX2(x);
        let coordY = calculateCadenceY(value, highest);

        if (lastX != null) {
            drawLine(lastX, lastY, coordX, coordY);
        }
        lastX = coordX;
        lastY = coordY;
    /*c.beginPath();
        c.fillRect(cubeX, scrHeight * 3/20 - 10, 10, 10);*/
    }

    lastX = null;
    setColor(allCol);

    for(x = firstDate.getTime(); x < rolling.highest; x += MONTH_EPOCH/30) {
        let value = rolling.getSum(x);
        lastValue = value;
        let coordX = calculateX2(x);
        let coordY = calculateCadenceY(value, highest);

        if (lastX != null) {
            drawLine(lastX, lastY, coordX, coordY);
        }
        lastX = coordX;
        lastY = coordY;
    /*c.beginPath();
        c.fillRect(cubeX, scrHeight * 3/20 - 10, 10, 10);*/
    }

    c.lineWidth = 1;
    return lastValue;
}


function cadenceDiagram() {
    c.font = ""+sc(16)+"px Ariana";
    drawTimeLine(launches[0].date);
    let rollings = fillRolling();
    let highest = findHighest(rollings[0]);
    //drawNumLines(highest);
    drawCadenceAxisMarks(highest);
    drawAverageCadenceLine(launches[0].date, rollings, highest);
    //writeOrbits();
    //drawBoosterLines();
    //writeBoosterNames();
    signImage();
    
}