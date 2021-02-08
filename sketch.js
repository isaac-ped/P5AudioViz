
CS_YELLOW=["#EFB70E", "#FFDA6C", "#F8CB42", "#BB8D05", "#926E00", "#EFDB0E", "#FFF26C", "#F8E842", "#BBAA05", "#928500", "#EF8F0E", "#FFC06C", "#F8AA42", "#BB6D05", "#925400"]
CS_BLUE=["#2500F3", "#C1BFD0", "#9287CC", "#120074", "#0C004E"]
CS_GREEN=["#63D40C", "#9CE762", "#81DC3A", "#4AA504", "#388200", "#09997D", "#4CB39F", "#2A9F88", "#037760", "#005E4B", "#D5EB0D", "#EDFB6A", "#E2F440", "#A6B704", "#829000"]
CS_PURPLE=["#7F2B6D", "#EFD1E8", "#B46CA5", "#480539", "#11000D"]
CS_RED=["#FF0000", "#EECECE", "#E29D9D", "#8C0000", "#500000"]
CS_RAINBOW=["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"]


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

  constructor(myWidth, duration, speed) {
    this.x = 0;
    this.myHeight = height * .8
    this.y = .1 * this.myHeight
    this.myWidth = (myWidth) ? myWidth : width / 10;
    duration = duration?duration: 10;
    this.speed = speed!= null ? speed : width/duration;
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

  isDone() {
    return (this.x > width)
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

let startTime = -1;
let started = false;

function setup(started=false) {
  mic = new p5.AudioIn();
  mic.start()

  createCanvas(windowWidth, windowHeight);
  background(0);

  if (!started) {
    timeWindow = new TimeWindow(width, 10, 0);
  } else {
    timeWindow = new TimeWindow();
  }
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
  if (startTime > Date.now()) {
    let left = (startTime - Date.now())/1000;
    textSize(50);
    background(0);
    fill(255,255,255,255)
    text(`Starting in ${int(left)+1}`, BORDER_SIZE, BORDER_SIZE);
    return;
  } else if (timeWindow == null) {
    setup(true);
  }
  let micLevel = mic.getLevel(.9);
  micLevel+=.01
  timeWindow.draw(micLevel*20)
  timeWindow.update()

  if (timeWindow.isDone()) {
    save("FINAL_PIC.png")
    textSize(50);
    fill(255, 255, 255, 255);
    text(`Saved!`, BORDER_SIZE, BORDER_SIZE);
    noLoop()
  }
}

function mousePressed() {
  getAudioContext().resume()
  if (startTime == -1 ) {
    setup()
  }
  if (!isLooping()) {
    startTime == -1;
    setup();
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
      startTime = Date.now() + 3000;
      timeWindow = null;
  }
}