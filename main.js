/* =========================================================
   OUR LITTLE UNIVERSE
   Anniversary 2026

   main.js

   Current build:
   - cinematic draggable universe
   - layered procedural stars
   - parallax
   - mouse-wheel zoom
   - pinch zoom
   - telescope mode
   - black telescope surroundings
   - fixed circular eyepiece
   - drag sky through telescope
   - detailed telescope star field
   - hidden Orion search
   - hold Orion in view to discover
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

const telescopeView =
  document.getElementById("telescopeView");

const eyepiece =
  document.getElementById("eyepiece");

const telescopeCanvas =
  document.getElementById("telescopeCanvas");

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


const telescopeContext =
  telescopeCanvas.getContext("2d");


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
   NORMAL UNIVERSE DRAG
========================================================= */

let universeDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let dragCameraStartX = 0;
let dragCameraStartY = 0;


/* =========================================================
   PINCH ZOOM
========================================================= */

const activePointers =
  new Map();

let pinchStartDistance = 0;
let pinchStartZoom = 1;


/* =========================================================
   TELESCOPE STATE
========================================================= */

let telescopeActive = false;

let telescopeX = 0;
let telescopeY = 0;

let targetTelescopeX = 0;
let targetTelescopeY = 0;

let telescopeDragging = false;

let previousTelescopeX = 0;
let previousTelescopeY = 0;


/*
   Orion's location in telescope-space.

   Telescope begins at 0,0.

   Orion is intentionally somewhere else so
   Faris has to search for it.
*/

const ORION_TELESCOPE_X = 380;
const ORION_TELESCOPE_Y = -180;


/* =========================================================
   DISCOVERY
========================================================= */

let orionDiscovered = false;

let focusStartedAt = null;

const HOLD_TO_DISCOVER = 1800;


/* =========================================================
   TELESCOPE STAR DATA
========================================================= */

const telescopeStars = [];


/* =========================================================
   SEEDED RANDOM

   Using deterministic random numbers means the universe
   looks the same every time the page reloads.
========================================================= */

function seededRandom(seed) {

  const value =
    Math.sin(seed * 91.3458) *
    47453.5453;

  return value -
    Math.floor(value);

}


/* =========================================================
   NORMAL UNIVERSE STAR CREATION
========================================================= */

function createStar(
  layer,
  x,
  y,
  options = {}
) {

  const star =
    document.createElement("span");

  star.className =
    "sky-star";


  if (options.tiny) {
    star.classList.add("tiny");
  }


  if (options.large) {
    star.classList.add("large");
  }


  if (options.warm) {
    star.classList.add("warm");
  }


  if (options.cool) {
    star.classList.add("cool");
  }


  if (options.twinkle) {

    star.classList.add("twinkle");

    star.style.setProperty(
      "--twinkle-duration",
      `${options.duration || 8}s`
    );


    star.style.setProperty(
      "--twinkle-low",
      options.low || ".28"
    );


    star.style.setProperty(
      "--twinkle-high",
      options.high || ".72"
    );

  }


  star.style.left =
    `${x}px`;

  star.style.top =
    `${y}px`;


  if (
    options.opacity !== undefined
  ) {

    star.style.opacity =
      options.opacity;

  }


  layer.appendChild(star);

}


/* =========================================================
   CREATE A SPARSE STAR FIELD
========================================================= */

