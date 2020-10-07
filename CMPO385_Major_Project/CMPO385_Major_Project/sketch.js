var distortion = 0.05;
var buttons = [];

var filename1 = 'sounds/bird_squack.wav';
var filename2 = 'sounds/bird_tururu.wav';
var filename3 = 'sounds/bird_wawak.wav';
var filename4 = 'sounds/bowl.wav';
var filename5 = 'sounds/cicada.wav';
var sounds = [];
var soundTypes = [];

var circleVerMain = []; // position/size of points within shape
var circleVerLight1 = [];
var circleVerLight2 = [];
var circleVerLight3 = [];

var circleVerMainVel = []; // velocity of points
var circleVerLight1Vel = [];
var circleVerLight2Vel = [];
var circleVerLight3Vel = [];

var lightCol1; // colour of ring of lights
var lightCol2;
var lightCol3;

var points = 256; // no. of vertices for center circle
var lightPoints = 16; // no. for light circles || too many makes the program too slow :^(
var c_size = 180; // middle circle size
var upperlimit = 300;
var lowerlimit = 180; // light radius limit
var circleX; // center
var circleY; 
var wfsize = 30; // waveform size

var numAround = 8; // number of buttons in a layer
var layers = 2; // number of layers of buttons
var centreRad = 40; // radius for centre clickable circle
var bands = 10; // bands of light

var fft;
var bgosc; // background osc
var disosc;

function preload(){
  soundFormats('wav');
  sounds.push(loadSound(filename1));
  sounds.push(loadSound(filename2));
  sounds.push(loadSound(filename3));
  sounds.push(loadSound(filename4));
  sounds.push(loadSound(filename5));
}

function setup() {
  // lightPoints = int(points/3);
  // put setup code here
  createCanvas(1280,720);
  soundTypes = ['sine', 'sawtooth', 'triangle', 'square'];
  angleMode(DEGREES);
  circleX = width/2;
  circleY = height/2;
  buttonsSetUp();

  lightCol1 = color(255,141,1);
  lightCol2 = color(255,190,20);
  lightCol3 = color(255,240,168);
  for(let i = 0; i < points; i++){
    circleVerMain.push(c_size); // array of dist away from center
    circleVerMainVel.push(0);
  }

  for(let i = 0; i < lightPoints; i++){ // initialise
    // circleVerLight1.push(c_size*1.5);
    // circleVerLight2.push(c_size*1.3);
    // circleVerLight3.push(c_size*1.4);
    circleVerLight1.push(random(lowerlimit,upperlimit));
    circleVerLight2.push(random(lowerlimit,upperlimit));
    circleVerLight3.push(random(lowerlimit,upperlimit));

    circleVerLight1Vel.push(random(-0.05,0.05));
    circleVerLight2Vel.push(random(-0.05,0.05));
    circleVerLight3Vel.push(random(-0.05,0.05));
  }

  fft = new p5.FFT(1,points);
  fft.smooth();

  bgosc = new p5.Oscillator();
  bgosc.setType('sine');
  bgosc.amp(0.05,0.1);
  bgosc.freq(midiToFreq(58));
  bgosc.start();
}




function draw() {
  let wf = fft.waveform();
  var wavespeed = 0.001 + distortion/10;
  // put drawing code here
  background(15,15,36);

  drawCircleLayers(circleVerLight1,circleVerMain, lightCol1, wf, 0);
  drawCircleLayers(circleVerLight2,circleVerMain, lightCol2, wf, 1);
  drawCircleLayers(circleVerLight3,circleVerMain, lightCol3, wf, 2);
  drawCircle(circleVerMain);

  for(let i = 0; i < lightPoints; i++){
    if(circleVerLight1[i] >= upperlimit){
      circleVerLight1Vel[i] -= 0.05;
    }
    else if(circleVerLight1[i] <= lowerlimit){
      circleVerLight1Vel[i] += 0.05;
    }
    else{
      let pos = map(circleVerLight1[i], lowerlimit,upperlimit, 1, -1); 
      // slows down if closer to edge
      circleVerLight1Vel[i] += random(0,pos) * wavespeed;
    }
    if(circleVerLight2[i] >= upperlimit){
      circleVerLight2Vel[i] -= 0.05;
    }
    else if(circleVerLight2[i] <= lowerlimit){
      circleVerLight2Vel[i] += 0.05;
    }
    else{
      let pos = map(circleVerLight2[i], lowerlimit,upperlimit, 1, -1);
      circleVerLight2Vel[i] += random(0,pos) * wavespeed;
    }
    if(circleVerLight3[i] >= upperlimit){
      circleVerLight3Vel[i] -= 0.05;
    }
    else if(circleVerLight3[i] <= lowerlimit){
      circleVerLight3Vel[i] += 0.05;
    }
    else{
      let pos = map(circleVerLight3[i], lowerlimit,upperlimit, 1, -1);
      circleVerLight3Vel[i] += random(0,pos) * wavespeed;
    }
   circleVerLight1[i] += circleVerLight1Vel[i];
   circleVerLight2[i] += circleVerLight2Vel[i];
   circleVerLight3[i] += circleVerLight3Vel[i];

  }
  for(let i = 0; i < points; i++){
    circleVerMain[i] = c_size + wf[i] * wfsize;
  }



  for(let i = 0; i < buttons.length; i++){
    buttons[i].draw();
    if(buttons[i].pressed){
      buttons[i].effects();
    }
    
  }

}




