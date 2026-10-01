/* =========================================================
   OUR LITTLE UNIVERSE
   Cinematic Universe Foundation
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const app =
  document.getElementById("app");

const universe =
  document.getElementById("universe");

const farStars =
  document.getElementById("starsFar");

const midStars =
  document.getElementById("starsMid");

const nearStars =
  document.getElementById("starsNear");

const homeButton =
  document.getElementById("homeButton");

const navigationHint =
  document.getElementById(
    "navigationHint"
  );

const zoomFill =
  document.getElementById(
    "zoomFill"
  );


/* =========================================================
   CAMERA
========================================================= */

let cameraX = 0;
let cameraY = 0;

let targetX = 0;
let targetY = 0;

let zoom = 1;
let targetZoom = 1;

const MIN_ZOOM = 0.58;
const MAX_ZOOM = 2.15;


/*
  Soft movement creates the cinematic
  floating feeling from Prototype C.
*/

const CAMERA_EASING = 0.11;
const ZOOM_EASING = 0.09;


/* =========================================================
   POINTER STATE
========================================================= */

let dragging = false;

let previousX = 0;
let previousY = 0;

let hasInteracted = false;


/* =========================================================
   PINCH STATE
========================================================= */

let previousPinchDistance = null;


/* =========================================================
   DETERMINISTIC RANDOM GENERATOR
========================================================= */

/*
  This makes the same star field appear
  after every refresh.
*/

function seededRandom(seed) {

  const value =
    Math.sin(seed * 12.9898) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );

}


/* =========================================================
   CREATE STAR
========================================================= */

function createStar(
  container,
  index,
  seed,
  layer
) {

  const star =
    document.createElement("span");

  star.className =
    "space-star";


  const x =
    seededRandom(
      index + seed
    ) * 100;

  const y =
    seededRandom(
      index * 2.13 + seed
    ) * 100;


  star.style.left =
    `${x}%`;

  star.style.top =
    `${y}%`;


  /*
    Variation value determines whether
    a star is tiny, bright, warm, etc.
  */

  const variation =
    seededRandom(
      index * 4.71 + seed
    );


  if (variation < 0.25) {
    star.classList.add("tiny");
  }


  if (
    variation > 0.78 &&
    variation < 0.9
  ) {
    star.classList.add("bright");
  }


  if (variation > 0.94) {
    star.classList.add("warm");
  }


  else if (
    variation > 0.88
  ) {
    star.classList.add("cool");
  }


  /*
    Different depth layers have
    different opacity ranges.
  */

  let opacity;

  if (layer === "far") {

    opacity =
      0.18 +
      seededRandom(
        index * 6.2 + seed
      ) * 0.4;

  }

  else if (layer === "mid") {

    opacity =
      0.3 +
      seededRandom(
        index * 7.4 + seed
      ) * 0.48;

  }

  else {

    opacity =
      0.42 +
      seededRandom(
        index * 8.6 + seed
      ) * 0.48;

  }


  star.style.opacity =
    opacity;


  /*
    Only some stars twinkle.
    Most stay still so the sky
    doesn't look glittery.
  */

  const twinkleChance =
    seededRandom(
      index * 9.91 + seed
    );


  if (twinkleChance > 0.88) {

    star.classList.add(
      "twinkle"
    );


    const speed =
      4 +
      seededRandom(
        index * 11.3 + seed
      ) * 5;


    star.style.setProperty(
      "--twinkle-speed",
      `${speed}s`
    );


    star.style.setProperty(
      "--base-opacity",
      Math.max(
        0.2,
        opacity - 0.18
      )
    );


    star.style.setProperty(
      "--peak-opacity",
      Math.min(
        1,
        opacity + 0.25
      )
    );

  }


  container.appendChild(star);

}


/* =========================================================
   BUILD STAR FIELD
========================================================= */

function buildStarField() {

  /*
    Far layer:
    many tiny stars.
  */

  for (
    let i = 0;
    i < 520;
    i++
  ) {

    createStar(
      farStars,
      i,
      13,
      "far"
    );

  }


  /*
    Mid layer.
  */

  for (
    let i = 0;
    i < 280;
    i++
  ) {

    createStar(
      midStars,
      i,
      47,
      "mid"
    );

  }


  /*
    Near layer:
    fewer, brighter stars.
  */

  for (
    let i = 0;
    i < 95;
    i++
  ) {

    createStar(
      nearStars,
      i,
      91,
      "near"
    );

  }

}


buildStarField();


/* =========================================================
   CAMERA BOUNDARIES
========================================================= */