function buildSparseField(
  layer,
  count,
  seedOffset,
  width,
  height,
  type
) {

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const seed =
      i + seedOffset;


    /*
       Slightly non-uniform positioning.

       We don't want every part of the universe to
       contain exactly the same density.
    */

    let x =
      seededRandom(seed * 2.31) *
      width;


    let y =
      seededRandom(seed * 5.17) *
      height;


    /*
       Create some emptier regions.

       Stars that fall inside these regions have a
       chance of disappearing.
    */

    const emptyRegionA =
      Math.hypot(
        x - width * .25,
        y - height * .34
      );


    const emptyRegionB =
      Math.hypot(
        x - width * .73,
        y - height * .69
      );


    if (
      emptyRegionA < 370 &&
      seededRandom(seed * 8.4) < .62
    ) {
      continue;
    }


    if (
      emptyRegionB < 430 &&
      seededRandom(seed * 9.1) < .55
    ) {
      continue;
    }


    const sizeChance =
      seededRandom(seed * 11.4);


    const colourChance =
      seededRandom(seed * 13.7);


    const twinkleChance =
      seededRandom(seed * 17.1);


    createStar(
      layer,
      x,
      y,
      {

        tiny:
          sizeChance < .44,

        large:
          type === "near" &&
          sizeChance > .94,

        warm:
          colourChance > .975,

        cool:
          colourChance < .035,

        twinkle:
          type !== "deep" &&
          twinkleChance > .91,

        duration:
          6 +
          seededRandom(seed * 21.3) *
          8,

        opacity:
          type === "deep"
            ? .12 +
              seededRandom(seed * 25.2) *
              .24
            : undefined

      }
    );

  }

}


/* =========================================================
   STAR CLUSTERS

   These make the field feel less evenly generated.
========================================================= */

function buildCluster(
  layer,
  centreX,
  centreY,
  radiusX,
  radiusY,
  count,
  seedOffset,
  type
) {

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const seed =
      i + seedOffset;


    /*
       Multiplying two random values biases more
       stars toward the cluster centre.
    */

    const distance =
      seededRandom(seed * 3.2) *
      seededRandom(seed * 7.7);


    const angle =
      seededRandom(seed * 10.1) *
      Math.PI *
      2;


    const x =
      centreX +
      Math.cos(angle) *
      radiusX *
      distance;


    const y =
      centreY +
      Math.sin(angle) *
      radiusY *
      distance;


    const sizeChance =
      seededRandom(seed * 14.4);


    createStar(
      layer,
      x,
      y,
      {

        tiny:
          sizeChance < .66,

        large:
          type === "near" &&
          sizeChance > .985,

        twinkle:
          type !== "deep" &&
          seededRandom(seed * 18.8) > .965,

        duration:
          7 +
          seededRandom(seed * 22.4) *
          7,

        opacity:
          type === "deep"
            ? .10 +
              seededRandom(seed * 26.8) *
              .22
            : undefined

      }
    );

  }

}


/* =========================================================
   BUILD NORMAL UNIVERSE
========================================================= */

function buildUniverseStars() {

  const width =
    universe.offsetWidth;

  const height =
    universe.offsetHeight;


  starsDeep.innerHTML = "";
  starsFar.innerHTML = "";
  starsMid.innerHTML = "";
  starsNear.innerHTML = "";


  /*
     Base fields.

     Deliberately not insanely dense.
  */

  buildSparseField(
    starsDeep,
    720,
    100,
    width,
    height,
    "deep"
  );


  buildSparseField(
    starsFar,
    280,
    2000,
    width,
    height,
    "far"
  );


  buildSparseField(
    starsMid,
    115,
    4000,
    width,
    height,
    "mid"
  );


  buildSparseField(
    starsNear,
    34,
    6000,
    width,
    height,
    "near"
  );


  /*
     Irregular faint concentrations.
  */

  buildCluster(
    starsDeep,
    width * .43,
    height * .43,
    760,
    220,
    330,
    8000,
    "deep"
  );


  buildCluster(
    starsDeep,
    width * .64,
    height * .54,
    620,
    280,
    260,
    10000,
    "deep"
  );


  buildCluster(
    starsDeep,
    width * .18,
    height * .74,
    420,
    180,
    130,
    12000,
    "deep"
  );


  buildCluster(
    starsFar,
    width * .44,
    height * .44,
    650,
    220,
    95,
    14000,
    "far"
  );


  buildCluster(
    starsFar,
    width * .66,
    height * .54,
    520,
    240,
    75,
    16000,
    "far"
  );


  buildCluster(
    starsMid,
    width * .45,
    height * .44,
    480,
    180,
    24,
    18000,
    "mid"
  );

}


