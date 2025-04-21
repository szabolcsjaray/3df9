var lcs = {};
var maxLCLaunchNum;

function LCDiagram() {
    
    collectLCData();
    drawLCNoColumns();
    drawTimeLine(launches[0].date);
    drawLCNoAxisMarks();
    writeLCNames()
    drawLCLines();
    signImage();
}

function writeLCNames() {
    c.font = ""+sc(20)+"px Arial";
    let nameY = scrHeight * 0.25;
    for (let lcName in lcs) {
        if (lcs.hasOwnProperty(lcName)) {
            //setColor("white");
            setColor("#B0B0B0");
            c.beginPath();
            c.fillText("" + lcs[lcName].launches.length + " launches", baseX + sc(22), nameY);
            setColor(lcs[lcName].color);
            c.beginPath();
            c.fillText(lcs[lcName].name, baseX + sc(152), nameY);
            nameY += scrHeight / 25.0;
        }
    }
}

function findOrCreateLC(launch) {
    if (lcs[launch.launchSite] != undefined && lcs[launch.launchSite]) {
        return lcs[launch.launchSite];
    }
    lcs[launch.launchSite] = new LC(launch.launchSite);
    return lcs[launch.launchSite];
}

function collectLCData() {
    for (let i = 0; i < launches.length; i++) {
        let launch = launches[i];
        let nameLCPos = launch.launchSite.indexOf("LC");
        if (nameLCPos != -1 && !launch.launchSite.startsWith("Kennedy")) {
            launch.launchSite = launch.launchSite.substring(0, nameLCPos + 2) + '-' 
                + launch.launchSite.substring(launch.launchSite.length -2);
        }
        let lc = findOrCreateLC(launch);
        lc.addLaunch(launch);
    }
    setMaxLCLaunchNumber();
}

function calculateLCColY(count, maxCount) {
    return scrHeight * 0.7 * count / maxCount;
}

function drawLCNoColumns() {
    let firstDate = launches[0].date;
    let d = new Date(firstDate.getTime()-MONTH_EPOCH*5);
    d.setDate(1);
    let now = new Date();
    let columns = [];
    let maxCount = 0;

    fillAlphaCols("0.4");

    while (d.getTime() < endDate + MONTH_EPOCH*5) {
        
        let dNext = new Date(d.getTime());
        stepOneMonth(dNext);
        if (dNext > now) {
            dNext = now;
        }
        let count = 0;

            // init lc columns
        let lcColumns = {};
        for (let lcName1 in lcs) {
            if (lcs.hasOwnProperty(lcName1)) {
                lcColumns[lcName1] = {"LC": lcs[lcName1], "num" : 0};
            }
        }

        for (let lcName in lcs) {
            if (lcs.hasOwnProperty(lcName)) {
                llaunches = lcs[lcName].launches;
                for(let i = 0; i < llaunches.length;i ++) {
                    if (llaunches[i].date >= d && llaunches[i].date < dNext) {
                        lcColumns[lcName].num++;
                        count++;
                    }
                }
            }
        }


        let x = calculateX2(d.getTime());
        let x1 = calculateX2(dNext.getTime());
        let col = {"x": x, "x1" : x1, "count":count, "LCCols" : lcColumns};
        columns.push(col);
        maxCount = (maxCount < count ? count : maxCount);

        //console.log(d.getFullYear() + "-" + d.getMonth());
        stepOneMonth(d);
    }

    setColor("rgb(59, 59, 59)");
    
    for(let i = 0; i < columns.length; i++) {
        let col = columns[i];
        let lastHeight = 0;
        let lastHeightY = calculateLCColY(lastHeight, maxCount);
        for (let lcName in lcs) {
            if (lcs.hasOwnProperty(lcName)) {
                setColor(ALPHA_COLS[lcs[lcName].color]);
                c.beginPath();
                let height = lastHeight + col.LCCols[lcName].num;
                let heightY = calculateLCColY(height, maxCount);
                c.rect(col.x, baseY-heightY, (col.x1 - col.x), heightY-lastHeightY);
                c.fill();
                lastHeight = height;
                lastHeightY = heightY;
            }
        }
    }
}

function setMaxLCLaunchNumber() {
    let maxNum = 0;
    for (let lcName in lcs) {
        if (lcs.hasOwnProperty(lcName)) {
            let actNum = lcs[lcName].launches.length;
            maxNum = (maxNum >  actNum ? maxNum : actNum);
        }
    }
    maxLCLaunchNum = maxNum;
}

const LC_LAUNCH_NUM_STEP = 20;

function calculateLaunchNumY(num) {
    return baseY - (num / (maxLCLaunchNum + LC_LAUNCH_NUM_STEP) * scrHeight * 0.8);
}

function drawLCNoAxisMarks() {
    c.font = ""+ sc(14) + "px Ariana";
    for(let i= LC_LAUNCH_NUM_STEP; i < maxLCLaunchNum + LC_LAUNCH_NUM_STEP;i+= LC_LAUNCH_NUM_STEP) {
        let y = calculateLaunchNumY(i);
        strokeStyle("gray");
        c.lineWidth = sc(0.6);
        drawLine(scrWidth*1/20, y, scrWidth * 19/20, y);
        strokeStyle("white");
        c.lineWidth = 1;
        drawLine(baseX-sc(10), y, baseX +sc(10), y);
        c.beginPath();
        c.fillStyle = "white";
        c.fillText(""+i, baseX - sc(28), y+sc(4));

        let leftAxisX = calclulateLeftAxisX();
        drawLine(leftAxisX - sc(10), y, leftAxisX + sc(10), y);
        c.beginPath();
        c.fillText(""+i, leftAxisX + sc(12), y+sc(4));

    }
}

function drawLCLines() {
    c.lineWidth = sc(1.3);
    
    for (let lcName in lcs) {
        if (lcs.hasOwnProperty(lcName)) {
            let llaunches = lcs[lcName].launches;
            strokeStyle(lcs[lcName].color);
            let lastX = calculateX2(llaunches[0].date.getTime() - MONTH_EPOCH);
            let lastY = baseY;
            for (let i = 0; i< llaunches.length; i++) {
                let launch = llaunches[i];
                let newY = calculateLaunchNumY(i+1);
                let newX = calculateX(launch);
                drawLine(lastX, lastY, newX, newY);
                lastX = newX;
                lastY = newY;
            }
        }
    }
}

var lcNum = 0;

class LC {
    constructor(name) {
        this.name = name;
        this.color = COLS[lcNum];
        this.launches = [];
        lcNum++;
    }

    addLaunch(launch) {
        this.launches.push(launch);
    }
}