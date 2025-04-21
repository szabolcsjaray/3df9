var canvEl;
var scrWidth;
var scrHeight;
var c;
var launches = [];
var boosters = [];
var landings = []; // landing objects array
var baseX;
var baseY;
var step;
var startDate;
var endDate;
var scale;


var allCol;
var slCol;
var diffCol;

const MAX_LANDING = 28.0;

const LAUNCHES = 1;
const REFURB = 2;
const MOUNTAIN = 3;
const AVERAGE = 4;
const MASS_TO_ORBIT = 5;
const CADENCE = 6;
const BARCODE = 7;
const LANDINGS = 8;
const LC_USAGE = 9;
const LAST_MODE = 10;

var mode = LAUNCHES;

const COLS = ["#02F3FF",  "#40f000", "#fffb00", "#ff1010",  "#9EFFFF",  "#ff009b", "#ffffff","#00ffab", "#fffb00","#ff3c00", "#00abff","#c340ff"]; 
var ALPHA_COLS = {};
//const COLS = ["#02F3FF",  "#40f000", "#fffb00", "#f00000",  "#9EFFFF",  "#ff009b", "#ffffff","#00ffab", "#fffb00","#ff3c00", "#00abff","#a300ff"]; 

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


const F9_CGI_SCRIPT = "cgi-bin\\loadF9Data.py";
const REFRESH_DATA_FROM_WIKI = "cgi-bin\\getF9Data.py";
const MONTH_EPOCH = 1000*60*60*24*30;
const HOUR_EPOCH = 1000*60*60;

var highlightBooster = "";

function el(id) {
    return document.getElementById(id);
}

function dimensionClick() {
    if (mode!=MOUNTAIN) {
        mode = MOUNTAIN;
        initGraph();
        drawDiagram();
    } else {
        mode = LAUNCHES;
        initGraph();
        drawDiagram();
    }
}

function nextMode() {

    if (mode==BARCODE) {
        baseY = scrHeight * 9/10;
    }

    mode++;
    if (mode==MOUNTAIN || mode == LANDINGS) {
        mode++;
    }
    if (mode==LAST_MODE) {
        mode = LAUNCHES;

    }
    initGraph();
    drawDiagram();
}

function convertRGBA(col, alpha) {
    let r = parseInt(col.substring(1,3), 16);
    let g = parseInt(col.substring(3,5), 16);
    let b = parseInt(col.substring(5,7), 16);
    return "rgba("+r+","+g+","+b+","+alpha+")";
}

function fillAlphaCols(alpha) {
    for(let i = 0; i < COLS.length; i++) {
        ALPHA_COLS[COLS[i]] = convertRGBA(COLS[i], alpha);
    }
}


function init() {
    console.log("started.");
    fillAlphaCols();
    //scrHeight = window.innerHeight;
    scrHeight = el("canv").height;
    //scrWidth = window.innerWidth;
    scrWidth = el("canv").width;
    scale = scrWidth / 2000.0;
    c = el("canv").getContext("2d");
    baseY = scrHeight * 9/10;
    baseX = scrWidth * 1/10;
    initGraph();
    
    fetchData();
}

function initGraph() {
    setColor("#1D1D1D");
    c.fillRect(0, 0,scrWidth,  scrHeight);
    c.lineWidth = sc(1);
    drawAxises();
}

function manualHighlightedBooster() {
    highlightBooster = el("hlbooster").value;
    redrawBoosterLines();
}

function redrawBoosterLines() {
    mode = LAUNCHES;
    initGraph();
    drawDiagram();
}

function sc(a) {
    return scale * a;
}

function readResource(resource, process) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            console.log(xhttp.responseText);
            process(xhttp.responseText);
        }
    };
    xhttp.open("GET", resource, true);
    xhttp.send();
}

function fetchData() {
    readResource(F9_CGI_SCRIPT, storeData);
}

function fillLaunchesArray(launchesStr) {
    for(let i = 0; i < launchesStr.length; i++) {
        let launchRow = launchesStr[i];
        let launchArray = launchRow.split(";");
        if (launchArray[0]!="" && launchArray[0]!="\r") {
            let newLaunch = new Launch(launchArray[0],
                launchArray[1],
                launchArray[2],
                launchArray[3],
                launchArray[4],
                launchArray[5],
                launchArray[6],
                launchArray[7],
                launchArray[8],
                launchArray[9],
                launchArray[10],
                launchArray[11]);
            launches.push(newLaunch);
        }
    }
    console.log(launches);
    console.log("launches[0].date" + launches[0].date + " -> " + Date.parse(launches[0].date));

}