function clampCamera() {

  /*
    Prevents Faris from dragging so far
    that the entire universe disappears.

    We'll refine these boundaries later
    when the real constellations are placed.
  */

  const maxX =
    window.innerWidth * 1.25;

  const maxY =
    window.innerHeight * 1.35;


  targetX =
    Math.max(
      -maxX,
      Math.min(
        maxX,
        targetX
      )
    );


  targetY =
    Math.max(
      -maxY,
      Math.min(
        maxY,
        targetY
      )
    );

}


/* =========================================================
   PARALLAX
========================================================= */

function updateParallax() {

  /*
    Each layer moves at a slightly
    different rate.

    This is what gives C its depth.
  */

  farStars.style.transform =
    `
      translate3d(
        ${-cameraX * 0.018}px,
        ${-cameraY * 0.018}px,
        0
      )
    `;


  midStars.style.transform =
    `
      translate3d(
        ${-cameraX * 0.055}px,
        ${-cameraY * 0.055}px,
        0
      )
    `;


  nearStars.style.transform =
    `
      translate3d(
        ${-cameraX * 0.115}px,
        ${-cameraY * 0.115}px,
        0
      )
    `;

}


/* =========================================================
   CAMERA RENDER
========================================================= */

function renderCamera() {

  universe.style.transform =
    `
      translate3d(
        calc(-50% + ${cameraX}px),
        calc(-50% + ${cameraY}px),
        0
      )
      scale(${zoom})
    `;


  updateParallax();


  /*
    Depth meter.
  */

  const progress =
    (
      (zoom - MIN_ZOOM) /
      (MAX_ZOOM - MIN_ZOOM)
    ) * 100;


  zoomFill.style.width =
    `${
      Math.max(
        5,
        Math.min(
          100,
          progress
        )
      )
    }%`;

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate() {

  cameraX +=
    (
      targetX -
      cameraX
    ) *
    CAMERA_EASING;


  cameraY +=
    (
      targetY -
      cameraY
    ) *
    CAMERA_EASING;


  zoom +=
    (
      targetZoom -
      zoom
    ) *
    ZOOM_EASING;


  renderCamera();


  requestAnimationFrame(
    animate
  );

}


animate();


/* =========================================================
   HIDE NAVIGATION HINT
========================================================= */

function registerInteraction() {

  if (hasInteracted) {
    return;
  }


  hasInteracted = true;


  navigationHint.classList.add(
    "hidden"
  );

}


/* =========================================================
   POINTER DRAG
========================================================= */

document.addEventListener(
  "pointerdown",
  event => {

    /*
      Ignore UI buttons.
    */

    if (
      event.target.closest(
        "#interface"
      )
    ) {
      return;
    }


    dragging = true;

    previousX =
      event.clientX;

    previousY =
      event.clientY;


    app.classList.add(
      "dragging"
    );


    registerInteraction();

  }
);


document.addEventListener(
  "pointermove",
  event => {

    if (!dragging) {
      return;
    }


    const deltaX =
      event.clientX -
      previousX;


    const deltaY =
      event.clientY -
      previousY;


    /*
      Slightly compensate for zoom
      so dragging stays natural.
    */

    targetX +=
      deltaX / zoom;


    targetY +=
      deltaY / zoom;


    previousX =
      event.clientX;

    previousY =
      event.clientY;


    clampCamera();

  }
);


function stopDragging() {

  dragging = false;


  app.classList.remove(
    "dragging"
  );

}


document.addEventListener(
  "pointerup",
  stopDragging
);


document.addEventListener(
  "pointercancel",
  stopDragging
);


/* =========================================================
   DESKTOP / TRACKPAD ZOOM
========================================================= */

document.addEventListener(
  "wheel",
  event => {

    event.preventDefault();


    registerInteraction();


    /*
      Trackpads often return smaller
      delta values than mouse wheels.
    */

    const amount =
      -event.deltaY *
      0.0012;


    targetZoom +=
      amount;


    targetZoom =
      Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          targetZoom
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

document.addEventListener(
  "touchmove",
  event => {

    if (
      event.touches.length !== 2
    ) {

      previousPinchDistance =
        null;

      return;

    }


    event.preventDefault();


    registerInteraction();


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


      targetZoom +=
        difference *
        0.0028;


      targetZoom =
        Math.max(
          MIN_ZOOM,
          Math.min(
            MAX_ZOOM,
            targetZoom
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

    previousPinchDistance =
      null;

  }
);


/* =========================================================
   HOME / ORION
========================================================= */

function returnToOrion() {

  targetX = 0;
  targetY = 0;

  targetZoom = 1;

}


homeButton.addEventListener(
  "click",
  returnToOrion
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    clampCamera();

  }
);


/* =========================================================
   STARTING POSITION
========================================================= */

returnToOrion();
