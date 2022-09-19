const overlayAlpha = 0.75;
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const gradient = context.createRadialGradient(275, 203, 0, 275, 203, 275);
gradient.addColorStop(0, "rgba(68,68,68,0)");
gradient.addColorStop(1, `rgba(68,68,68,${overlayAlpha})`);

const input = document.querySelector("input");

let frameId,
frameRate = 25,
frameTime = 1000 / 25,
currentTime = Date.now(),
startTime = Date.now(),
last,
frames,
currentFrame = 0;

const rows = 4;
const cols = 4;
const totalFrames = rows * cols;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    function handler(e) {
      const image = e.target;
      image.removeEventListener("load", handler);
      image.removeEventListener("error", handler);
      image.removeEventListener("abort", handler);
      if (e.type === "load") {
        resolve(image);
      } else {
        reject();
      }
    }
    const image = new Image();
    image.addEventListener("load", handler);
    image.addEventListener("error", handler);
    image.addEventListener("abort", handler);
    image.src = src;
  });
}

function drawFrame(dx, dy, currentFrame, overlay) {
  const x = currentFrame % cols;
  const y = Math.floor(currentFrame / cols) % rows;
  const sw = 183;
  const sh = 135;
  const sx = x * sw;
  const sy = y * sh;
  const dw = canvas.height * (183 / 135);
  const dh = canvas.height;
  context.drawImage(frames, sx, sy, sw, sh, dx, dy, dw, dh);
  if (overlay) {
    context.fillStyle = `rgba(68,68,68,${overlayAlpha})`;
  } else {
    context.fillStyle = gradient;
  }
  context.fillRect(dx, dy, dw, dh);
}

function drawFrames() {
  const previousFrame = currentFrame - 1 < 0 ? totalFrames : currentFrame - 1;
  const nextFrame = currentFrame + 1 % totalFrames;
  context.save();
  context.translate((Math.round(canvas.width) - 183 * 3) * 0.5, 0);
  drawFrame(-183 * 3, 0, previousFrame, true);
  drawFrame(0, 0, currentFrame);
  drawFrame(183 * 3, 0, nextFrame, true);
  context.restore();
}

function drawText() {
  context.shadowColor = "#000";
  context.shadowBlur = 32;
  context.font = "300 12px 'Open Sans', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "bottom";
  context.fillStyle = "rgba(255,255,255,0.8)";
  context.fillText(getFrameRateText(), 90, canvas.height - 20);
  context.font = "300 124px 'Open Sans', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "bottom";
  context.fillText(input.value, 90, canvas.height - 20);
  context.shadowColor = "#000";
  context.shadowBlur = 0;
}

function getFrameRateText() {
  return input.value == 1 ? "Speed anime on second" : "Speed setting for your like";
}

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawFrames();
  drawText();
}

function resize() {
  canvas.width = canvas.parentElement.clientWidth;
}

function update(delta) {
  currentFrame++;
}

function frame(current) {
  frameRate = input.value;
  frameTime = 1000 / frameRate;

  currentTime = Date.now();
  if (last === undefined) {
    last = current;
  }
  if (currentTime - startTime >= frameTime) {
    currentTime = startTime = Date.now();
    update((current - last) / (1000 / 60));
  }
  render();
  request();
}

function cancel() {
  window.cancelAnimationFrame(frameId);
}

function request() {
  frameId = window.requestAnimationFrame(frame);
}

function start() {
  window.addEventListener("resize", resize);
  resize();
  request();
}

loadImage("https://upload.wikimedia.org/wikipedia/commons/4/4a/Muybridge_race_horse_gallop.jpg").then(image => {
  frames = image;
  start();
});