/* =========================================================
   CAMERA RENDERING
========================================================= */

function renderCamera() {

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


  universe.style.transform =
    `
      translate(
        calc(-50% + ${cameraX}px),
        calc(-50% + ${cameraY}px)
      )
      scale(${zoom})
    `;


  /*
     Very subtle parallax.

     The universe itself moves normally.
     Individual star layers shift by slightly
     different amounts.
  */

  starsDeep.style.transform =
    `
      translate(
        ${-cameraX * .018}px,
        ${-cameraY * .018}px
      )
    `;


  starsFar.style.transform =
    `
      translate(
        ${-cameraX * .032}px,
        ${-cameraY * .032}px
      )
    `;


  starsMid.style.transform =
    `
      translate(
        ${-cameraX * .052}px,
        ${-cameraY * .052}px
      )
    `;


  starsNear.style.transform =
    `
      translate(
        ${-cameraX * .075}px,
        ${-cameraY * .075}px
      )
    `;


  dustLayer.style.transform =
    `
      translate(
        ${-cameraX * .012}px,
        ${-cameraY * .012}px
      )
    `;

}


/* =========================================================
   CAMERA LIMITS
========================================================= */

function clampCamera() {

  /*
     Prevent Faris from dragging so far that he
     completely loses the universe.
  */

  const limitX =
    universe.offsetWidth *
    .34;


  const limitY =
    universe.offsetHeight *
    .34;


  targetX =
    Math.max(
      -limitX,
      Math.min(
        limitX,
        targetX
      )
    );


  targetY =
    Math.max(
      -limitY,
      Math.min(
        limitY,
        targetY
      )
    );

}


/* =========================================================
   TELESCOPE STAR FIELD
========================================================= */

function buildTelescopeSky() {

  telescopeStars.length = 0;


  /*
     Telescope reveals far more tiny stars than
     the naked eye.

     This is intentionally denser than the main sky.
  */

  for (
    let i = 0;
    i < 2400;
    i++
  ) {

    const x =
      (
        seededRandom(
          i * 2.13 + 40
        ) -
        .5
      ) *
      3400;


    const y =
      (
        seededRandom(
          i * 4.71 + 80
        ) -
        .5
      ) *
      2800;


    const brightness =
      .14 +
      seededRandom(
        i * 7.37 + 120
      ) *
      .6;


    const sizeRandom =
      seededRandom(
        i * 11.91 + 160
      );


    let size = .42;


    if (
      sizeRandom > .70
    ) {
      size = .62;
    }


    if (
      sizeRandom > .91
    ) {
      size = .9;
    }


    if (
      sizeRandom > .978
    ) {
      size = 1.25;
    }


    if (
      sizeRandom > .996
    ) {
      size = 1.7;
    }


    telescopeStars.push({
      x,
      y,
      size,
      brightness
    });

  }

}


/* =========================================================
   TELESCOPE CANVAS SIZE
========================================================= */

function resizeTelescopeCanvas() {

  const rect =
    eyepiece.getBoundingClientRect();


  if (
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return;
  }


  const pixelRatio =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  telescopeCanvas.width =
    Math.round(
      rect.width *
      pixelRatio
    );


  telescopeCanvas.height =
    Math.round(
      rect.height *
      pixelRatio
    );


  telescopeContext.setTransform(
    pixelRatio,
    0,
    0,
    pixelRatio,
    0,
    0
  );

}


/* =========================================================
   DRAW TELESCOPE STAR
========================================================= */

function drawTelescopeStar(
  x,
  y,
  radius,
  brightness
) {

  telescopeContext.beginPath();


  telescopeContext.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );


  telescopeContext.fillStyle =
    `rgba(
      231,
      239,
      251,
      ${brightness}
    )`;


  telescopeContext.fill();

}