function mousePressed(){
  var index = 0; // index of button within buttons
  var angle = (atan2(mouseY - circleY, mouseX - circleX) + 90 + 360)%360;
  // angle of center to mouse
  print(angle);
  if(dist(mouseX, mouseY, circleX,circleY) <= centreRad){ // if click middle button
    index = buttons.length - 1; // do smth with index
    print(index);
    buttons[index].clicked();
    return;
  }
  index = angle - (angle%(360/numAround)); // should give first aStart
  index /= (360/numAround);

  if(dist(mouseX, mouseY, circleX,circleY) <= (c_size - centreRad)/2 +centreRad){
    
  }
  else if(dist(mouseX, mouseY, circleX,circleY) <= c_size){
    index += numAround;
  }
  else{
    index = -1;
  }
  print(index);
  if(index != -1){
    buttons[index].clicked();
  }
}



function drawCircleLayers(size, ogsize, col, wf, layer){ // bands of light
  // ogsize - original white circle vertices
  let a = 360/lightPoints;
  let ver = [];
  let ogver = [];
  for(let i = 0; i < lightPoints; i++){ // create coordinates from radius size
    ogver.push(createVector(ogsize[i*16] * sin(a*i) + circleX + random(0,distortion),
                         ogsize[i*16] * cos(a*i) + circleY + random(0,distortion)));
    // ver.push(createVector((size[i] + wf[i*3 + layer]*wfsize*(distortion/2 + 0.5)) * sin(a*i) + circleX + random(0,distortion),
                        //  (size[i] + wf[i*3 + layer]*wfsize*(distortion/2 + 0.5)) * cos(a*i) + circleY + random(0,distortion)));
    ver.push(createVector((size[i] + wf[i*16 + layer]*wfsize*2.6) * sin(a*i) + circleX + random(0,distortion),
                         (size[i] + wf[i*16 + layer]*wfsize*2.6) * cos(a*i) + circleY + random(0,distortion)));
  }

    for(let j = 1; j < bands; j++){
    // strokeWeight((bands-j)*10);
    let a = map(j,0,bands,90,180);
    noStroke();
    fill(red(col), green(col), blue(col), 100 - j*10);
    push();
    blendMode(ADD);
    beginShape();
      translate(circleX,circleY);
      rotate(frameCount/5);
      translate(-circleX,-circleY);
      // x = map(j,0,bands, ogver[ver.length - 1].x, ver[ver.length - 1].x);
      // y = map(j,0,bands, ogver[ver.length - 1].y, ver[ver.length - 1].y);
      x = map(sin(a),1,0, ogver[ver.length - 1].x, ver[ver.length - 1].x);
      y = map(sin(a),1,0, ogver[ver.length - 1].y, ver[ver.length - 1].y);
      curveVertex(x,y);
      for(let i = 0; i < ver.length;i++){
        // x = map(j,0,bands, ogver[i].x, ver[i].x);
        // y = map(j,0,bands, ogver[i].y, ver[i].y);
        x = map(sin(a),1,0, ogver[i].x, ver[i].x);
        y = map(sin(a),1,0, ogver[i].y, ver[i].y);
        curveVertex(x,y);
      }
      // x = map(j,0,bands, ogver[0].x, ver[0].x);
      // y = map(j,0,bands, ogver[0].y, ver[0].y);
      x = map(sin(a),1,0, ogver[0].x, ver[0].x);
      y = map(sin(a),1,0, ogver[0].y, ver[0].y);
      curveVertex(x, y);
      // x = map(j,0,bands, ogver[1].x, ver[1].x);
      // y = map(j,0,bands, ogver[1].y, ver[1].y);
      x = map(sin(a),1,0, ogver[1].x, ver[1].x);
      y = map(sin(a),1,0, ogver[1].y, ver[1].y);
      curveVertex(x, y);
    endShape();

  pop();
  }

}


function drawCircle(size){  // draw center circle
  // size - array of dist away from center
  let a = 360/points;
  let ver = [];
  for(let i = 0; i < points; i++){
    ver.push(createVector(size[i] * sin(a*i) + circleX + random(0,distortion),
                         size[i] * cos(a*i) + circleY + random(0,distortion)));
    // ver.push(createVector(c_size * sin(a*(i+0.5)) + circleX, c_size * cos(a*(i+0.5)) + circleY));

  }
  push();
    beginShape();
      translate(circleX,circleY);
      rotate(frameCount/5);
      translate(-circleX,-circleY);

      fill(255);
      // strokeWeight(5);
      // stroke(15,15,36);

      curveVertex(ver[ver.length - 1].x, ver[ver.length - 1].y);
      for(let i = 0; i < ver.length;i++){
        curveVertex(ver[i].x, ver[i].y);
      }
      curveVertex(ver[0].x, ver[0].y);
      curveVertex(ver[1].x, ver[1].y);
    endShape();

  pop();
}


