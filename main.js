/* =========================================================
   OUR LITTLE UNIVERSE
   Cinematic Universe + Telescope Discovery
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const app =
  document.getElementById("app");

const universe =
  document.getElementById("universe");

const dustLayer =
  document.getElementById("dustLayer");

const starsDeep =
  document.getElementById("starsDeep");

const starsFar =
  document.getElementById("starsFar");

const starsMid =
  document.getElementById("starsMid");

const starsNear =
  document.getElementById("starsNear");

const orion =
  document.getElementById("orion");

const telescopeLens =
  document.getElementById("telescopeLens");

const telescopeButton =
  document.getElementById("telescopeButton");

const navigationHint =
  document.getElementById("navigationHint");

const hintMain =
  document.getElementById("hintMain");

const hintSub =
  document.getElementById("hintSub");

const discoveryMessage =
  document.getElementById("discoveryMessage");

const discoveryNumber =
  document.getElementById("discoveryNumber");


/* =========================================================
   CAMERA
========================================================= */

let cameraX = 0;
let cameraY = 0;

let targetX = 0;
let targetY = 0;

let zoom = 1;
let targetZoom = 1;

const MIN_ZOOM = 0.62;
const MAX_ZOOM = 1.9;

const CAMERA_EASING = 0.105;
const ZOOM_EASING = 0.09;


/* =========================================================
   INPUT
========================================================= */

let dragging = false;

let previousX = 0;
let previousY = 0;

let previousPinchDistance = null;

let hasInteracted = false;


/* =========================================================
   TELESCOPE
========================================================= */

let telescopeActive = false;

let lensX =
  window.innerWidth / 2;

let lensY =
  window.innerHeight / 2;

let targetLensX = lensX;
let targetLensY = lensY;

let lensDragging = false;


/* =========================================================
   ORION DISCOVERY
========================================================= */

let orionDiscovered = false;

let focusStartedAt = null;

const HOLD_TO_DISCOVER = 1800;


/* =========================================================
   SEEDED RANDOM
========================================================= */

function random(seed) {

  const value =
    Math.sin(seed * 12.9898) *
    43758.5453123;

  return (
    value -
    Math.floor(value)
  );

}


/* =========================================================
   STAR CREATION
========================================================= */

function createStar(
  container,
  x,
  y,
  seed,
  layer
) {

  const star =
    document.createElement("span");

  star.className =
    "sky-star";


  star.style.left =
    `${x}%`;

  star.style.top =
    `${y}%`;


  const appearance =
    random(
      seed * 2.7
    );


  if (
    appearance < .3
  ) {

    star.classList.add(
      "tiny"
    );

  }


  if (
    appearance > .955 &&
    layer !== "deep"
  ) {

    star.classList.add(
      "large"
    );

  }


  const tone =
    random(
      seed * 4.93
    );


  if (
    tone > .965
  ) {

    star.classList.add(
      "warm"
    );

  }

  else if (
    tone < .055
  ) {

    star.classList.add(
      "cool"
    );

  }


  /*
    Opacity by layer.
  */

  let opacity;


  if (
    layer === "deep"
  ) {

    opacity =
      .10 +
      random(
        seed * 6.17
      ) * .3;

  }


  else if (
    layer === "far"
  ) {

    opacity =
      .18 +
      random(
        seed * 7.31
      ) * .4;

  }


  else if (
    layer === "mid"
  ) {

    opacity =
      .28 +
      random(
        seed * 8.51
      ) * .5;

  }


  else {

    opacity =
      .4 +
      random(
        seed * 9.73
      ) * .5;

  }


  star.style.opacity =
    opacity;


  /*
    Very few stars twinkle.
  */

  const twinkle =
    random(
      seed * 11.17
    );


  if (
    twinkle > .955
  ) {

    star.classList.add(
      "twinkle"
    );


    star.style.setProperty(
      "--twinkle-duration",
      `${
        6 +
        random(seed * 13.1) * 7
      }s`
    );


    star.style.setProperty(
      "--twinkle-low",
      Math.max(
        .15,
        opacity - .15
      )
    );


    star.style.setProperty(
      "--twinkle-high",
      Math.min(
        1,
        opacity + .22
      )
    );

  }


  container.appendChild(
    star
  );

}


/* =========================================================
   STAR CLUSTER
========================================================= */