/* =========================================================
   BRIGHT TELESCOPE STAR
========================================================= */

function drawBrightTelescopeStar(
  x,
  y,
  radius,
  brightness,
  glowStrength
) {

  /*
     Very subtle optical glow.
  */

  if (
    glowStrength > 0
  ) {

    const glow =
      telescopeContext
        .createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          12 + radius * 3
        );


    glow.addColorStop(
      0,
      `rgba(
        210,
        229,
        255,
        ${.17 * glowStrength}
      )`
    );


    glow.addColorStop(
      .28,
      `rgba(
        179,
        210,
        249,
        ${.07 * glowStrength}
      )`
    );


    glow.addColorStop(
      1,
      "rgba(150,190,240,0)"
    );


    telescopeContext.beginPath();


    telescopeContext.arc(
      x,
      y,
      12 + radius * 3,
      0,
      Math.PI * 2
    );


    telescopeContext.fillStyle =
      glow;


    telescopeContext.fill();

  }


  drawTelescopeStar(
    x,
    y,
    radius,
    brightness
  );

}


/* =========================================================
   ORION — TELESCOPE GEOMETRY

   Simplified Orion geometry for the search stage.

   We can refine the astronomical proportions later.
========================================================= */

const telescopeOrionStars = [

  /*
     shoulders
  */

  {
    x: -58,
    y: -72,
    size: 1.9
  },

  {
    x: 58,
    y: -60,
    size: 1.7
  },


  /*
     belt
  */

  {
    x: -25,
    y: 0,
    size: 1.45
  },

  {
    x: 0,
    y: 3,
    size: 1.55
  },

  {
    x: 26,
    y: 7,
    size: 1.4
  },


  /*
     sword
  */

  {
    x: -1,
    y: 42,
    size: 1.05
  },

  {
    x: -2,
    y: 67,
    size: .9
  },


  /*
     feet
  */

  {
    x: -46,
    y: 105,
    size: 1.55
  },

  {
    x: 64,
    y: 108,
    size: 2.05
  }

];


/* =========================================================
   DRAW ORION IN TELESCOPE
========================================================= */

function drawTelescopeOrion(
  width,
  height
) {

  const centreX =
    width / 2 +
    ORION_TELESCOPE_X -
    telescopeX;


  const centreY =
    height / 2 +
    ORION_TELESCOPE_Y -
    telescopeY;


  const distance =
    Math.hypot(
      telescopeX -
      ORION_TELESCOPE_X,

      telescopeY -
      ORION_TELESCOPE_Y
    );


  /*
     Hot/cold system.

     No arrows.
     No giant glowing circle.

     Orion simply starts behaving a little
     differently as Faris gets closer.
  */

  let intensity = .24;


  if (
    distance < 400
  ) {
    intensity = .35;
  }


  if (
    distance < 300
  ) {
    intensity = .48;
  }


  if (
    distance < 210
  ) {
    intensity = .68;
  }


  if (
    distance < 125
  ) {
    intensity = .88;
  }


  if (
    distance < 75
  ) {
    intensity = 1;
  }


  telescopeOrionStars.forEach(
    (star, index) => {

      const x =
        centreX +
        star.x;


      const y =
        centreY +
        star.y;


      /*
         Tiny shimmer while close.

         Each star gets a slightly different phase.
      */

      let shimmer = 1;


      if (
        distance < 210
      ) {

        shimmer =
          1 +
          Math.sin(
            performance.now() /
            480 +
            index *
            .9
          ) *
          .10;

      }


      drawBrightTelescopeStar(
        x,
        y,

        star.size *
        (
          .82 +
          intensity *
          .48
        ) *
        shimmer,

        .35 +
        intensity *
        .62,

        distance < 210
          ? intensity
          : 0
      );

    }
  );

}


