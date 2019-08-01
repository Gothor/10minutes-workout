const activityDuration = 60000;
const pauseDuration = 5000;
let pompes;
let muscu;
let cardio;
let rope;
let pause;
let activities;
let order;
let current;
let t, d;
let started;
let nextBip;
let logo;
let shade;
let music;
let timeSize;
let clickToStartSize;
let logoW;
let logoH;
const clickToStart = "Cliquez pour commencer l'entraînement";

let activityWidth;

function computeAllSizes() {
  activityWidth = Math.min(width / 2, height / 2, 500);

  clickToStartSize = 32;
  textSize(clickToStartSize);
  while(textWidth(clickToStart) > width - 20) {
    clickToStartSize--;
    textSize(clickToStartSize);
  }

  timeSize = Math.min(64, (height - activityWidth) / 2 - 20 - 20);

  logoW = logo.width / width;
  logoH = logo.height / (height - (clickToStartSize + 40) * 2);
  if (logoW >= logoH) {
    logoW = Math.min(logo.width, width);
    logoH = logoW * logo.height / logo.width;
  } else {
    logoH = Math.min(logo.height, height - (clickToStartSize + 40) * 2);
    logoW = logoH * logo.width / logo.height;
  }
}

class Activity {

  constructor(name, duration, sound, image) {
    this.name = name;
    this.duration = duration;
    this.sound = sound;
    this.image = image;
    this.startedTime = Infinity;
    this.progress = 0;
    this.w = this.name === "Pause" ? 0.4 : 1;
    this.h = 1;
  }

  start() {
    this.startedTime = Date.now();
    if (this.sound) {
      music.setVolume(0.5);
      this.sound.play();
    }
  }

  update(t) {
    if (!this.sound.isPlaying()) {
      music.setVolume(1);
    }
    this.progress = (t - this.startedTime) / this.duration;
    this.progress = Math.min(this.progress, 1);
  }

  draw() {
    let w = this.w * activityWidth;
    let h = this.h * activityWidth;
    let borderWidth = activityWidth / 50;

    noStroke();
    fill(255, 150);
    rect(-w / 2, -h / 2, w, h);
    fill(227, 111, 0);
    rect(-w / 2, -h / 2, w * this.progress, h);

    textSize(28);
    fill(0);
    if (this.image) {
      image(this.image, -w / 2, -h / 2, w, h);
    } else {
      text(this.name.split(' ').join('\n'), 0, 0);
    }
    
    noFill();
    stroke(255);
    strokeWeight(borderWidth);
    rect(-w / 2 - borderWidth / 2, -h / 2 - borderWidth / 2, w + borderWidth, h + borderWidth, borderWidth * 2);
  }

  isDone() {
    return this.progress === 1;
  }

  clone() {
    return new Activity(this.name, this.duration, this.sound, this.image);
  }

  remaining() {
    return ((this.duration - Date.now() + this.startedTime) / 1000).toFixed(2);
  }

}

Array.prototype.shuffle = function() {
  for (let i = 0; i < this.length; i++) {
    let j = Math.floor(Math.random() * this.length);
    let tmp = this[j];
    this[j] = this[i];
    this[i] = tmp;
  }
}

Array.prototype.alternateWith = function(item) {
  for (let i = this.length - 1; i > 0; i--) {
    this.splice(i, 0, item.clone());
  }
}

Array.prototype.pickRandom = function() {
  return this.splice(Math.floor(Math.random() * this.length), 1)[0];
}

function preload() {
  sounds = {};
  
  pompes = [
    new Activity("Pompes biceps", activityDuration, loadSound("pompesbiceps.wav"), null),
    new Activity("Pompes triceps", activityDuration, loadSound("pompestriceps.wav"), null),
  ];
  muscu = [
    new Activity("Abdos", activityDuration, loadSound("abdos.wav"), loadImage("abdos.png")),
    new Activity("Squats", activityDuration, loadSound("squats.wav"), loadImage("squats.png")),
  ];
  cardio = [
    new Activity("Montées de genoux", activityDuration, loadSound("monteesdegenoux.wav"), null),
    new Activity("Jumping jacks", activityDuration, loadSound("jumpingjacks.wav"), null),
    new Activity("Talons-fesses", activityDuration, loadSound("talonsfesses.wav"), loadImage("talonsfesses.png")),
  ];
  rope = new Activity("Corde à sauter", activityDuration, loadSound("cordeasauter.wav"), null);
  pause = new Activity("Pause", pauseDuration, loadSound("pause.wav"), loadImage("pause.png"));

  logo = loadImage("logo.png");
  shade = loadImage("shade.png");
  music = loadSound("Funky_Disco.mp3");
}