function initStep(startDateArg) {
    startDate = startDateArg;
    endDate = launches[launches.length-1].date.getTime();
    step = (scrWidth*8/10) / (endDate-startDate + 1000*60*60*24);
}

function calculateX(launch) {
    return baseX + step * (launch.date.getTime()-startDate);
}

function calculateX2(epoch) {
    return baseX + step * (epoch-startDate);
}

function calclulateLeftAxisX() {
    return scrWidth * 73/80;
}

function drawLaunches() {
    
    let counter = 0;
    let llength;
    for(let i = 0; i < launches.length; i++) {
        let x = calculateX(launches[i]);
        counter++;
        if (counter%10 == 0) {
            llength = scrHeight/3;
            if (counter%100 == 0) {
                c.fillText("" + counter, x - 9, baseY - llength - 6);
            }
        } else {
            llength = scrHeight/5;
        }
        drawLine(x, baseY, x, baseY - llength);
    }
    console.log("baecode complete");
}

function setColor(color) {
    c.strokeStyle = color;
    c.fillStyle = color;
}

function drawTimeLine(firstDate) {
    let d = new Date(firstDate.getTime()-MONTH_EPOCH*5);
    setColor("white");
    console.log(d);
    d.setDate(1);
    console.log(d);
    let lim = 1000;
    llength = sc(40);

    let xYearShift = sc(12);
    let yYearShift = sc(10);
    if (mode==REFURB || mode==AVERAGE) {
        xYearShift = sc(22);
        yYearShift = sc(20)
    }


    while (d.getTime() < endDate + MONTH_EPOCH*5) {
        if (d.getMonth()==0) {
            llength = sc(20); 
        } else {
            llength =sc(10);
        }
        //let x = baseX + step * (d-startDate);
        let x = calculateX2(d.getTime());
        drawLine(x, baseY, x, baseY + llength);
        if (llength == sc(20)) {
            c.beginPath();
            c.fillText("" + d.getFullYear(), x - xYearShift, baseY + llength + yYearShift);
            setColor("#000000");
            drawLine(x, baseY, x, scrHeight/10);
            setColor("white");
        }

        //console.log(d.getFullYear() + "-" + d.getMonth());
        if (d.getMonth()==11) {
            d.setFullYear(d.getFullYear()+1);
            d.setMonth(0);
        } else {
            d.setMonth(d.getMonth()+1);
        }
        lim--;
        if (lim==0) {
            return;
        }
    }
    let now = new Date();
    setColor("gray");
    c.setLineDash([5, 5]);
    let x = calculateX2(now.getTime());
    drawLine(x, baseY+sc(30), x, scrHeight/10);
    c.setLineDash([]);

}

function addToBooster(boosterId, launch, cnum) {
    let boosterA = boosters.filter(booster => booster.id == boosterId);
    let booster;
    
    if (boosterA.length > 0) {
        booster = boosterA[0];
        booster.addLaunch(launch);
    } else {
        booster = new Booster(boosterId, null, launch, COLS[cnum]);
        boosters.push(booster);
    }
}

function collectBoosterData() {
    let cnum = 0;
    for(let i = 0; i < launches.length; i++) {
        let launch = launches[i];
        for(let j= 0; j < launch.boosterIds.length; j++) {
            //console.log("adding booster flight:" + launch.boosterIds[j]);
            addToBooster(launch.boosterIds[j], launch, cnum);
            cnum = (cnum == COLS.length-1 ? 0 : cnum+1);
        }
    }
}

function calculateLaunchY(flightNo) {
    return baseY - flightNo / MAX_LANDING * scrHeight * 0.75;
}

function calculateAverageY(flightNo) {
    return baseY - flightNo*scrHeight/21;
}

function drawLaunchNoAxisMarks() {
    c.font = ""+ sc(10) + "px Ariana";
    for(let i= 1;i<MAX_LANDING;i++) {
        let y = calculateLaunchY(i);
        strokeStyle("gray");
        c.lineWidth =sc(0.6);
        drawLine(scrWidth*1/20, y, scrWidth * 19/20, y);
        strokeStyle("white");
        c.lineWidth = sc(1);
        drawLine(baseX-sc(10), y, baseX +sc(10), y);
        c.beginPath();
        c.fillStyle = "white";
        c.fillText(""+i, baseX - sc(22), y+sc(4));

        let leftAxisX = calclulateLeftAxisX();
        drawLine(leftAxisX - sc(10), y, leftAxisX + sc(10), y);
        c.beginPath();
        c.fillText(""+i, leftAxisX + 12, y+4);

    }
}

