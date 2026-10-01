/* =========================================================
   OUR LITTLE UNIVERSE
   Navigation Prototype
========================================================= */

const universe = document.getElementById("universe");

const farStars = document.getElementById("farStars");
const midStars = document.getElementById("midStars");
const nearStars = document.getElementById("nearStars");

const modeButtons =
  document.querySelectorAll(".mode-button");

const instructionTitle =
  document.getElementById("instructionTitle");

const instructionText =
  document.getElementById("instructionText");

const resetButton =
  document.getElementById("resetButton");

const depthFill =
  document.querySelector(".depth-fill");


/* =========================================================
   SETTINGS
========================================================= */

let mode = "flat";

let cameraX = 0;
let cameraY = 0;

let scale = 1;

const minScale = 0.55;
const maxScale = 2.2;

let isDragging = false;

let lastPointerX = 0;
let lastPointerY = 0;

let targetCameraX = 0;
let targetCameraY = 0;

let targetScale = 1;


/* =========================================================
   RANDOM STARS
========================================================= */

function createStars(container, amount, seedOffset = 0) {

  /*
    We use deterministic-ish maths rather than Math.random()
    for positions so the sky doesn't completely change
    every refresh.
  */

  for (let i = 0; i < amount; i++) {

    const star =
      document.createElement("div");

    star.classList.add("star");

    const pseudoA =
      Math.abs(
        Math.sin(
          (i + 1) * 12.9898 + seedOffset
        )
      );

    const pseudoB =
      Math.abs(
        Math.sin(
          (i + 1) * 78.233 + seedOffset
        )
      );

    const x =
      (pseudoA * 100000) % 100;

    const y =
      (pseudoB * 100000) % 100;

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;

    const brightness =
      ((i * 17 + seedOffset) % 100);

    if (brightness > 94) {
      star.classList.add("bright");
    }
    else if (brightness > 80) {
      star.classList.add("medium");
    }

    const opacity =
      0.25 +
      (
        ((i * 37 + seedOffset) % 70) / 100
      );

    star.style.opacity = opacity;

    container.appendChild(star);
  }
}


/* =========================================================
   BUILD SKY
========================================================= */

createStars(farStars, 330, 11);
createStars(midStars, 210, 37);
createStars(nearStars, 90, 83);


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

  /*
    Main universe movement.
  */

  universe.style.transform =
    `
      translate(
        calc(-50% + ${cameraX}px),
        calc(-50% + ${cameraY}px)
      )
      scale(${scale})
    `;


  /*
    Prototype C gets additional parallax.

    The layers shift at slightly different speeds,
    which creates the illusion that some stars are
    much closer than others.
  */

  if (mode === "cinematic") {

    farStars.style.transform =
      `
        translate(
          ${-cameraX * 0.025}px,
          ${-cameraY * 0.025}px
        )
      `;

    midStars.style.transform =
      `
        translate(
          ${-cameraX * 0.07}px,
          ${-cameraY * 0.07}px
        )
      `;

    nearStars.style.transform =
      `
        translate(
          ${-cameraX * 0.14}px,
          ${-cameraY * 0.14}px
        )
      `;

  }

  else {

    farStars.style.transform = "none";
    midStars.style.transform = "none";
    nearStars.style.transform = "none";

  }


  /*
    Depth indicator reacts to zoom.
  */

  const zoomProgress =
    (
      (scale - minScale) /
      (maxScale - minScale)
    ) * 100;

  const clamped =
    Math.max(
      5,
      Math.min(
        100,
        zoomProgress
      )
    );

  depthFill.style.width =
    `${clamped}%`;
}


/* =========================================================
   SMOOTH CINEMATIC CAMERA
========================================================= */

function animationLoop() {

  if (mode === "cinematic") {

    /*
      Instead of camera movement happening instantly,
      C gently catches up with the user's movement.
    */

    cameraX +=
      (targetCameraX - cameraX) * 0.12;

    cameraY +=
      (targetCameraY - cameraY) * 0.12;

    scale +=
      (targetScale - scale) * 0.1;

  }

  else {

    cameraX = targetCameraX;
    cameraY = targetCameraY;

    scale = targetScale;

  }

  updateCamera();

  requestAnimationFrame(animationLoop);
}

animationLoop();


/* =========================================================
   POINTER / MOUSE / TOUCH DRAG
========================================================= */

document.addEventListener(
  "pointerdown",
  (event) => {

    /*
      Don't drag universe if touching UI.
    */

    if (
      event.target.closest(
        ".mode-switch, #resetButton"
      )
    ) {
      return;
    }

    isDragging = true;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

  }
);


document.addEventListener(
  "pointermove",
  (event) => {

    if (!isDragging) return;

    const deltaX =
      event.clientX - lastPointerX;

    const deltaY =
      event.clientY - lastPointerY;

    targetCameraX += deltaX;
    targetCameraY += deltaY;

    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

  }
);


document.addEventListener(
  "pointerup",
  () => {
    isDragging = false;
  }
);


document.addEventListener(
  "pointercancel",
  () => {
    isDragging = false;
  }
);


/* =========================================================
   DESKTOP SCROLL ZOOM
========================================================= */

document.addEventListener(
  "wheel",
  (event) => {

    event.preventDefault();

    const direction =
      event.deltaY > 0
        ? -0.08
        : 0.08;

    targetScale += direction;

    targetScale =
      Math.max(
        minScale,
        Math.min(
          maxScale,
          targetScale
        )
      );

  },
  {
    passive: false
  }
);


/* =========================================================
   MOBILE PINCH ZOOM
========================================================= */

let previousPinchDistance = null;

document.addEventListener(
  "touchmove",
  (event) => {

    if (event.touches.length !== 2) {
      previousPinchDistance = null;
      return;
    }

    event.preventDefault();

    const touchA =
      event.touches[0];

    const touchB =
      event.touches[1];

    const dx =
      touchA.clientX -
      touchB.clientX;

    const dy =
      touchA.clientY -
      touchB.clientY;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (
      previousPinchDistance !== null
    ) {

      const difference =
        distance -
        previousPinchDistance;

      targetScale +=
        difference * 0.003;

      targetScale =
        Math.max(
          minScale,
          Math.min(
            maxScale,
            targetScale
          )
        );

    }

    previousPinchDistance =
      distance;

  },
  {
    passive: false
  }
);


document.addEventListener(
  "touchend",
  () => {

    previousPinchDistance = null;

  }
);


/* =========================================================
   MODE SWITCHING
========================================================= */

function setMode(newMode) {

  mode = newMode;

  modeButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );

    }
  );


  if (mode === "cinematic") {

    document.body.classList.add(
      "cinematic"
    );

    instructionTitle.textContent =
      "PROTOTYPE C";

    instructionText.textContent =
      "Drag to travel · Pinch or scroll to move through depth";

  }

  else {

    document.body.classList.remove(
      "cinematic"
    );

    instructionTitle.textContent =
      "PROTOTYPE A";

    instructionText.textContent =
      "Drag to explore · Pinch or scroll to zoom";

  }

}


modeButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        setMode(
          button.dataset.mode
        );

      }
    );

  }
);


/* =========================================================
   RESET
========================================================= */

function resetView() {

  targetCameraX = 0;
  targetCameraY = 0;

  targetScale = 1;

}


resetButton.addEventListener(
  "click",
  resetView
);


/* =========================================================
   START
========================================================= */

setMode("flat");

resetView();
