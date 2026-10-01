/* =========================================================
   OUR LITTLE UNIVERSE
   Anniversary 2026

   main.js

   TELESCOPE VERSION:
   - normal universe can pan + zoom
   - telescope itself MOVES
   - desktop: follows mouse
   - iPad/phone: drag telescope around
   - release finger = telescope stays there
   - surrounding screen darkens
   - telescope canvas renders detailed stars
   - Orion reacts when telescope reaches it
   - hold over Orion to discover
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const app = document.getElementById("app");
const universe = document.getElementById("universe");

const dustLayer = document.getElementById("dustLayer");

const starsDeep = document.getElementById("starsDeep");
const starsFar = document.getElementById("starsFar");
const starsMid = document.getElementById("starsMid");
const starsNear = document.getElementById("starsNear");

const orion = document.getElementById("orion");

const telescopeView = document.getElementById("telescopeView");
const eyepiece = document.getElementById("eyepiece");
const telescopeCanvas = document.getElementById("telescopeCanvas");

const telescopeButton = document.getElementById("telescopeButton");

const navigationHint = document.getElementById("navigationHint");
const hintMain = document.getElementById("hintMain");
const hintSub = document.getElementById("hintSub");

const discoveryMessage = document.getElementById("discoveryMessage");
const discoveryNumber = document.getElementById("discoveryNumber");

const telescopeContext = telescopeCanvas.getContext("2d");


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
   TOUCH / PINCH
========================================================= */

const activePointers = new Map();

let pinchStartDistance = 0;
let pinchStartZoom = 1;


/* =========================================================
   DEVICE TYPE
========================================================= */

const finePointer =
  window.matchMedia("(pointer: fine)").matches;


/* =========================================================
   TELESCOPE STATE
========================================================= */

let telescopeActive = false;

/*
   These are SCREEN coordinates.

   This is important.

   The telescope now moves around the screen instead of
   moving an imaginary telescope camera behind a fixed circle.
*/

let lensX = window.innerWidth / 2;
let lensY = window.innerHeight / 2;

let targetLensX = lensX;
let targetLensY = lensY;

let telescopeDragging = false;


/* =========================================================
   ORION SEARCH LOCATION

   Orion has an actual location on the screen because the
   real hidden Orion element exists in the universe.

   We calculate its current screen position every frame.
========================================================= */

let orionScreenX = window.innerWidth / 2;
let orionScreenY = window.innerHeight / 2;


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
========================================================= */

function seededRandom(seed) {

  const value =
    Math.sin(seed * 91.3458) *
    47453.5453;

  return value - Math.floor(value);

}


/* =========================================================
   NORMAL STAR CREATION
========================================================= */

function createStar(
  layer,
  x,
  y,
  options = {}
) {

  const star =
    document.createElement("span");

  star.className = "sky-star";


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


  star.style.left = `${x}px`;
  star.style.top = `${y}px`;


  if (options.opacity !== undefined) {

    star.style.opacity =
      options.opacity;

  }


  layer.appendChild(star);

}


/* =========================================================
   SPARSE STAR FIELD
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


    const x =
      seededRandom(seed * 2.31) *
      width;


    const y =
      seededRandom(seed * 5.17) *
      height;


    /*
       Leave some negative space so the sky doesn't
       look like evenly distributed confetti.
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
   CAMERA
========================================================= */