function drawLaunchNoAxisMarksAverage() {
    c.font = ""+ sc(14) + "px Ariana";
    for(let i= 1;i<16;i++) {
        let y = calculateAverageY(i);
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

function millisecsToDays(millisecs) {
    let months = Math.floor(millisecs / MONTH_EPOCH);
    let dayMillis = millisecs % MONTH_EPOCH;
    let days = Math.floor(dayMillis / (MONTH_EPOCH/30));
    let hourMillis = dayMillis % (MONTH_EPOCH/30);
    let hours = Math.floor(hourMillis / HOUR_EPOCH);
    let minMillis = hourMillis % (HOUR_EPOCH);
    let mins = Math.floor(minMillis/ (HOUR_EPOCH/60));
    let secMillis = minMillis % (HOUR_EPOCH/60);
    return "" + months + " months " + days + " days " + hours + " hours " + mins + " mins " + (secMillis/1000.0) + " secs";
}

function drawBoosterLines() {
    let minRefly = MONTH_EPOCH * 200;
    let minLaunch = null;
    let minBooster = null;
    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        let lastX;
        let lastY = baseY;
        if (booster.launches.length>0) {
            lastX = calculateX2(booster.launches[0].date.getTime() - MONTH_EPOCH);
        } else {
            console.error("booster faulty: " + booster);
        }
        if (booster.launches[0].date.getTime() < startDate.getTime() -   MONTH_EPOCH * 4) {
            continue;
        }

        strokeStyle(booster.col);
        c.fillStyle = booster.col;
        if (highlightBooster != "") {
            if (booster.id != highlightBooster) {
                strokeStyle("#797979");
                c.fillStyle = "#898989";
            }
        }
        
        let refly = 0;
        for(let j = 0; j < booster.launches.length; j++) {
            let launch = booster.launches[j];
            if (j>0) {
                refly = launch.date.getTime() - booster.launches[j-1].date.getTime();
                if (minRefly>refly) {
                    minRefly = refly;
                    minLaunch = launch;
                    minBooster = booster.id;
                }
            }
            let newY = calculateLaunchY(j+1);
            let newX = calculateX(launch);
            drawLine(lastX, lastY, newX, newY);
            c.beginPath();
            c.arc(newX, newY, sc(1.7), 0, 2 * Math.PI);
            c.fill();
            if (booster.id < "B1046") {
                if (highlightBooster == "") {
                    setColor("black");
                }
                c.beginPath();
                c.arc(newX, newY, sc(.7), 0, 2 * Math.PI);
                c.fill();
                if (highlightBooster == "") {
                    setColor(booster.col);
                }
                //setColor("#898989");
            }
            lastX = newX;
            lastY = newY;
        }
        c.beginPath();
        if (booster.isActive()) {
            c.arc(lastX, lastY, sc(3), 0, 2 * Math.PI);
            c.fill();
        } else {
            c.fillRect(lastX-sc(3), lastY-sc(3), sc(6), sc(6));
        }
        if (booster.id < "B1046") {
            if (highlightBooster == "") {
                setColor("black");
            }
            c.beginPath();
            c.arc(lastX, lastY, sc(.7), 0, 2 * Math.PI);
            c.fill();
            if (highlightBooster == "") {
                setColor(booster.col);
            }
            //setColor("#898989");
        }
    }
    console.log("min refly time: " + minRefly + millisecsToDays(minRefly));
    console.log("min Refly Booster:" + minBooster);
    console.log("min refly launch: ");
    console.log(minLaunch);
}

function findBooster(id) {
    for(let i=0; i < boosters.length; i++) {
        if (boosters[i].id==id) {
            return boosters[i];
        }
    }
    return null;
}

function writeBooster(booster, x, y) {
    c.beginPath();
    strokeStyle("black");
    c.fillStyle = "black";
    c.fillRect(x,y-sc(9),sc(32), sc(10));
    setColor(booster.col);
    //if (booster.id=="B1061") { console.log(booster.id + " - " + booster.col); }
    //c.font = ""+ sc(10) + "px Ariana";
    c.fillText(booster.id, x, y);
    if (!booster.isActive()) {
        c.fillText("_____", x, y);
    }
}

const BOOSTERNAME_WIDTH = 26;

function writeHorizontalBoosterNames(hBoosters) {
    let rows = [-1000, -1000, -1000, -1000, -1000, -1000];
    c.font = ""+sc(10)+"px Ariana";
    for(let i = 0; i<hBoosters.length; i++) {
        let b = hBoosters[i];
        if (b.launches[0].date.getTime() < startDate.getTime() - MONTH_EPOCH * 5) {
            continue;
        }
        let x = calculateX2(b.getLastLaunch().date.getTime());
        let rowI = 0;
        while(rowI < rows.length && rows[rowI] > x - sc(BOOSTERNAME_WIDTH)) {
            rowI++;
        }
        if (rowI < rows.length) {
            writeBooster(b, x-sc(20), baseY + sc(45) + sc(10)*rowI );
            rows[rowI] = x;
        }
    }
}

function writeBoosterNames() {
    c.font = ""+ sc(8.5) + "px Ariana";
    let names = [];
    let i;
    for(i=0; i < MAX_LANDING; i++) {
        names[i] = [];
    }

    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        names[booster.launches.length].push(booster.id);
    }
    for(i = 3; i < MAX_LANDING; i++) {
        let y =  calculateLaunchY(i) + sc(3);
        let x = baseX + sc(10);
        let rightX = calclulateLeftAxisX() + sc(30);
        c.font = ""+sc(12)+"px Ariana";
        for(let j = 0;j<names[i].length; j++) {
            let booster = findBooster(names[i][j]);
            c.beginPath();
            strokeStyle("black");
            c.fillStyle = "black";
            c.fillRect(x,y-sc(9),sc(32), sc(10));

            c.beginPath();
            strokeStyle(booster.col);
            c.fillStyle = booster.col;
            c.fillText(names[i][j], x, y);
            if (!booster.isActive()) {
                c.fillText("_____", x, y);
            }
            if (j<3) {
                writeBooster(booster, rightX, y);
                /*c.beginPath();
                strokeStyle("black");
                c.fillStyle = "black";
                c.fillRect(rightX,y-9,32, 10);
                strokeStyle(booster.col);
                c.fillStyle = booster.col;
                c.fillText(names[i][j], rightX, y);*/
            } else if (j==3) {
                c.fillStyle = "white";
                c.fillText("...", rightX, y);
            }
            x = x + sc(37);
            rightX = rightX + sc(37);
        }
    }
    let hBoosters = [];
    for(i = 0; i < MAX_LANDING; i++) {
        for(j = 0;j<names[i].length; j++) {
            let booster = findBooster(names[i][j]);
            hBoosters.push(booster);
        }
    }
    hBoosters.sort(function(a,b) 
        {
            return a.launches[a.launches.length-1].date.getTime() - b.launches[b.launches.length-1].date.getTime();
        }
    );
    writeHorizontalBoosterNames(hBoosters);
}

