// Set up canvas


const min_radius = 50;
let blip_radius = min_radius;


class star {
    constructor(x_pos, y_pos, radius) {
        this.x = Math.floor(x_pos);
        this.y = Math.floor(y_pos);
        this.radius = Math.floor(radius);
        this.dead = false;
    }

    update() {
        const random_num = random(0, 100);
        if (random_num < 5) {
            this.radius -= 1;
        }

        if (this.radius <= 5) {
            this.dead = true;
        }
    }

    display() {
        const c_1 = 'hsl(0, 100%, 50%)';
        const c_2 = '#000000'
        let gradient = drawingContext.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, c_1); // Center color
        gradient.addColorStop(1, c_2); // Outer color
        drawingContext.fillStyle = gradient;

        // 4. Draw your shape
        noStroke();
        circle(this.x, this.y, (this.radius * 2) + random(0, 2));
    }
}


class mold {
    constructor(startingPosX, startingPosY, canvas_width, canvas_length, moldColor, ringDensity, shearing) {
        this.x = startingPosX;
        this.shearing = shearing
        this.y = startingPosY;
        this.r = 0.5;
        this.color = moldColor;
        this.ringDensity = ringDensity;
        this.canvas_width = canvas_width;
        this.canvas_length = canvas_length;

        this.heading = random(360);
        this.vx = cos(this.heading);
        this.vy = sin(this.heading);
        this.rotAngle = 45;

        this.rSensorPos = createVector(0, 0);
        this.fSensorPos = createVector(0, 0);
        this.lSensorPos = createVector(0, 0);
        this.sensorAngle = 45;
        this.sensorDist = 10;
        this.colorF = 0;
        this.colorR = 0;
        this.colorL = 0;

    }

    update() {

        this.vx = cos(this.heading);
        this.vy = sin(this.heading);

        this.x = (this.x + this.vx) % this.canvas_width;
        this.y = (this.y + this.vy) % this.canvas_length;

        // see if inside blip radius!!! 
        if (getDistance(this.x, this.y, mouseX, mouseY) < Math.floor(blip_radius * 0.8)) {
            // pick random angle and move to edge? 
            this.x = this.x + random(-100, 100);
            this.y = this.y + random(-100, 100);

        }

        this.rSensorPos.x = this.x + this.sensorDist * cos(this.heading + this.sensorAngle);
        this.rSensorPos.y = this.y + this.sensorDist * sin(this.heading + this.sensorAngle);

        this.lSensorPos.x = this.x + this.sensorDist * cos(this.heading - this.sensorAngle);
        this.lSensorPos.y = this.y + this.sensorDist * sin(this.heading - this.sensorAngle);

        this.fSensorPos.x = this.x + this.sensorDist * this.vx;
        this.fSensorPos.y = this.y + this.sensorDist * this.vx;

        let index, l, r, f;
        index = 4 * (d * floor(this.rSensorPos.y)) * (d * width) + 4 * (d * floor(this.rSensorPos.x));
        r = pixels[index];

        index = 4 * (d * floor(this.fSensorPos.y)) * (d * width) + 4 * (d * floor(this.fSensorPos.x));
        f = pixels[index];

        index = 4 * (d * floor(this.lSensorPos.y)) * (d * width) + 4 * (d * floor(this.lSensorPos.x));
        l = pixels[index];

        //get distance to other mold, and do stuff?
        //or get distance from center
        let xCenter = width / 2;
        let yCenter = height / 2;
        //distance from another mold.
        this.colorF = (r * l * this.color) % 255;
        this.colorR = (r + this.color) % 255;
        //distance from center
        //this.colorL = (getDistance(this.x,this.y, xCenter, yCenter) % this.ringDensity);
        const ring_density = 1000;
        this.colorL = (getDistance(this.x, this.y, mouseX, mouseY) % ring_density);

        // should be changed to be more interesting. Maybe we could add some centers? 

        if ((f > l) && (f > r)) {
            this.heading += 0;
        }
        else if (f < l && f < r) {
            if (random(1) < 0.5) {
                this.heading += this.rotAngle;
            }
            else {
                this.heading -= this.rotAngle;
            }
        }
        else if (l > r) {
            this.heading += -this.rotAngle;
        }
        else if (r > l) {
            this.heading += this.rotAngle;
        }
    }



