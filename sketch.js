var mic = null;

function randomVector(minLen, maxLen) {
  return createVector(random(minLen, maxLen), random(minLen, maxLen))
}

function vecSign(vec) {
  return createVector(
    (vec.x > 0) ? 1 : -1,
    (vec.y > 0) ? 1 : -1
  )
}

BORDER_SIZE=100;

const COLORS=CS_GREEN;

// const COLORS = MAPS["Spectral"];

const MINSPEED = .2;
const MAXSPEED = 5;

let LOGGEDTIMES = {};

function debug(l, ...data) {
  if (!LOGGEDTIMES[l]) {
    LOGGEDTIMES[l] = 0;
  }
  if (LOGGEDTIMES[l] < 10) {
    console.log(l, LOGGEDTIMES[l], ...data)
    LOGGEDTIMES[l] += 1;
  }
}

class SoundShape {

  constructor(loc, speed, rotspeed, myColor, maxLoc, myColor2) {
    if (!myColor) {
      this.color1 = color(random(COLORS));
      // this.color1.setAlpha(100);
    }
    if (!myColor2) {
      this.color2 = color(random(COLORS));
    }
    this.colorspeed = .01;
    this.colorX = 0;
    this.maxLoc = maxLoc;
    if (!loc) {
      loc = createVector(random(this.maxLoc.x), random(this.maxLoc.y));
    }
    this.loc = loc
    this.speed = (speed) ? speed : createVector(random(MINSPEED, MAXSPEED), random(MINSPEED, MAXSPEED));
    if (!rotspeed) {
      rotspeed = random(.5);
    }
    this.rotspeed = rotspeed;
    this.rotation = random(PI);
  }

  update() {
    let newLoc = p5.Vector.add(this.loc, this.speed);
    this.speed = this.speed
      .mult(vecSign(newLoc))
      .mult(vecSign(p5.Vector.sub(this.maxLoc, newLoc)))
    this.loc.add(this.speed);
    this.rotation += this.rotspeed;
    if (this.colorX + this.colorspeed < 0 || this.colorX  + this.colorspeed > 1) {
        this.colorspeed *= -1
    }
    this.colorX += this.colorspeed
  
  }

  draw(volume) {
    push()
    let myColor = lerpColor(this.color1, this.color2, this.colorX);
    let myColor2 = lerpColor(this.color2, this.color1, this.colorX);
    myColor2.setAlpha(250);
    myColor.setAlpha(200);
    fill(myColor);
    stroke(myColor2);
    translate(this.loc.x, this.loc.y)
    rotate(this.rotation);
    scale(volume)
    strokeWeight(.5);
    this.makeShape();
    pop();
  }
}

class SoundElipse extends SoundShape {
  makeShape() {
    ellipse(0, 0, 20);
  }
}

class SoundTriangle extends SoundShape {
  makeShape() {
    triangle(0, 0, 20, 0, 0, 20);
  }
}

class SoundLine extends SoundShape {
  makeShape() {
    line(0, 0, 0, 20);
  }
}

class TimeWindow {

  constructor(myWidth, duration) {
    this.x = 0;
    this.myHeight = height * .8
    this.y = .1 * this.myHeight
    this.myWidth = (myWidth) ? myWidth : width / 10;
    duration = duration?duration: 10;
    this.speed = width/duration;
    this.startTime = Date.now();
    this.shapes = [];
  }

  addShape(shape) {
    this.shapes.push(
      new SoundLine(0, 0, 0, 0, createVector(this.myWidth, this.myHeight))
    )
    this.shapes.push(
      new SoundElipse(0, 0, 0, 0, createVector(this.myWidth, this.myHeight))
    );
    this.shapes.push(
      new SoundTriangle(0, 0, 0, 0, createVector(this.myWidth, this.myHeight))
    );
  }

  update() {
    this.x = (Date.now() - this.startTime) * this.speed / 1000
    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      shape.update();
    }
  }

  draw(micLevel) {
    push()
    translate(this.x, this.y);
    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      shape.draw(micLevel);
    }
    pop();
  }

}

let nBalls = 2;
let timeWindow = null;

function setup() {
  mic = new p5.AudioIn();
  mic.start()

  createCanvas(windowWidth, windowHeight);
  background(0);

  timeWindow = new TimeWindow();
  for (let i = 0; i < nBalls; i++) {
    timeWindow.addShape();
  }
}

function hPct(i, l) {
  return height * (1 - (log(i) / log(l)));
}

function wPct(i, l) {
  return width * (i / l);
}

function draw() {
  let micLevel = mic.getLevel(.9);
  micLevel+=.01
  timeWindow.draw(micLevel*20)
  timeWindow.update()
}

function mousePressed() {
  setup()
  getAudioContext().resume()
}