/*
  This is the big difference from our old sky.

  Instead of distributing everything evenly,
  we deliberately create irregular stellar regions.
*/

function createCluster(
  container,
  config
) {

  const {
    centreX,
    centreY,
    width,
    height,
    amount,
    seed,
    layer
  } = config;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    /*
      Average several random values.

      This clusters stars around the centre
      rather than distributing them evenly
      inside a rectangle.
    */

    const rx =
      (
        random(seed + i * 2.11) +
        random(seed + i * 3.73) +
        random(seed + i * 5.19)
      ) / 3;


    const ry =
      (
        random(seed + i * 7.07) +
        random(seed + i * 8.91) +
        random(seed + i * 10.33)
      ) / 3;


    const x =
      centreX +
      (
        rx - .5
      ) * width;


    const y =
      centreY +
      (
        ry - .5
      ) * height;


    createStar(
      container,
      x,
      y,
      seed + i,
      layer
    );

  }

}


/* =========================================================
   SPARSE BACKGROUND
========================================================= */

function createSparseField(
  container,
  amount,
  seed,
  layer
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const x =
      random(
        seed + i * 2.37
      ) * 100;


    const y =
      random(
        seed + i * 5.83
      ) * 100;


    createStar(
      container,
      x,
      y,
      seed + i * 13,
      layer
    );

  }

}


/* =========================================================
   BUILD SKY
========================================================= */

function buildSky() {

  /*
    1. Sparse universe everywhere.
  */

  createSparseField(
    starsDeep,
    780,
    100,
    "deep"
  );


  createSparseField(
    starsFar,
    300,
    400,
    "far"
  );


  createSparseField(
    starsMid,
    130,
    700,
    "mid"
  );


  createSparseField(
    starsNear,
    42,
    1000,
    "near"
  );


  /*
    2. Irregular distant clusters.

    Notice that we DON'T cover the whole sky.
    Large quiet regions remain.
  */

  createCluster(
    starsDeep,
    {
      centreX: 28,
      centreY: 38,
      width: 30,
      height: 16,
      amount: 420,
      seed: 2000,
      layer: "deep"
    }
  );


  createCluster(
    starsDeep,
    {
      centreX: 61,
      centreY: 64,
      width: 36,
      height: 18,
      amount: 520,
      seed: 3000,
      layer: "deep"
    }
  );


  createCluster(
    starsDeep,
    {
      centreX: 78,
      centreY: 27,
      width: 21,
      height: 20,
      amount: 240,
      seed: 4000,
      layer: "deep"
    }
  );


  createCluster(
    starsFar,
    {
      centreX: 34,
      centreY: 42,
      width: 28,
      height: 19,
      amount: 130,
      seed: 5000,
      layer: "far"
    }
  );


  createCluster(
    starsFar,
    {
      centreX: 67,
      centreY: 66,
      width: 31,
      height: 17,
      amount: 150,
      seed: 6000,
      layer: "far"
    }
  );


  /*
    Small foreground pockets.
  */

  createCluster(
    starsMid,
    {
      centreX: 72,
      centreY: 32,
      width: 16,
      height: 18,
      amount: 35,
      seed: 7000,
      layer: "mid"
    }
  );


  createCluster(
    starsMid,
    {
      centreX: 23,
      centreY: 70,
      width: 18,
      height: 15,
      amount: 30,
      seed: 8000,
      layer: "mid"
    }
  );

}


buildSky();


/* =========================================================
   CAMERA BOUNDS
========================================================= */

