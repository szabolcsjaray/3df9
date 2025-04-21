var boosterI = 0;

function runBoosterLineAnim() {
    boosterI = 0;
    
    drawStep();
}

function drawStep() {
    if (boosterI < boosters.length) {
        highlightBooster = boosters[boosterI].id;
        redrawBoosterLines();
        c.font = ""+ sc(60) + "px Ariana";
        if (boosters[boosterI].isActiveStill()){
            setColor("white");
        } else {
            setColor("gray");
        }
        centerText(boosters[boosterI].id, scrWidth / 2, scrHeight /2.2);
        saveCanvas((""+boosterI).padStart(3,"0")+".png", true);
        boosterI++;
        setTimeout(drawStep, 100);
    }
}

/*
redrawBoosterLines
*/