function calcRefurbY(millis) {
    let y = baseY - millis / (HOUR_EPOCH * 24) * sc(1);
    return y;
}

function drawRefurbLines() {
    
    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        let lastX = -1;
        let lastY = -1;
        if (booster.launches.length==0) {
            console.error("booster faulty: " + booster);
            continue;
        }
        strokeStyle(booster.col);
        c.fillStyle = booster.col;
        c.lineWidth = sc(1);
        let prevLaunch = booster.launches[0];

        for(let j = 1; j < booster.launches.length; j++) {
            let launch = booster.launches[j];
            let newY = calcRefurbY(launch.date.getTime()-prevLaunch.date.getTime());
            let newX = calculateX(launch);
            if (lastX>0) {
                drawLine(lastX, lastY, newX, newY);
            }
            lastX = newX;
            lastY = newY;
            prevLaunch = launch;
        }
        c.beginPath();
        if (booster.isActive()) {
            c.arc(lastX, lastY, sc(3), 0, 2 * Math.PI);
            c.fill();
        } else {
            c.fillRect(lastX-sc(3), lastY-sc(3), sc(6), sc(6));
        }
        if (booster.id < "B1046") {
            setColor("black");
            c.beginPath();
            c.arc(lastX, lastY, sc(.7), 0, 2 * Math.PI);
            c.fill();
            setColor(booster.col);
        }
    }
}

function findFirstReflyDate() {
    let firstRefDate = null;
    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        for(let j = 1; j < booster.launches.length; j++) {
            let launch = booster.launches[j];
            if (firstRefDate == null || firstRefDate > launch.date) {
                firstRefDate = launch.date;
            }

        }
    }
    return firstRefDate;
}