/* =========================================================
   TELESCOPE SKY TEXTURE

   Very faint unresolved stars.

   This helps telescope mode feel optically richer
   without becoming a giant fantasy nebula.
========================================================= */

function drawTelescopeDust(
  width,
  height
) {

  /*
     Subtle central blue-grey lift.
  */

  const gradient =
    telescopeContext
      .createRadialGradient(
        width * .44,
        height * .42,
        0,
        width * .5,
        height * .5,
        width * .62
      );


  gradient.addColorStop(
    0,
    "rgba(23,38,58,.075)"
  );


  gradient.addColorStop(
    .45,
    "rgba(8,19,33,.035)"
  );


  gradient.addColorStop(
    1,
    "rgba(0,3,8,0)"
  );


  telescopeContext.fillStyle =
    gradient;


  telescopeContext.fillRect(
    0,
    0,
    width,
    height
  );

}


/* =========================================================
   RENDER TELESCOPE
========================================================= */

function renderTelescope() {

  if (
    !telescopeActive
  ) {
    return;
  }


  const rect =
    eyepiece.getBoundingClientRect();


  const width =
    rect.width;


  const height =
    rect.height;


  if (
    width <= 0 ||
    height <= 0
  ) {
    return;
  }


  telescopeX +=
    (
      targetTelescopeX -
      telescopeX
    ) *
    .12;


  telescopeY +=
    (
      targetTelescopeY -
      telescopeY
    ) *
    .12;


  /*
     Clear previous frame.
  */

  telescopeContext.clearRect(
    0,
    0,
    width,
    height
  );


  /*
     Dark telescope sky.
  */

  telescopeContext.fillStyle =
    "#00040a";


  telescopeContext.fillRect(
    0,
    0,
    width,
    height
  );


  drawTelescopeDust(
    width,
    height
  );


  /*
     Detailed telescope stars.
  */

  telescopeStars.forEach(
    star => {

      const x =
        width / 2 +
        star.x -
        telescopeX;


      const y =
        height / 2 +
        star.y -
        telescopeY;


      /*
         Don't draw anything far outside
         the circular canvas area.
      */

      if (
        x < -15 ||
        x > width + 15 ||
        y < -15 ||
        y > height + 15
      ) {
        return;
      }


      drawTelescopeStar(
        x,
        y,
        star.size,
        star.brightness
      );

    }
  );


  /*
     Hidden Orion.
  */

  if (
    !orionDiscovered
  ) {

    drawTelescopeOrion(
      width,
      height
    );

  }

}


/* =========================================================
   TELESCOPE ON / OFF
========================================================= */

function setTelescope(active) {

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


  telescopeView.setAttribute(
    "aria-hidden",
    active
      ? "false"
      : "true"
  );


  if (
    active
  ) {

    /*
       Start telescope at a neutral position.

       Orion is deliberately not centred.
    */

    telescopeX = 0;
    telescopeY = 0;

    targetTelescopeX = 0;
    targetTelescopeY = 0;


    focusStartedAt =
      null;


    telescopeDragging =
      false;


    requestAnimationFrame(
      () => {

        resizeTelescopeCanvas();

      }
    );

  }


  else {

    telescopeDragging =
      false;


    focusStartedAt =
      null;

  }

}


/* =========================================================
   TELESCOPE BUTTON
========================================================= */

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
   ORION FOCUS CHECK
========================================================= */

