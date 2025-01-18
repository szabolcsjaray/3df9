function calculate3Dx(launch) {
    let d = launch.date.getTime();
    let step = 400/(endDate - startDate);
    let x = -200 + step * (d-startDate);
    return x;
}

function calculateTime3Dx(time) {
    let d = time;
    let step = 400/(endDate - startDate);
    let x = -200 + step * (d-startDate);
    return x;
}

var camera;
var renderer;
var scene;
var z = 150;
var lookx = 0;
var looky = 0;

var mountainSplits = [];

function addBoosterToSplitIfNeeded(mSplit, booster) {
    let boosterCheckReady = false;
    for(let i=0; i<booster.launches.length && !boosterCheckReady;i++) {
        if (i < booster.launches.length-1) {
            let prevTime = booster.launches[i].date.getTime();
            let nextTime = booster.launches[i+1].date.getTime();
            if (mSplit.time > prevTime &&
                mSplit.time < nextTime ) {
                let height = i + ((mSplit.time - prevTime) / (nextTime - prevTime));
                mSplit.addBooster(booster, height);
                boosterCheckReady = true;
            }
            if (mSplit.time < prevTime) {
                boosterCheckReady = true;
            }
        }
    }
}

function calculateLaunchHeights() {
    for(let i = 0;i<mountainSplits.length; i++) {
        let mSplit = mountainSplits[i];
        for(let j = 0; j < boosters.length; j++) {
            let booster = boosters[j];
            addBoosterToSplitIfNeeded(mSplit, booster);
        }
        mSplit.sortBoostersByHeight();
        console.log(mSplit);
    }

}

function collectBoosterLaunchData() {
    mountainSplits = [];
    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        for(let j = 1; j < booster.launches.length; j++) {
            let launch = booster.launches[j];
            if (launch.mountainSplit == null) {
                let mSplit = new MountainSplit(launch, booster, j);
                mountainSplits.push(mSplit);
            } else {
                launch.mountainSplit.addBooster(booster, j);
            }
        }
    }

    mountainSplits.sort(function(a,b) 
    {
        return a.time - b.time;
    });
    console.log("Mountain splits:");
    console.log(mountainSplits);
    console.log("---------");
    calculateLaunchHeights();
}

const BASE_Z = 0;
const Z_GAP = 2;

function calculateBoosterZ(launch, booster) {
    let mSplit = launch.mountainSplit;
    let allBoostersNum = mSplit.boosterHeights.length;
    let boosterNum = mSplit.getBoosterOrder(booster);
    let z = BASE_Z - (Z_GAP * (boosterNum - (allBoostersNum/2)));
    console.log(" Z calc: " + allBoostersNum + " -> " + boosterNum + ". Z: " + z);
    return z;
}

function calculateBoosterZAtMSplit(mSplit, booster) {
    let allBoostersNum = mSplit.boosterHeights.length;
    let boosterNum = mSplit.getBoosterOrder(booster);
    let z = BASE_Z - (Z_GAP * (boosterNum - (allBoostersNum/2)));
    console.log(" Z calc: " + allBoostersNum + " -> " + boosterNum + ". Z: " + z);
    return z;
}

function draw3d() {
    collectBoosterLaunchData();
    el("canv").style.display = "none";

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.id = 'f93dcanvas';

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, z );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();

    const ambient = new THREE.AmbientLight(0x2f2f2f, 0.3);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(ambient);
    scene.add(directionalLight);

    const material = new THREE.LineBasicMaterial( { color: 0x3050ff, linewidth: 500 } );


    let lines = [];
    let x;
    for(x = 0; x<=100; x +=10) {
        let  points = [];
        points.push( new THREE.Vector3( - 100, -30, x-50 ) );
        points.push( new THREE.Vector3(  100, -30, x-50 ) );
        lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), material ));

    }
    for(x = 0; x <= 200; x +=10) {
        let  points = [];
        points.push( new THREE.Vector3(  x - 100, -30, -50 ) );
        points.push( new THREE.Vector3(  x - 100, -30, 50 ) );
        lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), material ));

    }

    /*
    const geometry = new THREE.TorusKnotBufferGeometry(15, 0.8, 357, 100, 2, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x303030 });
    const torusKnot = new THREE.Mesh(geometry, material);

    const geometry2 = new THREE.TorusKnotBufferGeometry(10, 1.8, 300, 100, 4, 3);
    const material2 = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const torusKnot2 = new THREE.Mesh(geometry2, material2);

    const geometry3 = new THREE.TorusKnotBufferGeometry(5, 0.8, 100, 100, 4, 3);
    const material3 = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const torusKnot3 = new THREE.Mesh(geometry3, material3);
    */

    let materialLaunch = new THREE.LineBasicMaterial( { color: 0x30f0ff, transparent: true, opacity: 0.3} );
    let materialSlope = new THREE.LineBasicMaterial( { color: 0x7050ff, transparent: true, opacity: 0.6} );

    /*for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        drawBoosterLinesSimple(booster, lines, materialLaunch);
    }*/

    for(let i=0; i < boosters.length; i++) {
        let booster = boosters[i];
        drawBoosterLinesComplex(booster, lines, materialLaunch);
    }
    drawMountainSlopeLines(lines, materialSlope);


    lines.forEach(line => scene.add(line));
    animationStep();
}

