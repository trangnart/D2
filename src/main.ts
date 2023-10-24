import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Jane game";

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
let markerSize = 3;

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;
  currentPath = [startX, startY];
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (isDrawing) {
    currentX = e.offsetX;
    currentY = e.offsetY;
    drawLine(startX, startY, currentX, currentY);
    startX = currentX;
    startY = currentY;
    currentPath.push(startX, startY);
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
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

const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawingData.length = 0;
  undoPath.length = 0;
});

const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
undoButton.addEventListener("click", () => {
  if (drawingData.length > 0) {
    const undo = drawingData.pop();
    if (undo) {
      undoPath.push(undo);
      redraw();
    }
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
}

const thinButton = document.getElementById("thinButton") as HTMLButtonElement;
thinButton.addEventListener("click", () => {
  markerSize = 1;
});

const thickButton = document.getElementById("thickButton") as HTMLButtonElement;
thickButton.addEventListener("click", () => {
  markerSize = 5;
});