function clampCamera() {

  const maxX =
    window.innerWidth *
    1.3;


  const maxY =
    window.innerHeight *
    1.4;


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
    Dust = deepest.

    Near stars = largest movement.
  */

  dustLayer.style.transform =
    `
      translate3d(
        ${-cameraX * .008}px,
        ${-cameraY * .008}px,
        0
      )
    `;


  starsDeep.style.transform =
    `
      translate3d(
        ${-cameraX * .012}px,
        ${-cameraY * .012}px,
        0
      )
    `;


  starsFar.style.transform =
    `
      translate3d(
        ${-cameraX * .028}px,
        ${-cameraY * .028}px,
        0
      )
    `;


  starsMid.style.transform =
    `
      translate3d(
        ${-cameraX * .065}px,
        ${-cameraY * .065}px,
        0
      )
    `;


  starsNear.style.transform =
    `
      translate3d(
        ${-cameraX * .13}px,
        ${-cameraY * .13}px,
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

}


/* =========================================================
   LENS RENDER
========================================================= */

function renderLens() {

  lensX +=
    (
      targetLensX -
      lensX
    ) * .2;


  lensY +=
    (
      targetLensY -
      lensY
    ) * .2;


  telescopeLens.style.left =
    `${lensX}px`;


  telescopeLens.style.top =
    `${lensY}px`;

}


/* =========================================================
   ORION SCREEN POSITION
========================================================= */

function getOrionScreenCentre() {

  const rect =
    orion.getBoundingClientRect();


  return {

    x:
      rect.left +
      rect.width / 2,

    y:
      rect.top +
      rect.height / 2

  };

}


/* =========================================================
   TELESCOPE DISCOVERY CHECK
========================================================= */

function checkTelescopeFocus(
  timestamp
) {

  if (
    !telescopeActive ||
    orionDiscovered
  ) {

    orion.classList.remove(
      "telescope-near",
      "telescope-hot"
    );


    telescopeLens.classList.remove(
      "near",
      "hot",
      "holding"
    );


    focusStartedAt =
      null;


    return;

  }


  const orionCentre =
    getOrionScreenCentre();


  const dx =
    lensX -
    orionCentre.x;


  const dy =
    lensY -
    orionCentre.y;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  /*
    Hot/cold thresholds adapt slightly
    to screen size.
  */

  const nearDistance =
    Math.min(
      330,
      window.innerWidth * .32
    );


  const hotDistance =
    Math.min(
      135,
      window.innerWidth * .14
    );


  /* -------------------------
     FAR
  ------------------------- */

  if (
    distance >
    nearDistance
  ) {

    orion.classList.remove(
      "telescope-near",
      "telescope-hot"
    );


    telescopeLens.classList.remove(
      "near",
      "hot",
      "holding"
    );


    focusStartedAt =
      null;


    return;

  }


  /* -------------------------
     NEAR
  ------------------------- */

  orion.classList.add(
    "telescope-near"
  );


  telescopeLens.classList.add(
    "near"
  );


  if (
    distance >
    hotDistance
  ) {

    orion.classList.remove(
      "telescope-hot"
    );


    telescopeLens.classList.remove(
      "hot",
      "holding"
    );


    focusStartedAt =
      null;


    return;

  }


  /* -------------------------
     HOT
  ------------------------- */

  orion.classList.add(
    "telescope-hot"
  );


  telescopeLens.classList.add(
    "hot",
    "holding"
  );


  /*
    Start hold timer.
  */

  if (
    focusStartedAt === null
  ) {

    focusStartedAt =
      timestamp;

  }


  const heldFor =
    timestamp -
    focusStartedAt;


  if (
    heldFor >=
    HOLD_TO_DISCOVER
  ) {

    discoverOrion();

  }

}


/* =========================================================
   DISCOVER ORION
========================================================= */

function discoverOrion() {

  if (
    orionDiscovered
  ) {
    return;
  }


  orionDiscovered =
    true;


  focusStartedAt =
    null;


  orion.classList.remove(
    "telescope-near",
    "telescope-hot"
  );


  telescopeLens.classList.remove(
    "near",
    "hot",
    "holding"
  );


  orion.classList.add(
    "discovered"
  );


  discoveryNumber.textContent =
    "1";


  /*
    Let the constellation lines begin first.
  */

  setTimeout(
    () => {

      discoveryMessage.classList.add(
        "show"
      );

    },
    1150
  );


  /*
    Message disappears again.
  */

  setTimeout(
    () => {

      discoveryMessage.classList.remove(
        "show"
      );

    },
    4300
  );


  /*
    Telescope gently switches off
    after the reveal.
  */

  setTimeout(
    () => {

      setTelescope(
        false
      );

    },
    2900
  );

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate(
  timestamp
) {

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


  renderLens();


  checkTelescopeFocus(
    timestamp
  );


  requestAnimationFrame(
    animate
  );

}


requestAnimationFrame(
  animate
);


/* =========================================================
   INITIAL INTERACTION
========================================================= */

function registerInteraction() {

  if (
    hasInteracted
  ) {
    return;
  }


  hasInteracted =
    true;


  navigationHint.classList.add(
    "hidden"
  );

}


/* =========================================================
   UNIVERSE DRAG
========================================================= */

document.addEventListener(
  "pointerdown",
  event => {

    /*
      Telescope mode has its own
      pointer behaviour.
    */

    if (
      telescopeActive
    ) {

      if (
        event.target.closest(
          "#telescopeButton"
        )
      ) {
        return;
      }


      lensDragging =
        true;


      targetLensX =
        event.clientX;


      targetLensY =
        event.clientY;


      return;

    }


    if (
      event.target.closest(
        "button"
      )
    ) {
      return;
    }


    dragging =
      true;


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

    /*
      LAPTOP:
      telescope follows cursor.
    */

    if (
      telescopeActive &&
      event.pointerType === "mouse"
    ) {

      targetLensX =
        event.clientX;


      targetLensY =
        event.clientY;


      return;

    }


    /*
      TOUCH:
      drag telescope with finger.
    */

    if (
      telescopeActive &&
      lensDragging
    ) {

      targetLensX =
        event.clientX;


      targetLensY =
        event.clientY;


      return;

    }


    /*
      NORMAL UNIVERSE DRAG
    */

    if (
      !dragging
    ) {
      return;
    }


    const dx =
      event.clientX -
      previousX;


    const dy =
      event.clientY -
      previousY;


    targetX +=
      dx / zoom;


    targetY +=
      dy / zoom;


    previousX =
      event.clientX;


    previousY =
      event.clientY;


    clampCamera();

  }
);


document.addEventListener(
  "pointerup",
  () => {

    dragging =
      false;


    lensDragging =
      false;


    app.classList.remove(
      "dragging"
    );

  }
);


document.addEventListener(
  "pointercancel",
  () => {

    dragging =
      false;


    lensDragging =
      false;


    app.classList.remove(
      "dragging"
    );

  }
);


/* =========================================================
   DESKTOP ZOOM
========================================================= */

document.addEventListener(
  "wheel",
  event => {

    if (
      telescopeActive
    ) {
      return;
    }


    event.preventDefault();


    registerInteraction();


    targetZoom +=
      -event.deltaY *
      .001;


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
   TOUCH PINCH ZOOM
========================================================= */

document.addEventListener(
  "touchmove",
  event => {

    if (
      telescopeActive
    ) {
      return;
    }


    if (
      event.touches.length !== 2
    ) {

      previousPinchDistance =
        null;

      return;

    }


    event.preventDefault();


    const a =
      event.touches[0];


    const b =
      event.touches[1];


    const dx =
      a.clientX -
      b.clientX;


    const dy =
      a.clientY -
      b.clientY;


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
        .0026;


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
   TELESCOPE TOGGLE
========================================================= */

function setTelescope(
  active
) {

  telescopeActive =
    active;


  app.classList.toggle(
    "telescope-active",
    active
  );


  telescopeButton.classList.toggle(
    "active",
    active
  );


  if (
    active
  ) {

    /*
      Telescope starts in the centre
      of the screen.
    */

    targetLensX =
      window.innerWidth / 2;


    targetLensY =
      window.innerHeight / 2;


    lensX =
      targetLensX;


    lensY =
      targetLensY;


    navigationHint.classList.remove(
      "hidden"
    );


    hintMain.textContent =
      "Move the telescope";


    hintSub.textContent =
      "Some stars are not quite what they seem";

  }

  else {

    navigationHint.classList.add(
      "hidden"
    );


    focusStartedAt =
      null;


    telescopeLens.classList.remove(
      "near",
      "hot",
      "holding"
    );


    orion.classList.remove(
      "telescope-near",
      "telescope-hot"
    );

  }

}


telescopeButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    setTelescope(
      !telescopeActive
    );

  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    clampCamera();


    if (
      !telescopeActive
    ) {

      lensX =
        window.innerWidth / 2;


      lensY =
        window.innerHeight / 2;


      targetLensX =
        lensX;


      targetLensY =
        lensY;

    }

  }
);


/* =========================================================
   START
========================================================= */

/*
  Orion is approximately centred initially.

  Later our intro/tutorial will determine the
  actual opening camera position.
*/

targetX = 0;
targetY = 0;

targetZoom = 1;