var boosterToFind = null;

function checkBooster(boosterHeight) {
    return boosterHeight.booster.id == boosterToFind.id;
}

function drawBoosterLinesComplex(booster, lines, materialLaunch) {
    boosterToFind = booster;
    let coverLinePoints = [];
    let boosterMaterial = new THREE.LineBasicMaterial( { color: 0x30f0ff} );
    boosterMaterial.color = new THREE.Color(  parseInt(booster.col.replace(/#/, ''), 16));
    let x, y, z;
    for(let j =  0; j < mountainSplits.length; j++) {
        let mSplit = mountainSplits[j];
        let bHeight = mSplit.boosterHeights.find(checkBooster);
        if (bHeight !== undefined) {
            x = calculate3Dx(mSplit.launch);
            z = calculateBoosterZAtMSplit(mSplit, booster);
            y = -30 + (2 * bHeight.height);
            console.log("" + booster.id + " ("+x+", "+y+", "+z+")");
            coverLinePoints.push(new THREE.Vector3(  x - 100, y, z));
        }
    }
    lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( coverLinePoints ), boosterMaterial ));
    console.log("-----");

    for(let j = 1; j < booster.launches.length; j++) {
        let launch = booster.launches[j];
        let x = calculate3Dx(launch);
        let  points = [];
        let z = calculateBoosterZ(launch, booster);
        points.push( new THREE.Vector3(  x - 100, -30, z ) );
        points.push( new THREE.Vector3(  x - 100, -30+j*2, z ) );
        lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), materialLaunch ));
    }
}

function drawMountainSlopeLines(lines, materialSlope) {
    let x, y, z;
    for(let j =  0; j < mountainSplits.length; j++) {
        let slopeLine = [];
        let mSplit = mountainSplits[j];
        x = calculate3Dx(mSplit.launch);

        for(let si = 0; si < mSplit.boosterHeights.length; si++) {
            bHeight = mSplit.boosterHeights[si];
            z = calculateBoosterZAtMSplit(mSplit, bHeight.booster);
            y = -30 + (2 * bHeight.height);
            slopeLine.push(new THREE.Vector3(  x - 100, y, z));
        }
        lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( slopeLine ), materialSlope ));
    }
}



function drawBoosterLinesSimple(booster, lines, materialLaunch) {
    let coverLinePoints = [];
    let boosterMaterial = new THREE.LineBasicMaterial( { color: 0x30f0ff} );
    boosterMaterial.color = new THREE.Color(  parseInt(booster.col.replace(/^#/, ''), 16));
    for(let j = 1; j < booster.launches.length; j++) {
        let launch = booster.launches[j];
        let x = calculate3Dx(launch);
        let  points = [];
        let z = calculateBoosterZ(launch, booster);
        points.push( new THREE.Vector3(  x - 100, -30, z ) );
        points.push( new THREE.Vector3(  x - 100, -30+j*2, z ) );
        coverLinePoints.push(new THREE.Vector3(  x - 100, -30+j*2, z ) );
        lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( points ), materialLaunch ));
    }
    lines.push( new THREE.Line( new THREE.BufferGeometry().setFromPoints( coverLinePoints ), boosterMaterial ));
}


const tempo1 = 0.3;

function animationStep() {
    camera.position.set( 0, 0, z );
    camera.lookAt( lookx, looky, 0 );
    renderer.render( scene, camera );
    z = z - 5 * tempo1;
    lookx += 1 * tempo1;
    looky -= .1 * tempo1;
    if (z > 20) {
        setTimeout(animationStep, 50);
    } else {
        setTimeout(animationStep2, 50);
    }
}
const tempo = 0.2;

function animationStep2() {
    camera.lookAt( lookx, looky, 0 );
    renderer.render( scene, camera );
    lookx += 5 * tempo;
    looky -= 1.7 * tempo;
    if (lookx < 40) {
        setTimeout(animationStep2, 50);
    }
}

function rerender() {
    camera.lookAt( lookx, looky, 0 );
    renderer.render( scene, camera );
}


function upButton() {
    looky += 5;
    rerender();
}

function downButton() {
    looky -= 5;
    rerender();
}
function leftButton() {
    lookx += 5;
    rerender();
}

function rightButton() {
    lookx -= 5;
    rerender();
}


/*var loader = new THREE.ImageLoader( manager );
bgTexture = loader.load("Hubble_image.png",
    function ( texture ) {
        var img = texture.image;
        bgWidth= img.width;
        bgHeight = img.height;
        resize();
    } );
scene.background = bgTexture;*/
//scene.add(torusKnot2);
//scene.add(torusKnot3);
