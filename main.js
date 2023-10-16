import "unfonts.css";
import "./style.css";

const DEV = import.meta.env.DEV;

import { Engine, Composite, Bodies, Body, Mouse, MouseConstraint } from "matter-js";

import { getFont, getDeviceOrientation, clamp, getRandomInRange } from "./utils";

const gravity = { x: 0, y: 1 };
const deviceOrientation = getDeviceOrientation();
let isAccessGranted = false;

const font = {
  family: "Telma",
  size: 50,
  weight: 500,
};

const bodies = [];
const bounds = [];
const BOUND_THICKNESS = 100;

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

const requestBtn = document.querySelector("#request-btn");

let engine = Engine.create({ positionIterations: 10, constraintIterations: 10 });
let world = engine.world;

init();

function init() {
  document.body.appendChild(canvas);
  canvas.style.display = "block";

  resize();
  createBounds();

  const mouse = Mouse.create(canvas);
  mouse.pixelRatio = 1;
  const mouseConstraint = MouseConstraint.create(engine, { mouse });
  Composite.add(world, mouseConstraint);

  deviceOrientation.requestAccess().then((isGranted) => (isAccessGranted = isGranted));

  engine.gravity.y = gravity.y;

  for (let i = 0; i < 10; i++) {
    const x = getRandomInRange(200, canvas.width - 200);
    const y = getRandomInRange(200, canvas.height - 200);
    createTextBody("Hello World", x, y);
  }

  requestAnimationFrame(animate);
}

function animate() {
  Engine.update(engine);
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.rect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.fill();

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (body.isText) {
      drawText("Hello World", body.vertices[0].x, body.vertices[0].y, body.parts[0].angle);
    }

    drawShape(body.vertices);
  }

  drawDebugText();
}

function drawShape(vertices) {
  context.beginPath();

  context.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i++) {
    context.lineTo(vertices[i].x, vertices[i].y);
  }
  context.lineTo(vertices[0].x, vertices[0].y);

  context.lineWidth = 1;
  context.strokeStyle = "#000";
  context.stroke();

  context.closePath();
}

function createTextBody(text, x, y) {
  context.font = getFont(font);
  const metrics = context.measureText(text);

  const width = Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
  const height =
    Math.abs(metrics.actualBoundingBoxAscent) + Math.abs(metrics.actualBoundingBoxDescent);

  const body = Bodies.rectangle(x, y, width, height, {
    angle: getRandomInRange(-Math.PI * 0.25, Math.PI * 0.25),
    // isStatic: true,
  });

  Composite.add(world, body);

  bodies.push({ ...body, isText: true });
}

function drawText(text, x, y, angle) {
  context.font = getFont(font);

  context.beginPath();
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.textBaseline = "top";
  context.textAlign = "left";
  context.fillStyle = "#000";
  context.fillText(text, 0, 0);
  context.restore();
  context.closePath();
}

function drawDebugText() {
  const orientation = deviceOrientation.orientation;

  if (orientation !== null) {
    const alpha = orientation.alpha || 0;
    const beta = orientation.beta || 90;
    const gamma = orientation.gamma || 0;

    gravity.x = gamma / 90;
    gravity.y = beta / 90;

    gravity.x = clamp(gravity.x, -1, 1);
    gravity.y = clamp(gravity.y, -1, 1);

    engine.gravity.x = gravity.x;
    engine.gravity.y = gravity.y;

    context.font = "16px monospace";
    context.fillStyle = "#000";
    context.fillText(`alpha: ${alpha}`, 10, canvas.height - 10 - 16 * 1);
    context.fillText(`beta: ${beta}`, 10, canvas.height - 10 - 16 * 2);
    context.fillText(`gamma: ${gamma}`, 10, canvas.height - 10 - 16 * 3);
  }
}

function createBounds() {
  const boundOptions = { isStatic: true };

  const thickness = BOUND_THICKNESS;
  let boundLeft = Bodies.rectangle(
    -thickness / 2,
    canvas.height / 2,
    thickness,
    canvas.height,
    boundOptions
  );
  let boundTop = Bodies.rectangle(
    canvas.width / 2,
    -thickness / 2,
    canvas.width,
    thickness,
    boundOptions
  );
  let boundRight = Bodies.rectangle(
    canvas.width + thickness / 2,
    canvas.height / 2,
    thickness,
    canvas.height,
    boundOptions
  );
  let boundBottom = Bodies.rectangle(
    canvas.width / 2,
    canvas.height + thickness / 2,
    canvas.width,
    thickness,
    boundOptions
  );

  bounds.push(boundLeft, boundTop, boundRight, boundBottom);
  bodies.push(boundLeft, boundTop, boundRight, boundBottom);
  Composite.add(world, bounds);
}

function updateBounds() {
  if (bounds.length > 0) {
    const thickness = BOUND_THICKNESS;

    const [left, top, right, bottom] = bounds;
    Body.setPosition(left, { x: -thickness / 2, y: canvas.height / 2 });
    Body.setPosition(top, { x: canvas.width / 2, y: -thickness / 2 });
    Body.setPosition(right, { x: canvas.width + thickness / 2, y: canvas.height / 2 });
    Body.setPosition(bottom, { x: canvas.width / 2, y: canvas.height + thickness / 2 });
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  updateBounds();
}

requestBtn.addEventListener("click", () => {
  if (isAccessGranted) return;

  deviceOrientation.requestAccess();
});

window.addEventListener("resize", resize);
