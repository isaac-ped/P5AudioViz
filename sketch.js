CS_YELLOW=["#EFB70E", "#FFDA6C", "#F8CB42", "#BB8D05", "#926E00", "#EFDB0E", "#FFF26C", "#F8E842", "#BBAA05", "#928500", "#EF8F0E", "#FFC06C", "#F8AA42", "#BB6D05", "#925400"]
CS_BLUE=["#2500F3", "#C1BFD0", "#9287CC", "#120074", "#0C004E"]
CS_GREEN=["#63D40C", "#9CE762", "#81DC3A", "#4AA504", "#388200", "#09997D", "#4CB39F", "#2A9F88", "#037760", "#005E4B", "#D5EB0D", "#EDFB6A", "#E2F440", "#A6B704", "#829000"]
CS_PURPLE=["#7F2B6D", "#EFD1E8", "#B46CA5", "#480539", "#11000D"]
CS_RED=["#FF0000", "#EECECE", "#E29D9D", "#8C0000", "#500000"]
CS_RAINBOW=["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"]
CS_GRAYSCALE=["#040404", "#777777"]

/** LIKELY TWEAKABLE CONSTANTS **/
const DEFAULT_FILENAME="digitalArt.png"

var COLORS=CS_GREEN;
var FILL_ALPHA=.1;
// NOTE: `SoundLine` uses the FILL_ALPHA (even though it is only a stroke)
var STROKE_ALPHA=.1;
// All shapes in this list will be used
// (make sure this is a list, even if it only has one item)
var SHAPES=[
  "TRIANGLE", "LINE", "ELLIPSE"
]
var N_SHAPES = 10;


// A value which is always added to the volume of the mic
// (Moderately loud speaking volume _seems_ to be around .1)
var VOLUME_ADDITION=0;
// If the volume is below this value (after addition)
// nothing will be drawn
var VOLUME_CUTOFF=0;
// Volume is multiplied by this amount to determine shape size
// (up this for quieter noises)
var VOLUME_SCALE=50;

function rainbowLines() {
  COLORS=CS_RAINBOW
  SHAPES=["LINE"]
  N_SHAPES=50
  VOLUME_SCALE=100;
}

function redGhosts() {
  COLORS=CS_RED
  SHAPES=["ELLIPSE"]
  FILL_ALPHA=.01
  STROKE_ALPHA=.0001
}

function greenTriangleWires() {
  COLORS=CS_GREEN
  SHAPES=["TRIANGLE"]
  FILL_ALPHA=.001
  STROKE_ALPHA=.2
  N_SHAPES=3
}

function bigGrayMess() {
  COLORS=CS_GRAYSCALE
  SHAPES=["LINE", "ELLIPSE", "TRIANGLE"]
  FILL_ALPHA=.2
  STROKE_ALPHA=1
  N_SHAPES=50
}

bigGrayMess()


/** MAYBE TWEAKABLE CONSTANTS **/

// How long it takes the window to sweep across the screen
// in units of seconds
const DURATION=10;

// Speed of cycling between colors for an individual shape
// in units of 1/frames
const COLOR_TRANSITION_SPEED=.005 

// Bounds of randomly-chosen speed for each shape
// in units of pixels / frame
const MINSPEED=.2;
const MAXSPEED=3
// Bound of rotational speed for each shape
// in units of radians / frame
const ROTSPEED=.2;

// Width of the window (as a fraction of screen width)
const WINDOW_SIZE=.1;

const LINE_LENGTH=20;
const TRIANGLE_SIZE=20;
const ELLIPSE_SIZE=20;

/** UNLIKELY TWEAKABLE CONSTANTS **/
const BORDER_SIZE=100;


function vecSign(vec) {
  // Returns a vector where x = 1 if x > 0 and x = -1 if x < 0
  return createVector(
    (vec.x > 0) ? 1 : -1,
    (vec.y > 0) ? 1 : -1
  )
}


class SoundShape {

  constructor(maxLoc, color1, color2) {
    if (!color1) {
      this.color1 = color(random(COLORS));
    }
    if (!color2) {
      this.color2 = color(random(COLORS));
      while (this.color2 == this.color1) {
        this.color2 = color(random(COLORS));
      }
    }
    this.colorSpeed = COLOR_TRANSITION_SPEED;
    this.colorIdx = 0;
    this.maxLoc = maxLoc;

    this.loc = createVector(random(this.maxLoc.x), random(this.maxLoc.y));
    this.speed = createVector(random(MINSPEED, MAXSPEED), random(MINSPEED, MAXSPEED));
    this.rotSpeed = random(ROTSPEED);
    this.rotation = random(PI);
  }