function checkTelescopeFocus(
  timestamp
) {

  if (
    !telescopeActive ||
    orionDiscovered
  ) {

    focusStartedAt =
      null;

    return;

  }


  const distance =
    Math.hypot(
      telescopeX -
      ORION_TELESCOPE_X,

      telescopeY -
      ORION_TELESCOPE_Y
    );


  /*
     Orion isn't centred closely enough.
  */

  if (
    distance > 115
  ) {

    focusStartedAt =
      null;

    return;

  }


  /*
     If telescope is still being moved,
     don't count it as focusing.
  */

  if (
    telescopeDragging
  ) {

    focusStartedAt =
      null;

    return;

  }


  /*
     Start focus timer.
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


  /*
     Hold Orion steady for 1.8 seconds.
  */

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


  /*
     Reveal Orion in normal universe.
  */

  orion.classList.add(
    "discovered"
  );


  discoveryNumber.textContent =
    "1";


  /*
     Show discovery message.
  */

  discoveryMessage.classList.add(
    "show"
  );


  /*
     First remove telescope mode so the user
     sees Orion awaken in the actual universe.
  */

  setTimeout(
    () => {

      setTelescope(false);

    },
    650
  );


  /*
     Hide discovery title after a few seconds.
  */

  setTimeout(
    () => {

      discoveryMessage.classList.remove(
        "show"
      );

    },
    3900
  );

}


/* =========================================================
   POINTER DOWN
========================================================= */

app.addEventListener(
  "pointerdown",
  event => {

    /*
       Let the telescope button handle itself.
    */

    if (
      event.target.closest(
        "#telescopeButton"
      )
    ) {
      return;
    }


    activePointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY
      }
    );


    /* =====================================================
       TELESCOPE DRAG
    ====================================================== */

    if (
      telescopeActive
    ) {

      telescopeDragging =
        true;


      previousTelescopeX =
        event.clientX;


      previousTelescopeY =
        event.clientY;


      try {

        app.setPointerCapture(
          event.pointerId
        );

      }

      catch (error) {
        /*
           Some browsers don't require capture.
        */
      }


      return;

    }


    /* =====================================================
       NORMAL UNIVERSE DRAG
    ====================================================== */

    if (
      activePointers.size === 1
    ) {

      universeDragging =
        true;


      dragStartX =
        event.clientX;


      dragStartY =
        event.clientY;


      dragCameraStartX =
        targetX;


      dragCameraStartY =
        targetY;


      app.classList.add(
        "dragging"
      );


      try {

        app.setPointerCapture(
          event.pointerId
        );

      }

      catch (error) {
        /*
           Safe fallback.
        */
      }

    }


    /* =====================================================
       PINCH START
    ====================================================== */

    if (
      activePointers.size === 2
    ) {

      universeDragging =
        false;


      app.classList.remove(
        "dragging"
      );


      const points =
        Array.from(
          activePointers.values()
        );


      pinchStartDistance =
        Math.hypot(
          points[1].x -
          points[0].x,

          points[1].y -
          points[0].y
        );


      pinchStartZoom =
        targetZoom;

    }

  }
);


/* =========================================================
   POINTER MOVE
========================================================= */

app.addEventListener(
  "pointermove",
  event => {

    if (
      activePointers.has(
        event.pointerId
      )
    ) {

      activePointers.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY
        }
      );

    }


    /* =====================================================
       MOVE TELESCOPE SKY
    ====================================================== */

    if (
      telescopeActive &&
      telescopeDragging
    ) {

      const dx =
        event.clientX -
        previousTelescopeX;


      const dy =
        event.clientY -
        previousTelescopeY;


      /*
         The eyepiece stays fixed.

         We reposition where the telescope is
         pointing in the universe.
      */

      targetTelescopeX -=
        dx * 1.25;


      targetTelescopeY -=
        dy * 1.25;


      previousTelescopeX =
        event.clientX;


      previousTelescopeY =
        event.clientY;


      /*
         Keep telescope within the generated
         searchable sky.
      */

      targetTelescopeX =
        Math.max(
          -1300,
          Math.min(
            1300,
            targetTelescopeX
          )
        );


      targetTelescopeY =
        Math.max(
          -1000,
          Math.min(
            1000,
            targetTelescopeY
          )
        );


      /*
         Movement resets the focus timer.
      */

      focusStartedAt =
        null;


      return;

    }


    /* =====================================================
       PINCH ZOOM
    ====================================================== */

    if (
      !telescopeActive &&
      activePointers.size === 2
    ) {

      const points =
        Array.from(
          activePointers.values()
        );


      const currentDistance =
        Math.hypot(
          points[1].x -
          points[0].x,

          points[1].y -
          points[0].y
        );


      if (
        pinchStartDistance > 0
      ) {

        const ratio =
          currentDistance /
          pinchStartDistance;


        targetZoom =
          Math.max(
            MIN_ZOOM,
            Math.min(
              MAX_ZOOM,
              pinchStartZoom *
              ratio
            )
          );

      }


      return;

    }


    /* =====================================================
       NORMAL UNIVERSE DRAG
    ====================================================== */

    if (
      !telescopeActive &&
      universeDragging
    ) {

      const dx =
        event.clientX -
        dragStartX;


      const dy =
        event.clientY -
        dragStartY;


      targetX =
        dragCameraStartX +
        dx;


      targetY =
        dragCameraStartY +
        dy;


      clampCamera();

    }

  }
);


