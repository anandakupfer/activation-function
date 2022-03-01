let c, c_copy, f;
let bass;
let counter = 0;
let env, reverb, osc;

let bpm = 300;

let size = [120, 120];

let noise_scale = 10;

let value_1 = 3;

let speed = 10;

let density = 0;


function setup() {
  createCanvas(490, 490);
  fill(217, 82, 98);
  rect(0, 0, 490, 490);
  
  frameRate(12);

  c = createImage(size[0], size[1]);
  f = createImage(size[0], size[1]);
  bass = new p5.SinOsc([329.63]);
  bass.start();
  bass.amp(0);
  
  c.loadPixels();
  c_copy = c.pixels;
  
  let n = c.width * c.height * 4;
  for (let x = 0; x < c.width; x++) {
    for (let y = 0; y < c.height; y++) {
      let i = index(x, y);
      let r_init = random();//noise(x / noise_scale, y / noise_scale);
      c_copy[i] = 255 * r_init;
      c_copy[i + 1] = 255 * r_init;
      c_copy[i + 2] = 255 * r_init;
      c_copy[i + 3] = 255;
    }
  }
  c.pixels = c_copy;
  c_carry = c.pixels;
  c.updatePixels();
  
  f.loadPixels();
  for (let x = 0; x < f.width; x++) {
    for (let y = 0; y < f.height; y++) {
      f.set(x, y, color(0, 0, 0));
    }
  }
  f.updatePixels();
  
  setInterval(evolve, 2000);
  setInterval(set_bass, 0.2);
  
    setInterval(beat, 60000/bpm);
  setInterval(offbeat, 40000/bpm);
  
  env = new p5.Envelope();
  osc = new p5.SinOsc(440);
  
  env2 = new p5.Envelope();
  osc2 = new p5.SinOsc(659.25);
  
  osc.start();
  osc.amp(0);
  osc.pan(-0.1);
  
  osc2.start();
  osc2.amp(0);
  osc2.pan(0.1);
  
  reverb = new p5.Reverb();
  
  env.setADSR(0.02, 0.1, 0);
  env2.setADSR(0.02, 0.1, 0);
  
  osc.disconnect();
  osc2.disconnect();
  
  reverb.process(osc, 3, 2);
  reverb.process(osc2, 2, 3);
  reverb.drywet(1);
  reverb.amp(0.3);
  beat();

}

function draw() {
  
  c.loadPixels();
  
  c_copy = c.pixels;
  
  for (let x = 0; x < c.width; x++) {
    for (let y = 0; y < c.height; y++) {
      let i = index(x, y);
      let a = list(x, y);
      let v = (a[0] + a[1] + a[2] + a[3] + a[4] + a[5] + a[6] + a[7]) / 8;
      v = ((cos(PI * (v / 255)) - 1) * -127);
      c_copy[i] = v;
      c_copy[i + 1] = v;
      c_copy[i + 2] = v;
    }
  }
  
  for (let x = 0; x < c.width; x++) {
    for (let y = 0; y < c.height; y++) {
      let i = index(x, y);
      let a = list(x, y);
      let v = (a[0] + a[1] + a[2] + a[3] + a[4] + a[5] + a[6] + a[7]) / 8;
      v = ((cos(PI * (v / 255)) - 1) * -127);
      let y_neg = (a[0] + a[1] + a[2]) / 255;
      let x_neg = (a[6] + a[7] + a[0]) / 255;
      let y_pos = (a[4] + a[5] + a[6]) / 255;
      let x_pos = (a[2] + a[3] + a[4]) / 255;
      
      if (y_neg == Math.max(y_neg, y_pos, x_neg, x_pos)) {
        let r = clamp(255 - 255 * (y_pos / value_1));
        let v_2 = clamp(c_copy[index(x, y - 1)]);
        c_copy[index(x, y - 1)] = (r + v_2) / 2;
        c_copy[index(x, y - 1) + 1] = (r + v_2) / 2;
        c_copy[index(x, y - 1) + 2] = (r + v_2) / 2;
      } else if (x_neg == Math.max(y_neg, y_pos, x_neg, x_pos)) {
        let r = clamp(255 - 255 * (x_pos / value_1));
        let v_2 = clamp(c_copy[index(x - 1, y)]);
        c_copy[index(x - 1, y)] = (r + v_2) / 2;
        c_copy[index(x - 1, y) + 1] = (r + v_2) / 2;
        c_copy[index(x - 1, y) + 2] = (r + v_2) / 2;
      } else if (y_pos == Math.max(y_neg, y_pos, x_neg, x_pos)) {
        let r = clamp(255 - 255 * (y_neg / value_1));
        let v_2 = clamp(c_copy[index(x, y + 1)]);
        c_copy[index(x, y + 1)] = (r + v_2) / 2;
        c_copy[index(x, y + 1) + 1] = (r + v_2) / 2;
        c_copy[index(x, y + 1) + 2] = (r + v_2) / 2;
      } else if (x_pos == Math.max(y_neg, y_pos, x_neg, x_pos)) {
        let r = clamp(255 - 255 * (x_neg / value_1));
        let v_2 = clamp(c_copy[index(x + 1, y)]);
        c_copy[index(x + 1, y)] = (r + v_2) / 2;
        c_copy[index(x + 1, y) + 1] = (r + v_2) / 2;
        c_copy[index(x + 1, y) + 2] = (r + v_2) / 2;
     }
   }   
 }
  c.pixels = c_copy;
  c.updatePixels();
  
  f.loadPixels();
  
  density = 0;
  
  for (let x = 0; x < f.width; x++) {
    for (let y = 0; y < f.height; y++) {
      let i = index(x, y);
      
      let value = ease(c.pixels[i]) * 1.3;
      
      density += (c.pixels[i] < 50 ? 1 : 0);
      
      f.pixels[i] = lerp(54, 209, value);
      f.pixels[i + 1] = lerp(40, 218, value * value / 2 + value / 2);
      f.pixels[i + 2] = lerp(7, 255, -(cos(PI * value) - 1) / 2);
    }
  }
  
  f.updatePixels();
  
  image(f, 5, 5, 480, 480);
}

function index(x, y) {
  x = x % c.width;
  y = y % c.height;
  if (x < 0) {
    x += c.width;
  }
  if (y < 0) {
    y += c.height;
  }
  return 4 * (c.width * y + x);
}

function list(x, y) {
  return([c_copy[index(x - 1, y - 1)], c_copy[index(x, y - 1)], c_copy[index(x + 1, y - 1)], c_copy[index(x + 1, y)],  c_copy[index(x + 1, y + 1)], c_copy[index(x, y + 1)], c_copy[index(x - 1, y + 1)], c_copy[index(x - 1, y)]]);
}

function ease(x) {
  x = x / 255;
  return sin((x * PI) / 2);
}

function evolve() {
  value_1 = 3 + random(0.1)- 0.06
}

function clamp(num) {
  return num <= 0 ? 0 : num >= 255 ? 255 : num;
}

function set_bass() {
  bass.amp(density / 25000, 0.2);
}

function beat() {
  counter++;
  if (random() < density / 2500 - 0.05) {
    
    env.play(osc);
  }
}

function offbeat() {
  counter++;
  if (random() < (density / 2500) - 0.1) {
    
    env2.play(osc2);
  }
}