function drawRefurbTimeScale() {
    const days = 68;
    let leftAxisX = calclulateLeftAxisX();
    for(let i= 1;i<days;i++) {

        let y = calcRefurbY(HOUR_EPOCH*24*10*i);
        strokeStyle("gray");
        c.lineWidth = sc(0.6);
        drawLine(scrWidth*1/20, y, scrWidth * 19/20, y);
        strokeStyle("white");
        c.lineWidth = sc(1);
        drawLine(baseX-sc(10), y, baseX +sc(10), y);
        drawLine(leftAxisX-sc(10), y, leftAxisX +sc(10), y);
        if (i%2==0) {
            c.beginPath();
            c.fillText(""+(i*10), baseX - sc(30), y+sc(4));
            c.fillText(""+(i*10), leftAxisX + sc(15), y+sc(4));
        }

    }
    c.beginPath();
    let y = calcRefurbY(HOUR_EPOCH*24*10*days);
    c.fillText("days", baseX - sc(30), y+sc(4));
    c.fillText("days", leftAxisX + sc(15), y+sc(4));

}

function drawAverageLine(firstDate) {
    let rolling = new RollinAverage(MONTH_EPOCH, MONTH_EPOCH);
    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        for(let j = 0; j < booster.launches.length; j++) {
            let launch = booster.launches[j];
            let data = new DataElement(launch.date.getTime(), j + 1);
            rolling.addData(data);
        }
    }

    rolling.sort();

    let lastX = null;
    let lastY = null;
    c.lineWidth = sc(2);
    setColor("#ccc");
    let lastValue;

    for(let x = firstDate.getTime(); x < rolling.highest; x += MONTH_EPOCH/20) {
        let value = rolling.getAverage(x);
        lastValue = value;
        let coordX = calculateX2(x);
        let coordY = calculateAverageY(value);

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

function saveCanvas(name, onlyName = false) {
    var link = document.getElementById('link');
    let fileName = (onlyName? name : name + getDateStr("_")+".png");
    link.setAttribute('download', fileName);
    link.setAttribute('href', el("canv").toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
}

function saveClick() {
    switch (mode) {
        case LAUNCHES:
            saveCanvas("Falcon_booster_flights_");
            break;
        case REFURB:
            saveCanvas("Falcon_booster_refurb_times_");
            break;            
        case MOUNTAIN:
            break;
        case AVERAGE:
            saveCanvas("Falcon_booster_average_flight_ages_");
            break;
        case MASS_TO_ORBIT:
            saveCanvas("Falcon_mass_to_orbit_");
            break;
        case CADENCE:
            saveCanvas("Falcon_flight_cadence_");
            break;
        case BARCODE:
            saveCanvas("Falcon_barcode_");
            break;            
        case LANDINGS:
            saveCanvas("Falcon_landings_");
            break;
        case LC_USAGE:
            saveCanvas("Falcon_LC_usage_");
            break;
        }    
}

function stepOneMonth(d) {
    if (d.getMonth()==11) {
        d.setFullYear(d.getFullYear()+1);
        d.setMonth(0);
    } else {
        d.setMonth(d.getMonth()+1);
    }
}

function drawLaunchNoColumns() {
    let firstDate = startDate;
    let d = new Date(firstDate.getTime()-MONTH_EPOCH*5);
    d.setDate(1);
    let now = new Date();
    let columns = [];
    let maxCount = 0;

    while (d.getTime() < endDate + MONTH_EPOCH*5) {
        let count = 0;
        let dNext = new Date(d.getTime());
        stepOneMonth(dNext);
        if (dNext > now) {
            dNext = now;
        }
        for(let i = 0; i < launches.length;i ++) {
            if (launches[i].date >= d && launches[i].date < dNext) {
                count++;
            }
        }

        let x = calculateX2(d.getTime());
        let x1 = calculateX2(dNext.getTime());
        let col = {"x": x, "x1" : x1, "count":count};
        columns.push(col);
        maxCount = (maxCount < count ? count : maxCount);

        //console.log(d.getFullYear() + "-" + d.getMonth());
        stepOneMonth(d);
    }

    setColor("rgb(59, 59, 59)");
    for(let i = 0; i < columns.length; i++) {
        let col = columns[i];
        c.beginPath();
        let height = scrHeight * 0.7 * col.count / maxCount;
        c.rect(col.x, baseY-height, (col.x1 - col.x), height);
        c.fill();
    }
}

function launchesDiagram() {
    startDate = launches[48].date;
    initStep(startDate);
    drawLaunchNoColumns();
    drawTimeLine(startDate);
    drawLaunchNoAxisMarks();
    drawBoosterLines();
    writeBoosterNames();
    signImage();
    
}

function barcodeDiagram() {
    baseY = scrHeight * 7/10;
    drawTimeLine(launches[0].date);
    //drawLaunchNoAxisMarks();
    drawLaunchBarcodes();
    signImage();
}

function writeYearCount(year, yearCount) {
    setColor("white");
    let yearX = calculateX2(new Date("" + year + "-07-01"));
    c.font = ""+sc(10)+"px Arial";
    centerText("" + yearCount, yearX, baseY + sc(24));
}

function drawLaunchBarcodes() {
    
    drawLine(scrWidth/20, baseY, scrWidth * 19/20, baseY);
    c.font = ""+sc(15)+"px Arial";
    // #2d32cc kék  45 50 204
    // #cc2d2d piros 204 45 45
    let cols = ['#2d32cc', 'rgb(64,50,178)', 'rgb(83,49,159)', 'rgb(102,49,140)', 'rgb(121,48,121)',
                'rgb(140,47,102)', 'rgb(159,47,83)', 'rgb(178,46,64)', '#cc2d2d', '#fff'];
    let colIndex = 0;
    let year = launches[0].date.getFullYear();
    let yearCount = 0;
    for(let i = 0; i < launches.length;i ++) {
        let len = sc(100);
        let x = calculateX2(launches[i].date.getTime());
        let col = cols[colIndex];
        colIndex = colIndex < cols.length - 1 ? (colIndex +1) : 0;

        let actYear = launches[i].date.getFullYear();
        if (actYear == year) {
            yearCount++;
        } else {
            if (actYear > year + 1) {
                writeYearCount(year + 1, 0);
            }
            writeYearCount(year, yearCount);
            yearCount = 1;
            year = actYear;
        }

        if ( (i+1)%10 == 0) {
            col = "white";
            len = sc(200);
            if ((i+1)%100 == 0) {
                len = sc(300);
                setColor("white");
                c.font = ""+sc(15)+"px Arial";
                c.beginPath();
                c.fillText(""+(i+1), x - sc(12), baseY - sc(len) - sc(5));
            }
        }
        if (launches[i].isCrewedLaunch()) {
            col = "yellow";
            console.log(launches[i]);
            console.log(launches[i].landingSuccess);
        }
        setColor(col);
        drawLine(x, baseY, x, baseY - sc(len));
        if (col =="yellow") {
            c.beginPath();
            c.arc( x, baseY - sc(len), sc(5), 0, 2 * Math.PI);
            c.fill();
        }
    }
    c.font = "" + sc(8) + "px Arial";
    let partnerColor = {"N" : "yellow", "A" : "#f5d142", "P" : "#98f542", "J" : "#98f542"};
    for(let i = 0; i < launches.length;i ++) {
        let launch = launches[i];
        let len = sc(100);
        let x = calculateX2(launch.date.getTime());
        if ( (i+1)%10 == 0) {
            len = sc(200);
            if ((i+1)%100 == 0) {
                len = sc(300);
            }
        }
        if (launch.isCrewedLaunch()) {
            col = "yellow";
            setColor(col);
            drawLine(x, baseY, x, baseY - sc(len));
            let partner = launch.partner.substring(0,1);
            setColor(partnerColor[partner]);
            c.beginPath();
            c.arc( x, baseY - sc(len), sc(5), 0, 2 * Math.PI);
            c.fill();
            setColor("black");
            c.beginPath();
            c.fillText(launch.partner.substring(0,1), x-sc(3.2), baseY - sc(len) + sc(2.9) );
            c.fill();
        }
    }
    writeYearCount(year, yearCount);
    setColor("white");
}


function launchesAverageDiagram() {
    let firstDate = new Date("2017.01.01.");
    initStep(firstDate.getTime());
    
    drawLaunchNoAxisMarksAverage();
    let lastAverage = drawAverageLine(firstDate);
    //drawBoosterLines();
    //writeBoosterNames();
    signImage(lastAverage);
    drawTimeLine(firstDate);
    
}

function refurbDiagram() {
    let firstDate = findFirstReflyDate();
    initStep(firstDate.getTime());
    drawRefurbTimeScale();
    signImage();
    drawRefurbLines();
    drawTimeLine(firstDate);
    
}

function landingsDiagram() {
/*
    //drawLandingNoColumns();
    collectLandingData();
    drawTimeLine(launches[0].date);
    drawLandingNoAxisMarks();
    drawBoosterLines();
    writeBoosterNames();*/
    signImage();
    
}

function storeData(data) {
    console.log('Data read. Length:');
    launchesStr = data.split('\n');
    console.log(launchesStr.length);

    fillLaunchesArray(launchesStr);
    collectBoosterData();
    console.log(boosters);
    drawDiagram();
}


function drawDiagram() {
    initStep(launches[0].date.getTime());
    c.font = ""+sc(10)+"px Arial";
    c.fillStyle = "white";

    //*********************************************************************************************** */
    switch (mode) {
        case LAUNCHES:
            launchesDiagram();
            break;
        case REFURB:
            refurbDiagram();
            break;            
        case MOUNTAIN:
            draw3d();
            break;
        case AVERAGE:
            launchesAverageDiagram();
            break;
        case MASS_TO_ORBIT:
            massToOrbitDiagram();
            break;
        case CADENCE:
            cadenceDiagram();
            break;
        case BARCODE:
            barcodeDiagram();
            break;
        case LC_USAGE:
            LCDiagram();
            break;
        case LANDINGS:
            landingsDiagram();
            break;
        }
    //*********************************************************************************************** */

}

function getDateStr(separator, d = new Date()) {
    //let d = new Date();
    return d.getFullYear() + separator + MONTHS[d.getMonth()] + separator + d.getDate();
}

function centerText(txt, x, y) {
    console.log("centerText width: " + c.measureText(txt).width);
    c.fillText(txt, x - c.measureText(txt).width/2, y);
}

function days(date1, date2) {
    return (date2.getTime() - date1.getTime()) / 1000 / 60 / 60 / 24;
}

function collectActiveBoosters() {
    let activeBoosters = [];
    for(let i = 0; i < boosters.length; i++) {
        let booster = boosters[i];
        if (booster.isActive() &&
            days(booster.getLastLaunch().date, new Date())<365/2) {
                activeBoosters.push(booster);
        }
    }
    return activeBoosters;
}

function calcMedianAgeOfActiveBoosters() {
    let activeBoosters = collectActiveBoosters();
    console.log("Active boosters");
    console.log(activeBoosters);
    activeBoosters.sort(function(a,b) 
        {
            return a.launches.length - b.launches.length;
        }
    );
    for(let i = 0; i < activeBoosters.length; i++) {
        console.log(activeBoosters[i].id + " : " + activeBoosters[i].launches.length);
    }
    if (activeBoosters.length % 2 == 0) {
        return (activeBoosters[Math.floor(activeBoosters.length/2)-1].launches.length +
                activeBoosters[Math.floor(activeBoosters.length/2)].launches.length) / 2;
    } else {
        return (activeBoosters[Math.floor(activeBoosters.length/2)].launches.length);
    }
}

function signImage(lastAverage) {
    c.font = ""+sc(15)+"px Arial";
    c.fillStyle = "white";
    //c.fillText("@JaraySzabolcs", 1616, 140);
    c.fillText("@JaraySzabolcs", scrWidth * 36/40 - sc(110), scrHeight * 3/20);

    c.fillStyle = "gray";
    if (mode==REFURB) {
        c.fillStyle = "#F0F0F0";
    }
    if (mode != AVERAGE && mode != MASS_TO_ORBIT && mode != CADENCE && mode != BARCODE 
        && mode != LC_USAGE) {
        c.beginPath();
        let circleX = scrWidth * 3/10;
        let cubeX = scrWidth * 4/10;
        let dotX = scrWidth * 6/10;
        //c.arc( 500, scrHeight * 3/20 - 5, 5, 0, 2 * Math.PI);
        c.arc( circleX, scrHeight * 3/20 - sc(5), sc(5), 0, 2 * Math.PI);
        c.fill();
        c.fillRect(cubeX, scrHeight * 3/20 - sc(10), sc(10), sc(10));
        c.fillText("Last landing success", circleX + sc(20), scrHeight * 3/20);
        c.fillText("No landing attempt / failed landing at last flight", cubeX + sc(20), scrHeight * 3/20);
        c.fillText("Black dot inside: pre Block 5 booster flight", dotX, scrHeight * 3/20);
        setColor("#B0B0B0");
        c.font = ""+sc(75)+"px Arial";

        //centerText("RIP B1061", scrWidth/2, scrHeight/2 - 200 );
    } else if (mode == MASS_TO_ORBIT) {
        c.beginPath();
        c.fillText("Overall* payload mass: " + sumMass/1000 + " tonnes. Disc: Falcon 9, Big disc: +Dragon, Circle: Crew Dragon, Square: Falcon Heavy", scrWidth/2 - sc(360), scrHeight * 3/20);
    } else if (mode == BARCODE) {
        c.fillStyle = "#F0F0F0";
        c.font = ""+sc(24)+"px Arial";
        c.beginPath();
        c.fillText("Number of launches to date: " + launches.length, scrWidth/2 - sc(160), scrHeight * 3/20);
    }

    c.fillStyle = "#F0F0F0";
    c.font = ""+sc(24)+"px Arial";
        
    let text = "Falcon Booster flights diagram";
    let length = sc(240);
    if (mode==REFURB) {
        text = "Falcon Booster turnaround time diagram";
        length = sc(300);
    } else if (mode==AVERAGE) {
        text = "Falcon Boosters average reflight number (age) diagram";
        length = sc(370);
        centerText("Current average value: " + Math.round(lastAverage*1000)/1000 +
        ". Current median age of active boosters: " + calcMedianAgeOfActiveBoosters(), scrWidth/2, scrHeight * 3/20);
    } else if (mode==MASS_TO_ORBIT) {
        text = "Falcon flights payload mass diagram";
        length = sc(300);
    } else if (mode==CADENCE) {
        text = "Falcon Boosters flight rate (~1.5 month)";
        //text = "Falcon rakéták repülési gyakorisága (~1.5 month)";
        //length = sc(340);
        length = sc(320);
        centerText("Current flight rate: " + Math.round(currentCadence*1000)/1000 + ", maximum flight rate: " + Math.round(highestCadence*1000)/1000, scrWidth/2, scrHeight * 3/20);
        //c.fillText("Aktuális gyakoriság: " + Math.round(currentCadence*1000)/1000 + ", maximum gyakoriság: " + Math.round(highestCadence*1000)/1000, scrWidth/2 - sc(320), scrHeight * 3/20);
    
        let marksX = scrWidth * 3/20;
        setColor(allCol);
        c.fillRect(marksX, scrHeight * 5/20, sc(10), sc(10));
        c.fillText("All flights", marksX + sc(40), scrHeight * 5/20 + sc(15)); 
        setColor(slCol);
        c.fillRect(marksX, scrHeight * 5/20 + sc(40), sc(10), sc(10));
        c.fillText("Starlink flights", marksX + sc(40), scrHeight * 5/20 + sc(55)); 
        setColor(diffCol);
        c.fillRect(marksX, scrHeight * 5/20 + sc(80), sc(10), sc(10));
        c.fillText("Non Starlink flights", marksX + sc(40), scrHeight * 5/20 + sc(95)); 
        c.fillStyle = "white";
        
    } else if (mode == BARCODE) {
        text = "Falcon launches \"barcode\"";
        length = sc(200);
    } else if (mode == LANDINGS) {
        text = "Falcon booster landings";
    } else if (mode == LC_USAGE) {
        text = "Falcon rockets' launch complex usage";
    }

    //c.fillText(text + " - " + getDateStr(" ") + "; last launch: " + getDateStr(" ", launches[launches.length-1].date), scrWidth/2 - length, scrHeight * 2/20);
    centerText(text + " - " + getDateStr(" ") + "; last launch: " + getDateStr(" ", launches[launches.length-1].date), scrWidth/2, scrHeight * 2/20);
}


function strokeStyle(style) {
    c.strokeStyle = style;
}

function drawLine(x0, y0, x1, y1) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
}

function drawAxises(forceDraw = false) {
    if (mode != BARCODE || forceDraw) {
        strokeStyle("white");
        drawLine(baseX, baseY + scrHeight/20, baseX, scrHeight/10);
        drawLine(scrWidth/20, baseY, scrWidth * 19/20, baseY);
        let leftAxisX = calclulateLeftAxisX();
        drawLine(leftAxisX, baseY + scrHeight/20, leftAxisX, scrHeight/10);
    }
}

function refreshData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            console.log(xhttp.responseText);
            window.location.reload();
        }
    };
    xhttp.open("GET", REFRESH_DATA_FROM_WIKI, true);
    xhttp.send();
}