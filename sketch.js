
// reference: https://codepen.io/sixhat/pen/VrJVGW
var mic = null;
var fft = null;
var fft2 = null;
var hu;
var freqs = [];
var i;
var baseline_fft = null;

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
    // debug(this.rotation);
  }

  draw(volume) {
    push()
    debug("rot", this.rotation);
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
  let maxVal=0;
  for (let i=1.01; i < 100; i++) {
    maxVal=log(i);
    freqs.push(maxVal);
  }
  freqs = freqs.map(x => (int(((maxVal-x) / maxVal)*6000))).reverse();
  freqs = freqs.map((x, i) => [freqs[i], freqs[i+1]]).slice(1, -1)
  console.log(freqs)
  mic = new p5.AudioIn();
  mic.start()
  fft = new p5.FFT(.5);
  fft.setInput(mic);
  fft2 = new p5.FFT(.99);
  fft2.setInput(mic);

  createCanvas(windowWidth, windowHeight);
  background(0);

  //have start() before getLevel() 
  // mic.start();
  colorMode(HSB, 1);
  // for(let i = 0; i<nBalls; i++){
  // }

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
  if (mic == null) {
    return;
  }
  fraw = fft.analyze();
  fraw2 = fft2.analyze();
  // fft.getEnergy(100)
  let bands = freqs.map(s => fft.getEnergy(s[0], s[1]));
  let bands2 = freqs.map(s => fft2.getEnergy(s[0], s[1]));
  debug("freqs", freqs, bands
  );
  // log(usedO/ctBands);
  let specSum=0;
  let specWeight = 0;
  // debug("ob33123", usedOctBands, octBands.length, );
  // let bands = fft.linAverages(1000)//.slice(0,100);
  // bands = bands.slice(0, bands.length / 5)

  for (let i=1; i < bands.length; i++) {
    specSum += i * (bands[i] - bands2[i]);
    specWeight+=(bands[i] - bands2[i]);
    stroke(1);
    if (bands[i] > 1) {

      // point(wPct(i, bands.length), hPct(bands[i] - bands2[i], 255));
      // debug(`fb`, baseline_fft ,wPct(i, bands.length), hPct(bands[i] - baseline_fft[i], 255));
    }
    // debug(wPct
  }
  let specVal = (specSum / specWeight) / bands.length;
  // debug("SB", specVal);
  // debug("SBBBB", specSum, specWeight, specVal)
  // debug("specSum", specVal);
  // ellipse(10, wPct(specVal, 1), 40)

  // let freqVal = (specSum/specWeight)/sl;
  // debug("fv", specVal);

  // console.log(freqVal);

  // console.log(mic, mic.enabled)
  background(0, .1);
  micLevel = mic.getLevel(1.1);
  micLevel += .01
  for(let i = 0; i<nBalls; i++){
    fill(specVal, 255, 255);
    balls[i].draw(micLevel*100);
    balls[i].update();
  }
  // for (var x=0; x < width; x+=5) {
  //   var noiseVal = noise((micLevel+x)*200, micLevel*300);
  //   stroke(noiseVal*200);
  //   //line(x, height, x, micLevel*100+noiseVal*1800);
  // }
}

function mousePressed(){
  getAudioContext().resume()
}