  update() {
    let newLoc = p5.Vector.add(this.loc, this.speed);

    // if newLoc is out of bounds, invert the speed direction
    // which has crossed the boundary
    this.speed
      .mult(vecSign(newLoc))
      .mult(vecSign(p5.Vector.sub(this.maxLoc, newLoc)))
    this.loc.add(this.speed);
    this.rotation += this.rotSpeed;
    if (this.colorIdx + this.colorSpeed < 0 || this.colorIdx  + this.colorSpeed > 1) {
        this.colorSpeed *= -1
    }
    this.colorIdx += this.colorSpeed
  
  }

  setColors() {
    let fillColor = lerpColor(this.color1, this.color2, this.colorIdx);
    let lineColor = lerpColor(this.color2, this.color1, this.colorIdx);
    fillColor.setAlpha(FILL_ALPHA);
    fill(fillColor);
    lineColor.setAlpha(STROKE_ALPHA);
    stroke(lineColor);
  }

  draw(volume) {
    push()
    this.setColors()
    translate(this.loc.x, this.loc.y)
    rotate(this.rotation);
    scale(volume)
    strokeWeight(.5);
    this.makeShape();
    pop();
  }

}

class SoundEllipse extends SoundShape {
  makeShape() {
    ellipse(0, 0, ELLIPSE_SIZE);
  }
}

class SoundTriangle extends SoundShape {
  makeShape() {
    triangle(0, 0, TRIANGLE_SIZE, 0, 0, TRIANGLE_SIZE);
  }
}

class SoundLine extends SoundShape {

  setColors() {
    strokeWeight(.1);
    let lineColor = lerpColor(this.color2, this.color1, this.colorIdx);
    lineColor.setAlpha(max(FILL_ALPHA, STROKE_ALPHA))
    stroke(lineColor);
  }

  makeShape() {
    line(0, 0, 0, LINE_LENGTH);
  }
}

const ShapeOptions = {
  "TRIANGLE": SoundTriangle,
  "LINE": SoundLine,
  "ELLIPSE": SoundEllipse,
}

class TimeWindow {

  constructor(widthPct, noTranslation) {
    this.x = 0;
    this.myHeight = height * .8
    this.y = .1 * this.myHeight
    this.myWidth = width * (widthPct ? widthPct : .1)
    this.speed = noTranslation? 0 : width/DURATION;
    this.startTime = Date.now();

    let bound = createVector(this.myWidth, this.myHeight);
    this.shapes = [];
    for (let i=0; i < N_SHAPES; i++) {
        let ShapeCls = ShapeOptions[random(SHAPES)]
        this.shapes.push(new ShapeCls(bound));
    }
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

/** THESE ARE JUST GLOBALS. DO NOT TWEAK **/
// Microphone object used throughout
var mic;
// Object representing the sliding window
var timeWindow = null;
// Once set to a time in the future, will
// initiate an on-screen countdown
let startTime = -1;
// Sliding window starts moving when this
// is set to true
let started = false;

function reset(started=false) {
  /** Clears the screen and creates a new (potentially sliding) window */
  background(0);
  if (!started) {
    timeWindow = new TimeWindow(1, true);
  } else {
    timeWindow = new TimeWindow();
  }
}

function setup() {
  colorMode(RGB, 1);

  mic = new p5.AudioIn();
  mic.start()

  createCanvas(windowWidth, windowHeight);
  reset();
}

function draw() {
  if (startTime > Date.now()) {
    // Countdown initiated!
    let timeLeft = (startTime - Date.now())/1000;
    textSize(50);
    background(0);
    fill(1, 1)
    text(`Starting in ${int(timeLeft)+1}`, BORDER_SIZE, BORDER_SIZE);
    return;
  } else if (timeWindow == null) {
    // Once the countdown starts, the window is removed
    // If the coutdown is over and the window is gone,
    // it means it's time to start!
    reset(true);
  }

  // "1" is the smoothing
  // Doesn't seem to have a huge effect
  let micLevel = mic.getLevel(1);
  micLevel+=VOLUME_ADDITION;
  if (micLevel > VOLUME_CUTOFF) {
    timeWindow.draw(micLevel*VOLUME_SCALE)
  }
  timeWindow.update()

  if (timeWindow.isDone()) {
    saveCanvas(DEFAULT_FILENAME)
    textSize(50);
    fill(255, 255, 255, 255);
    text(`Saved!`, BORDER_SIZE, BORDER_SIZE);
    // Stop looping once saved
    // (can reset by pressing the mouse)
    noLoop()
  }
}

function mousePressed() {
  // This is annoying, and may only happen when running locally?
  // If you haven't interacted with the screen, it won't allow recording
  // Once you click, this will resume if it's been stopped
  getAudioContext().resume()
  if (startTime == -1 ) {
    reset()
  }
  if (!isLooping()) {
    startTime = -1;
    reset();
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
      startTime = Date.now() + 3000;
      // Setting this to null signals that when the timer runs out
      // the canvas should be recreated
      timeWindow = null;
  }
}