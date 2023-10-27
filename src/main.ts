import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Sketch Me";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDrawing = false;
const drawingData: number[][] = [];
let undoPath: number[][] = [];
let currentPath: number[] = [];
let markerSize = 1;
const markerSizeLimit = 10;

let isSticker = false;
let selectedSticker: string;
const stickersData: { x: number; y: number; sticker: string }[] = [];
const stickerArray = ["❤️", "🌸", "😊"];
let stickerIndex = 0;

const stickerButton = document.getElementById(
  "stickerButton"
) as HTMLButtonElement;

stickerButton.addEventListener("click", () => {
  isSticker = true;
  selectedSticker = stickerArray[(stickerIndex + 1) % stickerArray.length];
  stickerIndex = (stickerIndex + 1) % stickerArray.length;
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
    currentPath = [startX, startY];
  } else if (isSticker) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (selectedSticker) {
      stickersData.push({ x, y, sticker: selectedSticker });
      redraw();
    }
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (!isSticker && isDrawing) {
    currentX = e.offsetX;
    currentY = e.offsetY;
    drawLine(startX, startY, currentX, currentY);
    startX = currentX;
    startY = currentY;
    currentPath.push(startX, startY);
  } else if (isSticker) {
    currentX = e.offsetX;
    currentY = e.offsetY;
    redraw();
    drawSticker(currentX, currentY, selectedSticker);
  }
});

canvas.addEventListener("mouseup", () => {
  if (!isSticker && isDrawing) {
    drawingData.push(currentPath);
    currentPath = [];
    undoPath = [];
    isDrawing = false;
  }
});

function drawLine(x1: number, y1: number, x2: number, y2: number) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = markerSize;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function drawSticker(x: number, y: number, sticker: string) {
  context.font = "20px Arial";
  context.fillText(sticker, x, y);
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
  drawingData.forEach((path) => {
    for (let i = 0; i < path.length; i += 2) {
      const x1 = path[i];
      const y1 = path[i + 1];
      const x2 = path[i + 2];
      const y2 = path[i + 3];
      drawLine(x1, y1, x2, y2);
    }
  });
  stickersData.forEach((sticker) => {
    drawSticker(sticker.x, sticker.y, sticker.sticker);
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