    display() {
        noStroke();
        fill(this.colorL, this.colorF, this.colorR);
        ellipse(this.x % this.canvas_width, this.y % this.canvas_length, this.r * this.shearing, this.r * this.shearing);
    }
}

function getDistance(x1, y1, x2, y2) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

let d; let molds = []; let moldNum = 10000;
const viewportWidth = (window.innerWidth * 0.95);
const viewportHeight = (window.innerHeight * 0.95);
// let canvasSize = Math.floor(Math.min(viewportWidth , viewportHeight));
let points = [];
let circleX, circleY;
let spawnPoints = [];

let moldColor = 150;
let ringDensity = 500;
let clickType = false;
let = 3;
let shearing = 3;

function preload() {

    let controls = document.getElementById('moldControls');


    const elements = document.querySelectorAll('.setting');

    elements.forEach(element => {
        element.addEventListener('click', function (event) {
            molds = [];
            moldNum = document.getElementById('moldNum').value;
            moldColor = document.getElementById('moldColor').value;
            ringDensity = document.getElementById('ringDensity').value;
            shearing = document.getElementById('Shearing').value;
            setup();
        });
    });
}

let slider;
const canvas_width = Math.floor(viewportWidth * 0.95);
const canvas_length = Math.floor(viewportHeight * 0.95);

let my_stars = [];

function setup() {

    canvas = createCanvas(canvas_width, canvas_length);
    document.oncontextmenu = () => false
    canvas.parent("canvas-container"); // Attach to the div
    angleMode(DEGREES);


    d = pixelDensity();
    //spawns them in a circle. 

    const centerY = canvas_length / 2;
    const centerX = canvas_width / 2;
    const radius = Math.floor(canvas_width / 5);

   // my_stars.push(new star(centerX, centerY, 300));


    for (let i = 0; i < moldNum; i++) {
        const angle = (i / moldNum) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        molds[i] = new mold(x, y, canvas_width, canvas_length, moldColor, ringDensity, shearing);
    }

    for (let i = 0; i < moldNum; i++) {
        const angle = (i / moldNum) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        molds[i] = new mold(x, y, canvas_width, canvas_length, moldColor, ringDensity, shearing);
    }
}

function reset() {
    setup();
}



function draw() {
    background(0, 5);
    loadPixels();
    make_gradient_circle('#021b45', '#000000');

    for (let i = my_stars.length - 1; i >= 0; i--) {
        my_stars[i].display();
        my_stars[i].update();

        if (my_stars[i].dead === true) {
            my_stars.splice(i, 1);
        }
    }


    for (let i = 0; i < molds.length; i++) {
        molds[i].display();
        molds[i].update();
    }


    if (mouseIsPressed) {
        if (mouseButton === LEFT) {
            blip_radius += 2;
        }
        if (mouseButton === RIGHT) {
            // make new mold!
            blip_radius = 0;
            const new_mold = new mold(Math.floor(mouseX), Math.floor(mouseY), canvas_width, canvas_length, moldColor, ringDensity, shearing);
            console.log(new_mold);
            molds.push(new_mold);
        }
    }
    else {
        blip_radius = Math.max(blip_radius - 8, min_radius);
    }


}

function make_gradient_circle(c_start, c_end) {

    let gradient = drawingContext.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, blip_radius);

    // 2. Add color stops (0 is center, 1 is outer edge)
    // gradient.addColorStop(0, '#021b45'); // Center color
    // gradient.addColorStop(1, '#000000'); // Outer color

    gradient.addColorStop(0, c_start); // Center color
    gradient.addColorStop(1, c_end); // Outer color

    // 3. Assign the gradient to the drawingContext fillStyle
    drawingContext.fillStyle = gradient;

    // 4. Draw your shape
    noStroke();
    circle(mouseX, mouseY, blip_radius * 2);
}

// Called whenever the mouse is pressed
function mousePressed() {
    // Check if the mouse is inside the canvas
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        console.log("Mouse clicked at:", mouseX, mouseY);
        fill(0, 0, 0);
        ellipse(mouseX, mouseY, 200, 200); // Draw a red circle where clicked
    }
}