function renderCamera() {

  cameraX +=
    (targetX - cameraX) *
    CAMERA_EASING;


  cameraY +=
    (targetY - cameraY) *
    CAMERA_EASING;


  zoom +=
    (targetZoom - zoom) *
    ZOOM_EASING;


  universe.style.transform =
    `
      translate(
        calc(-50% + ${cameraX}px),
        calc(-50% + ${cameraY}px)
      )
      scale(${zoom})
    `;


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
   BUILD TELESCOPE STAR FIELD
========================================================= */

function buildTelescopeSky() {

  telescopeStars.length = 0;


  for (
    let i = 0;
    i < 1900;
    i++
  ) {

    /*
       These are relative offsets around the
       telescope view.

       The telescope sky should feel denser than
       the naked-eye universe.
    */

    const x =
      (
        seededRandom(
          i * 2.13 + 40
        ) -
        .5
      ) *
      1200;


    const y =
      (
        seededRandom(
          i * 4.71 + 80
        ) -
        .5
      ) *
      900;


    const brightness =
      .10 +
      seededRandom(
        i * 7.37 + 120
      ) *
      .55;


    const sizeRandom =
      seededRandom(
        i * 11.91 + 160
      );


    let size = .42;


    if (sizeRandom > .70) {
      size = .62;
    }


    if (sizeRandom > .91) {
      size = .9;
    }


    if (sizeRandom > .978) {
      size = 1.2;
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
   BASIC TELESCOPE STAR
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
    `rgba(231,239,251,${brightness})`;


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
        ${.16 * glowStrength}
      )`
    );


    glow.addColorStop(
      .3,
      `rgba(
        179,
        210,
        249,
        ${.06 * glowStrength}
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
   ORION GEOMETRY INSIDE TELESCOPE
========================================================= */

const telescopeOrionStars = [

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
   GET ORION SCREEN POSITION
========================================================= */

function updateOrionScreenPosition() {

  if (!orion) {
    return;
  }


  const rect =
    orion.getBoundingClientRect();


  orionScreenX =
    rect.left +
    rect.width / 2;


  orionScreenY =
    rect.top +
    rect.height / 2;

}


/* =========================================================
   DISTANCE FROM LENS TO ORION
========================================================= */

function getLensDistanceToOrion() {

  return Math.hypot(
    lensX - orionScreenX,
    lensY - orionScreenY
  );

}


/* =========================================================
   DRAW ORION IN THE TELESCOPE

   Orion only becomes noticeable when the lens is
   actually near Orion's location in the universe.
========================================================= */

function drawTelescopeOrion(
  width,
  height
) {

  if (orionDiscovered) {
    return;
  }


  const distance =
    getLensDistanceToOrion();


  /*
     If the telescope isn't anywhere near Orion,
     don't draw Orion at all.
  */

  if (
    distance > 320
  ) {
    return;
  }


  let intensity = .12;


  if (
    distance < 260
  ) {
    intensity = .20;
  }


  if (
    distance < 200
  ) {
    intensity = .32;
  }


  if (
    distance < 145
  ) {
    intensity = .48;
  }


  if (
    distance < 95
  ) {
    intensity = .72;
  }


  if (
    distance < 55
  ) {
    intensity = 1;
  }


  /*
     Orion moves relative to the telescope.

     If the telescope is slightly left of Orion,
     Orion appears slightly right of centre inside
     the eyepiece, and vice versa.
  */

  const offsetScale = .55;


  const centreX =
    width / 2 +
    (
      orionScreenX -
      lensX
    ) *
    offsetScale;


  const centreY =
    height / 2 +
    (
      orionScreenY -
      lensY
    ) *
    offsetScale;


  telescopeOrionStars.forEach(
    (star, index) => {

      let shimmer = 1;


      if (
        distance < 145
      ) {

        shimmer =
          1 +
          Math.sin(
            performance.now() /
            470 +
            index *
            .9
          ) *
          .10;

      }


      drawBrightTelescopeStar(
        centreX + star.x,
        centreY + star.y,

        star.size *
        (
          .8 +
          intensity *
          .5
        ) *
        shimmer,

        .20 +
        intensity *
        .78,

        distance < 145
          ? intensity
          : 0
      );

    }
  );

}


/* =========================================================
   DRAW TELESCOPE BACKGROUND
========================================================= */

function drawTelescopeBackground(
  width,
  height
) {

  telescopeContext.fillStyle =
    "#07111d";


  telescopeContext.fillRect(
    0,
    0,
    width,
    height
  );


  /*
     Extremely restrained optical depth.
  */

  const gradient =
    telescopeContext
      .createRadialGradient(
        width * .43,
        height * .38,
        0,

        width * .5,
        height * .5,
        width * .7
      );


  gradient.addColorStop(
    0,
    "rgba(29,45,65,.10)"
  );


  gradient.addColorStop(
    .55,
    "rgba(8,18,31,.035)"
  );


  gradient.addColorStop(
    1,
    "rgba(0,2,7,0)"
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
   DRAW TELESCOPE SKY

   The star pattern shifts according to the actual
   screen position of the telescope.

   This prevents the stars from looking glued to
   the moving circle.
========================================================= */

function drawTelescopeSky(
  width,
  height
) {

  const fieldOffsetX =
    lensX * .52;


  const fieldOffsetY =
    lensY * .52;


  telescopeStars.forEach(
    star => {

      /*
         Wrap the generated telescope field.

         This gives us a continuous field as the
         telescope moves around.
      */

      let x =
        width / 2 +
        star.x -
        fieldOffsetX;


      let y =
        height / 2 +
        star.y -
        fieldOffsetY;


      const wrapWidth = 1200;
      const wrapHeight = 900;


      x =
        (
          (
            x +
            wrapWidth * 10
          ) %
          wrapWidth
        );


      y =
        (
          (
            y +
            wrapHeight * 10
          ) %
          wrapHeight
        );


      /*
         Re-centre wrapped coordinates around
         the current eyepiece.
      */

      if (
        x >
        width + 100
      ) {

        x -= wrapWidth;

      }


      if (
        y >
        height + 100
      ) {

        y -= wrapHeight;

      }


      if (
        x < -20 ||
        x > width + 20 ||
        y < -20 ||
        y > height + 20
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


  /*
     Smooth movement.
  */

  lensX +=
    (
      targetLensX -
      lensX
    ) *
    .18;


  lensY +=
    (
      targetLensY -
      lensY
    ) *
    .18;


  /*
     Move the actual telescope element.
  */

  eyepiece.style.left =
    `${lensX}px`;


  eyepiece.style.top =
    `${lensY}px`;


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


  telescopeContext.clearRect(
    0,
    0,
    width,
    height
  );


  drawTelescopeBackground(
    width,
    height
  );


  drawTelescopeSky(
    width,
    height
  );


  drawTelescopeOrion(
    width,
    height
  );

}


/* =========================================================
   KEEP TELESCOPE ON SCREEN
========================================================= */

function clampLensPosition(
  x,
  y
) {

  const rect =
    eyepiece.getBoundingClientRect();


  const radius =
    Math.max(
      rect.width / 2,
      90
    );


  const padding = 14;


  return {

    x:
      Math.max(
        radius + padding,
        Math.min(
          window.innerWidth -
          radius -
          padding,
          x
        )
      ),

    y:
      Math.max(
        radius + padding,
        Math.min(
          window.innerHeight -
          radius -
          padding,
          y
        )
      )

  };

}


/* =========================================================
   MOVE TELESCOPE TO SCREEN POSITION
========================================================= */

function moveLensTo(
  x,
  y
) {

  const position =
    clampLensPosition(
      x,
      y
    );


  targetLensX =
    position.x;


  targetLensY =
    position.y;


  /*
     Moving the telescope resets discovery hold.
  */

  focusStartedAt =
    null;

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
       Telescope begins in the middle of the screen.
    */

    lensX =
      window.innerWidth / 2;


    lensY =
      window.innerHeight / 2;


    targetLensX =
      lensX;


    targetLensY =
      lensY;


    telescopeDragging =
      false;


    focusStartedAt =
      null;


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
   DESKTOP TELESCOPE FOLLOW
========================================================= */

window.addEventListener(
  "pointermove",
  event => {

    if (
      !telescopeActive
    ) {
      return;
    }


    /*
       Mouse / trackpad devices:
       telescope follows pointer.

       Touch devices are handled separately below.
    */

    if (
      finePointer &&
      event.pointerType !== "touch"
    ) {

      moveLensTo(
        event.clientX,
        event.clientY
      );

    }

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
    getLensDistanceToOrion();


  /*
     Telescope must be positioned close to Orion.
  */

  if (
    distance > 75
  ) {

    focusStartedAt =
      null;

    return;

  }


  /*
     On touch devices, don't discover while
     the finger is still dragging the lens.
  */

  if (
    telescopeDragging
  ) {

    focusStartedAt =
      null;

    return;

  }


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


  orion.classList.add(
    "discovered"
  );


  discoveryNumber.textContent =
    "1";


  discoveryMessage.classList.add(
    "show"
  );


  /*
     Keep telescope on Orion briefly before
     returning to the full universe.
  */

  setTimeout(
    () => {

      setTelescope(false);

    },
    800
  );


  setTimeout(
    () => {

      discoveryMessage.classList.remove(
        "show"
      );

    },
    4000
  );

}


/* =========================================================
   POINTER DOWN
========================================================= */

app.addEventListener(
  "pointerdown",
  event => {

    /*
       Telescope button handles itself.
    */

    if (
      event.target.closest(
        "#telescopeButton"
      )
    ) {
      return;
    }


    /* =====================================================
       TELESCOPE TOUCH DRAG
    ====================================================== */

    if (
      telescopeActive
    ) {

      /*
         On iPad / phone, touching anywhere in the
         telescope screen moves the lens to the finger
         and starts dragging it.
      */

      if (
        event.pointerType === "touch" ||
        !finePointer
      ) {

        telescopeDragging =
          true;


        moveLensTo(
          event.clientX,
          event.clientY
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


      return;

    }


    /* =====================================================
       NORMAL UNIVERSE
    ====================================================== */

    activePointers.set(
      event.pointerId,
      {
        x: event.clientX,
        y: event.clientY
      }
    );


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

    /* =====================================================
       TELESCOPE TOUCH MOVEMENT
    ====================================================== */

    if (
      telescopeActive
    ) {

      if (
        telescopeDragging &&
        (
          event.pointerType === "touch" ||
          !finePointer
        )
      ) {

        moveLensTo(
          event.clientX,
          event.clientY
        );

      }


      return;

    }


    /* =====================================================
       NORMAL UNIVERSE
    ====================================================== */

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


    /*
       Pinch zoom
    */

    if (
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


    /*
       Normal drag
    */

    if (
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
   POINTER END
========================================================= */

function endPointer(event) {

  if (
    telescopeActive
  ) {

    telescopeDragging =
      false;


    /*
       IMPORTANT:
       We do NOT return the telescope to centre.

       It stays exactly where Faris leaves it.
    */

    return;

  }


  activePointers.delete(
    event.pointerId
  );


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


  if (
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
   NAVIGATION HINT
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

    buildUniverseStars();


    if (
      telescopeActive
    ) {

      lensX =
        window.innerWidth / 2;


      lensY =
        window.innerHeight / 2;


      targetLensX =
        lensX;


      targetLensY =
        lensY;


      requestAnimationFrame(
        resizeTelescopeCanvas
      );

    }

  }
);


/* =========================================================
   ANIMATION
========================================================= */

function animate(timestamp) {

  renderCamera();


  updateOrionScreenPosition();


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

  buildUniverseStars();

  buildTelescopeSky();


  cameraX = 0;
  cameraY = 0;

  targetX = 0;
  targetY = 0;

  zoom = 1;
  targetZoom = 1;


  setTelescope(false);


  requestAnimationFrame(
    animate
  );

}


initialise();

/* =========================================================
   IPAD / TOUCH TELESCOPE MOVEMENT FIX
========================================================= */

let telescopeTouchId = null;

telescopeView.addEventListener(
  "pointerdown",
  event => {

    if (!telescopeActive) return;

    if (event.pointerType !== "touch") return;

    telescopeTouchId = event.pointerId;
    telescopeDragging = true;

    moveLensTo(
      event.clientX,
      event.clientY
    );

    try {
      telescopeView.setPointerCapture(
        event.pointerId
      );
    } catch (error) {}

    event.preventDefault();
  }
);


telescopeView.addEventListener(
  "pointermove",
  event => {

    if (!telescopeActive) return;

    if (
      event.pointerId !== telescopeTouchId
    ) {
      return;
    }

    moveLensTo(
      event.clientX,
      event.clientY
    );

    event.preventDefault();
  }
);


function finishTelescopeTouch(event) {

  if (
    event.pointerId !== telescopeTouchId
  ) {
    return;
  }

  telescopeDragging = false;
  telescopeTouchId = null;

  /*
     Do NOT reset lensX/lensY.
     The telescope stays wherever it was released.
  */
}


telescopeView.addEventListener(
  "pointerup",
  finishTelescopeTouch
);


telescopeView.addEventListener(
  "pointercancel",
  finishTelescopeTouch
);