function setup() {
  createCanvas(innerWidth, innerHeight);

  let p = [...pompes];
  let m = [...muscu];
  let c = [...cardio];

  order = [];
  order.push(p.pickRandom()); // Pompes
  order.push(c.pickRandom()); // Cardio
  order.push(m.pickRandom()); // Muscu
  order.push(c.pickRandom()); // Cardio
  order.push(m.pickRandom()); // Muscu
  order.push(c.pickRandom()); // Cardio
  order.push(p.pickRandom()); // Pompes
  order.push(rope); // Corde à sauter
  order.alternateWith(pause);

  current = 0;
  started = false;

  computeAllSizes();

  music.play();
}

function mousePressed() {
  if (started) return;

  started = true;
  nextBip = order[current].duration - 3;
  order[current].start();
}

function idle() {
  let activity = order[current];
  t = Date.now();

  activity.update(t);
  if (current < order.length && activity.isDone()) {
    last = activity;
    activity = order[++current];
    if (activity) {
      offsetX = (last.w + activity.w) * activityWidth / 2 + 32 + 10;
      offsetXQueue -= offsetX;
      activity.start();
    }
  }
  
  if (d > nextBip) {
    nextBip++;
  }

  if (!music.isPlaying()) {
    music.play();
  }
}

let offsetX = 0;
let logoTilt = 0;
let points;
let offsetXQueue = 0;
let theTime = Infinity;

function draw() {
  if (theTime === Infinity)
    theTime = Date.now();
  
  /*
  if (width < height) {
    translate(width / 2, height / 2);
    rotate(HALF_PI);
    translate(-width / 2, -height / 2);
  }
  */

  idle();

  background(1, 177, 226);
    
  push();
  translate(width / 2, height / 2);
  rotate(-PI / 6);
  stroke(255, 100);
  strokeWeight(32);
  let diag = Math.sqrt(width * width + height * height);
  for (let y = 0; y < diag / 100; y++) {
    for (let x = -diag / 2; x < diag / 2; x += 100) {
      point(x + (y % 2 === 0 ? 1 : -1) * 0.2 * frameCount % 100, y * 100 - diag / 2);
    }
  }
  pop();

  if (started) {
    offsetX *= 0.7;

    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    push();
    translate(width / 2 + offsetXQueue + offsetX, height / 2);
    let x = 0;
    for (let i = 0; i < order.length; i++) {
      let activity = order[i];
      push();
      translate(x, 0);
      activity.draw();
      pop();
      if (i + 1 < order.length) {
        x += (order[i].w + order[i + 1].w) * activityWidth / 2 + 32 + 10;
      }
    }
    pop();

    image(shade, 0, 0, width, height);

    textSize(timeSize);
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    if (current < order.length) {
      text(order[current].remaining(), width / 2, height / 2 - order[0].h * activityWidth / 2 - 20);
    } else if (Math.floor(d * 2) % 2) {
      text((0).toFixed(2), width / 2, height / 5);
    }
  } else {
    image(shade, 0, 0, width, height);

    logoTilt = -Math.cos(frameCount / 300 * PI) / 30 - 0.1;
    
    let theScale = (Date.now() - theTime) % 500;
    theScale -= 450;
    theScale = Math.abs(theScale);
    if (theScale > 100) theScale = 1;
    else theScale = 1.1 - theScale / 100 * 0.1;

    push();
    translate(width / 2, height / 2);
    rotate(logoTilt);
    scale(theScale, theScale);
    image(logo, -logoW / 2, -logoH / 2, logoW, logoH);
    pop();

    textAlign(CENTER, BOTTOM);
    textSize(clickToStartSize);
    fill(255);
    text(clickToStart, width / 2, height - 20);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeAllSizes();
}