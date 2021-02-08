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

const MINSPEED=1;
const MAXSPEED=3;

let LOGGEDTIMES={};

function debug(l, ...data) {
  if (!LOGGEDTIMES[l]) {
    LOGGEDTIMES[l] = 0;
  }
  if (LOGGEDTIMES[l] < 10) {
    console.log(l, LOGGEDTIMES[l], ...data)
    LOGGEDTIMES[l]+=1;
  }
}

class SoundShape{

  constructor(loc=null, speed=null, rotspeed) {
    if (loc == null) {
      loc = randomVector(random(width), random(height));
    }
    this.loc = loc
    this.maxLoc = createVector(width, height);
    if (speed == null) {
      speed = randomVector(MINSPEED, MAXSPEED)
    }
    if (!rotspeed) {
      rotspeed = random(.01);
    }
    this.speed = speed;
    this.rotspeed = rotspeed;
    this.rotation=random(PI);
  }

  update() {
    let newLoc = this.loc.add(this.speed);
    this.speed
      .mult(vecSign(newLoc))
      .mult(vecSign(p5.Vector.sub(this.maxLoc, newLoc)))
    this.loc.add(this.speed);
    this.rotation+=this.rotspeed;
  }

  draw(volume) {
    push()
    translate(this.loc.x, this.loc.y)
    rotate(this.rotation);
    scale(volume)
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

let nBalls = 10;
let balls=[];

function setup(){
  mic = new p5.AudioIn();
  mic.start()

  createCanvas(windowWidth, windowHeight);
  background(0);

  colorMode(HSB, 1);

  for(let i = 0; i<nBalls; i++){
    balls.push(new SoundTriangle());
    balls.push(new SoundElipse());
  }
}

function hPct(i, l) {
  return height * (1-(log(i) / log(l)));
}

function wPct(i, l) {
  return width * (i / l);
}

function draw(){
  background(0, .1);
  micLevel = mic.getLevel(1.1);
  micLevel += .01
  for(let i = 0; i<nBalls; i++){
    fill(i, 255, 255);
    balls[i].draw(micLevel*100);
    balls[i].update();
  }
}

function mousePressed(){
  getAudioContext().resume()
}