function buttonsSetUp(){ // initialise buttons
  for(var j = 0; j < layers; j++){
    for(var i = numAround-1; i >= 0; i--){
      let isosc = false;
      if(random(0,1) < 0.8){
        isosc = true;
      }
      let b = new Button(360 * i/numAround+180, 360 * (i+1)/numAround+180, j+1, 1, isosc);
      b.init();
      buttons.push(b);
    }
  }
  let b = new Button(0,0,0,0,false);
  b.init();
  buttons.push(b);
}




class Button{
  pressed = false;
  playing = false;
  effectOn = false;
  osc;
  env;
  effect;
  notes = [42,44,46,49,51];
  sound;
  dis;
  del;

  constructor(aStart, aEnd, layer, s, type){ // a - angle
    this.aStart = aStart;
    this.aEnd = aEnd;
    this.layer = layer;
    this.size = s;
    this.isOsc = type;
  }

  init(){
    this.dis = new p5.Distortion(0,'none');
    this.del = new p5.Delay();
    
    if(this.isOsc){
      this.env = new p5.Env();
      this.env.setADSR(1, 0.1, 2, 2); // AR envelope
      this.env.setRange(1, 0); // attack | release
      this.env.setExp(); // exponential


      this.osc = new p5.Oscillator();
      // this.osc.setType('sine');
      this.osc.setType(soundTypes[int(random(0,soundTypes.length))]);
      this.osc.amp(this.env);
      let midinote = this.notes[int(random(0,5))] + int(random(-1,2)) * 12;
      this.osc.freq(midiToFreq(midinote)); // needed?
      this.osc.start();
      
      this.dis.process(this.osc, 0,0,10);
      this.del.process(this.osc, 0, 0, 10);
    }
    else{
      let index = int(random(0,sounds.length));
      this.sound = sounds[index];
      this.dis.process(this.sound, 0,0,10);
      this.del.process(this.sound, 0, 0, 10);
    }
  }

  draw(){
    if(distortion<0.1){
      this.dis.set( distortion/1.01, 'none');
      
    }
    else{
      this.dis.set( distortion/1.01, '2x');
    }
   // this.del.feedback(distortion/1.01);

    if(this.pressed && !mouseIsPressed){
      this.playing = false;
      this.pressed = false;
      if(this.isOsc){
        this.env.triggerRelease(this.osc);
      }
    }
  }

  clicked(){
    if(!this.pressed){
      this.pressed = true;
      this.playing = true;
      this.effectOn = true;

      if(this.isOsc){
        this.env.triggerAttack(this.osc);
        this.effects();
      }
      else{
        this.sound.play();
      }
    }
    else if(this.pressed){
      this.pressed = false;
      this.playing = false;
      this.effectOn = false;
      if(this.isOsc){
        this.env.triggerRelease(this.osc);
      }
      else{
        this.sound.stop();
      }
    }
  }

  effects(){ // draw button guide when pressed
    var midRad = (c_size - centreRad)/2 +centreRad;
    if(this.layer == 0){ // center
      noFill();
      strokeWeight(5);
      stroke(lightCol3);
      ellipse(circleX,circleY,centreRad*2);
    }
    else if (this.layer == 1){
      var a1 = createVector(midRad * sin(this.aStart)+circleX, midRad* cos(this.aStart)+circleY);
      var a2 = createVector(midRad * sin(this.aEnd)+circleX, midRad* cos(this.aEnd)+circleY);
      var a3 = createVector(centreRad * sin(this.aEnd)+circleX, centreRad* cos(this.aEnd)+circleY);
      var a4 = createVector(centreRad * sin(this.aStart)+circleX, centreRad* cos(this.aStart)+circleY);
      // fill(255,0,0);
      noFill();
      strokeWeight(5);
      stroke(lightCol3);
      quad(a1.x,a1.y,a2.x,a2.y,a3.x,a3.y,a4.x,a4.y);
    }
    else {
      var a1 = createVector(midRad * sin(this.aStart)+circleX, midRad* cos(this.aStart)+circleY);
      var a2 = createVector(midRad * sin(this.aEnd)+circleX, midRad* cos(this.aEnd)+circleY);
      var a3 = createVector(c_size * sin(this.aEnd)+circleX, c_size* cos(this.aEnd)+circleY);
      var a4 = createVector(c_size * sin(this.aStart)+circleX, c_size* cos(this.aStart)+circleY);
      noFill();
      strokeWeight(5);
      stroke(lightCol3);
      quad(a1.x,a1.y,a2.x,a2.y,a3.x,a3.y,a4.x,a4.y);
    }
  }
}