/* =========================================================
   END POINTER
========================================================= */

function endPointer(event) {

  activePointers.delete(
    event.pointerId
  );


  if (
    telescopeActive
  ) {

    telescopeDragging =
      false;

  }


  if (
    activePointers.size === 0
  ) {

    universeDragging =
      false;


    app.classList.remove(
      "dragging"
    );


    pinchStartDistance =
      0;

  }


  /*
     If one finger remains after a pinch,
     reset the normal drag origin.
  */

  if (
    !telescopeActive &&
    activePointers.size === 1
  ) {

    const remaining =
      Array.from(
        activePointers.values()
      )[0];


    dragStartX =
      remaining.x;


    dragStartY =
      remaining.y;


    dragCameraStartX =
      targetX;


    dragCameraStartY =
      targetY;


    universeDragging =
      true;

  }

}


app.addEventListener(
  "pointerup",
  endPointer
);


app.addEventListener(
  "pointercancel",
  endPointer
);


/* =========================================================
   DESKTOP WHEEL ZOOM
========================================================= */

app.addEventListener(
  "wheel",
  event => {

    if (
      telescopeActive
    ) {
      return;
    }


    event.preventDefault();


    const zoomAmount =
      -event.deltaY *
      .001;


    targetZoom +=
      zoomAmount;


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
   REMOVE NAVIGATION HINT AFTER INTERACTION
========================================================= */

let hintHasHidden = false;


function hideNavigationHint() {

  if (
    hintHasHidden
  ) {
    return;
  }


  hintHasHidden =
    true;


  navigationHint.classList.add(
    "hidden"
  );

}


app.addEventListener(
  "pointerdown",
  event => {

    if (
      event.target.closest(
        "#telescopeButton"
      )
    ) {
      return;
    }


    hideNavigationHint();

  },
  {
    once: true
  }
);


app.addEventListener(
  "wheel",
  hideNavigationHint,
  {
    once: true
  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    /*
       CSS may resize the universe at tablet /
       phone breakpoints, so rebuild its procedural
       stars using the new dimensions.
    */

    buildUniverseStars();


    if (
      telescopeActive
    ) {

      requestAnimationFrame(
        resizeTelescopeCanvas
      );

    }

  }
);


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate(timestamp) {

  renderCamera();


  renderTelescope();


  checkTelescopeFocus(
    timestamp
  );


  requestAnimationFrame(
    animate
  );

}


/* =========================================================
   INITIALISE
========================================================= */

function initialise() {

  /*
     Build both versions of the sky.
  */

  buildUniverseStars();

  buildTelescopeSky();


  /*
     Start camera centred on Orion's general
     region without making Orion obvious.
  */

  cameraX = 0;
  cameraY = 0;

  targetX = 0;
  targetY = 0;

  zoom = 1;
  targetZoom = 1;


  /*
     Make sure telescope begins closed.
  */

  setTelescope(false);


  /*
     Start animation.
  */

  requestAnimationFrame(
    animate
  );

}


initialise();
