import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Jane game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

let isDrawing = false;
let x = 0;
let y = 0;
const drawingData: number[][] = [];

canvas.addEventListener("mousedown", (e: MouseEvent) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  if (isDrawing) {
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    drawingData.push([x, y, currentX, currentY]);
    x = currentX;
    y = currentY;
    const event = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(event);
  }
});

window.addEventListener("mouseup", (e: MouseEvent) => {
  if (isDrawing) {
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    drawingData.push([x, y, currentX, currentY]);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawingData.forEach((line) => {
    drawLine(context, line[0], line[1], line[2], line[3]);
  });
});
