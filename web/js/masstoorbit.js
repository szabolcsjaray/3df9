var lightest = 100000;
var heaviest = -100000;
var sumMass = 0;

function isNum(c) {
    return (c>='0' && c<='9');
}

function extractMasses() {
    for(let i = 0; i < launches.length; i++) {
        let launch = launches[i];
        let pmStr = launch.payloadMass;
        if (pmStr[0]=='~') {
            pmStr = pmStr.substring(1);
        }
        if (isNum(pmStr[0])) {
            let end = pmStr.indexOf("kg");
            if (end!=-1) {
                pmStr = pmStr.substring(0, end);
                pmStr = pmStr.replace(",", "");
                launch.payLoadMassKg = parseFloat(pmStr);
                sumMass += launch.payLoadMassKg;
                if (launch.payLoadMassKg < lightest) {
                    lightest = launch.payLoadMassKg;
                }
                if (launch.payLoadMassKg > heaviest) {
                    heaviest = launch.payLoadMassKg;
                }
            }
        }
    }
    console.log("**************************************************************************************");
    console.log("Lightest: " + lightest + ", heaviest: " + heaviest);
    console.log("**************************************************************************************");
    console.log(launches);
}

function calcMassY(mass) {
    return baseY - mass * (scrHeight*0.7)/heaviest;
}

function drawMassAxisMarks() {
    c.font = ""+sc(12)+"px Ariana";
    let leftAxisX = calclulateLeftAxisX();
    for(let i= 500;i < heaviest + 200; i += 500) {
        let y = calcMassY(i)
        strokeStyle("gray");
        c.lineWidth = 0.6;
        drawLine(scrWidth*1/20, y, scrWidth * 19/20, y);
        strokeStyle("white");
        c.lineWidth = 1;
        drawLine(baseX-sc(10), y, baseX +sc(10), y);
        c.beginPath();
        c.fillStyle = "white";
        c.fillText(""+i, baseX - sc(42), y+4);

        
        drawLine(leftAxisX - sc(10), y, leftAxisX + sc(10), y);
        c.beginPath();
        c.fillText(""+i, leftAxisX + sc(12), y+sc(4));

    }

    c.fillText("kg", baseX - 30, calcMassY(heaviest + 400));
    c.fillText("kg", leftAxisX + 22, calcMassY(heaviest + 400));
}

function getOrbitIndexMTO(launch) {
    for(let i = 0; i < ORBITS.length; i++) {
        if (launch.orbit.search(ORBITS[i]) != -1) {
            return i;
        }
    }
    return 11;
}

function drawMassDiagram() {
    setColor("#cccccc");
    for(let i = 0; i < launches.length; i++) {
        let launch = launches[i];
        let colNum = getOrbitIndexMTO(launch);
        setColor(COLS[colNum]);
        let x = calculateX2(launch.date.getTime());
        let y = calcMassY(launch.payLoadMassKg);
        

        if (launch.id.startsWith("FH")) {
            c.beginPath();
            c.fillRect(x-sc(3), y-sc(3), sc(7), sc(7));
            c.fill();
        } else {

            let rad = sc(1.5);
            if (launch.payloadMass.search("Dragon") != -1 || launch.payload.search("Dragon") != -1) {
                rad = sc(3);
            }
            c.beginPath();
            c.arc(x, y, rad, 0, 2 * Math.PI);
            c.fill();
            
            if (launch.isCrewedLaunch())
            {
                c.beginPath();
                rad = sc(5);
                c.arc(x, y, rad, 0, 2 * Math.PI);
                c.stroke();

                c.font = ""+sc(10)+"px Ariana";

                let partner = launch.partner.substring(0,1);

                c.fillStyle = (partner == 'N' ?"blue" :
                                (partner == 'A' ? "green" : "red"));
                c.beginPath();
                c.fillRect(x-sc(9), y-sc(11), sc(9), sc(9));
                c.fill();
                
                setColor("white");
                c.beginPath();
                c.fillText(launch.partner.substring(0,1), x-sc(8), y-sc(3) );
                c.fill();
            }

        }
        
    }
}

function writeOrbits() {
    c.font = ""+sc(13)+"px Ariana";
    for(let i = 0; i < ORBITS.length; i++) {
        setColor(COLS[i]);
        c.beginPath();
        c.fillText(ORBITS[i], baseX + sc(22), (scrHeight / 5) + i*sc(20));
    }
}

function drawMassLines() {
    
}


function massToOrbitDiagram() {
    extractMasses();
    c.font = ""+sc(15)+"px Ariana";
    drawTimeLine(launches[0].date);
    drawMassAxisMarks();
    drawMassLines();
    drawMassDiagram();

    writeOrbits();
    //drawBoosterLines();
    //writeBoosterNames();
    signImage();
}