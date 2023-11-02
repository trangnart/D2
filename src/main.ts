import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sketch Me";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

class MarkerLine {
  path: number[][];

  constructor(initialX: number, initialY: number) {
    this.path = [[initialX, initialY]];
  }

  drag(x: number, y: number) {
    this.path.push([x, y]);
  }

  display(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const [x1, y1] = this.path[i];
      const [x2, y2] = this.path[i + 1];
      this.drawLine(ctx, x1, y1, x2, y2);
    }
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = markerSize;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }
}

class Sticker {
  x: number;
  y: number;
  rotate: number;
  sticker: string;

  constructor(x: number, y: number, rotate: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.rotate = rotate;
    this.sticker = sticker;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotate);
    ctx.font = "20px Arial";
    ctx.fillText(this.sticker, 0, 0);
    ctx.restore();
  }
}

let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDrawing = false;
const drawingData: MarkerLine[] = [];
let undoPath: MarkerLine[] = [];
let currentPath: MarkerLine;
let markerSize = 1;
const markerSizeLimit = 10;

let isSticker = false;
let selectedSticker: string;
const stickersData: {
  x: number;
  y: number;
  rotate: number;
  sticker: string;
}[] = [];
const stickerArray = ["❤️", "🌸", "😊"];
let stickerIndex = 0;
let stickerRotation = 0;

const stickerButton = document.getElementById(
  "stickerButton"
) as HTMLButtonElement;

stickerButton.addEventListener("click", () => {
  isSticker = true;
  const randomRotation = Math.random() * Math.PI * 2;
  selectedSticker = stickerArray[(stickerIndex + 1) % stickerArray.length];
  stickerIndex = (stickerIndex + 1) % stickerArray.length;
  stickerRotation = randomRotation;
  const event = new Event("tool-moved");
  canvas.dispatchEvent(event);
  updateSticker();
});

function updateSticker() {
  stickerButton.innerText = `${stickerArray[stickerIndex]}`;
}

canvas.addEventListener("mouseenter", () => {
  canvas.style.cursor = "crosshair";
  const event = new Event("tool-moved");
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  if (!isSticker) {
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    currentPath = new MarkerLine(startX, startY);
  } else if (isSticker) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (selectedSticker) {
      stickersData.push(new Sticker(x, y, stickerRotation, selectedSticker));
      redraw();
    }
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (!isSticker && isDrawing) {
    currentX = e.offsetX;
    currentY = e.offsetY;
    currentPath.drag(currentX, currentY);
    drawLine(startX, startY, currentX, currentY);
    startX = currentX;
    startY = currentY;
  } else if (isSticker) {
    currentX = e.offsetX;
    currentY = e.offsetY;
    redraw();
    drawSticker(currentX, currentY, stickerRotation, selectedSticker);
  }
});

canvas.addEventListener("mouseup", () => {
  if (!isSticker && isDrawing) {
    drawingData.push(currentPath);
    currentPath = new MarkerLine(0, 0);
    undoPath = [];
    isDrawing = false;
  }
});

function drawLine(x1: number, y1: number, x2: number, y2: number) {
  const markerLine = new MarkerLine(x1, y1);
  markerLine.drag(x2, y2);
  markerLine.display(context);
}

function drawSticker(x: number, y: number, rotation: number, sticker: string) {
  const stickerObj = new Sticker(x, y, rotation, sticker);
  stickerObj.display(context);
}

const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawingData.length = 0;
  undoPath.length = 0;
  stickersData.length = 0;
});

const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
undoButton.addEventListener("click", () => {
  if (drawingData.length > 0 && !isSticker) {
    const undo = drawingData.pop();
    if (undo) {
      undoPath.push(undo);
      redraw();
    }
  } else if (stickersData.length > 0 && isSticker) {
    stickersData.pop();
    redraw();
  }
});

const redoButton = document.getElementById("redoButton") as HTMLButtonElement;
redoButton.addEventListener("click", () => {
  if (undoPath.length > 0) {
    const redo = undoPath.pop();
    if (redo) {
      drawingData.push(redo);
      redraw();
    }
  }
});

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawingData.forEach((markerLine) => {
    markerLine.display(context);
  });
  stickersData.forEach((sticker) => {
    const stickerObj = new Sticker(
      sticker.x,
      sticker.y,
      sticker.rotate,
      sticker.sticker
    );
    stickerObj.display(context);
  });
}

const markerSizeButton = document.getElementById(
  "markerSizeButton"
) as HTMLButtonElement;
markerSizeButton.innerText = `${markerSize}px`;

const markerSizeClick = document.getElementById(
  "markerSizeButton"
) as HTMLButtonElement;
markerSizeClick.addEventListener("click", () => {
  isSticker = false;
  if (markerSize < markerSizeLimit) {
    markerSize += 1;
  } else {
    markerSize = 1;
  }

  updateMarkerSizeButton();
});

function updateMarkerSizeButton() {
  markerSizeButton.innerText = `${markerSize}px`;
}

const customStickerButton = document.getElementById(
  "stickerCustomButton"
) as HTMLButtonElement;
customStickerButton.addEventListener("click", () => {
  const userInput = prompt("Please enter your custom sticker:");
  if (userInput) {
    isSticker = true;
    selectedSticker = userInput;
    const event = new Event("tool-moved");
    canvas.dispatchEvent(event);
  }
});

const exportButton = document.getElementById(
  "exportButton"
) as HTMLButtonElement;
exportButton.addEventListener("click", () => {
  const tempCanvas = document.createElement("canvas");
  const temp = tempCanvas.getContext("2d")!;
  tempCanvas.width = 1024;
  tempCanvas.height = 1024;
  temp.scale(2, 2);
  temp.drawImage(canvas, 0, 0);
  const anchor = document.createElement("a");
  anchor.href = tempCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

const rotateButton = document.getElementById(
  "rotateButton"
) as HTMLButtonElement;
rotateButton.addEventListener("click", () => {
  if (isSticker) {
    stickerRotation += 45;
    redraw();
  }
});
