/* =========================================================
   OUR LITTLE UNIVERSE
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

const orionStarCanvas =
  document.getElementById("orionStarCanvas");

const orionStarCtx =
  orionStarCanvas.getContext("2d");

const virgo =
  document.getElementById("virgo");

const virgoStarCanvas =
  document.getElementById("virgoStarCanvas");

const virgoStarCtx =
  virgoStarCanvas.getContext("2d");

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

const discoveryMessage =
  document.getElementById("discoveryMessage");

const discoveryNumber =
  document.getElementById("discoveryNumber");

const orionChapterIntro =
  document.getElementById(
    "orionChapterIntro"
  );

const ctx =
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

const MIN_ZOOM = .62;
const MAX_ZOOM = 1.9;

const CAMERA_EASING = .105;
const ZOOM_EASING = .09;


/* =========================================================
   INPUT
========================================================= */

const activePointers =
  new Map();

let universeDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let dragCameraStartX = 0;
let dragCameraStartY = 0;

let pinchStartDistance = 0;
let pinchStartZoom = 1;


/* =========================================================
   TELESCOPE
========================================================= */

let telescopeActive = false;
let telescopeDragging = false;
let telescopePointerId = null;

let lensX =
  window.innerWidth / 2;

let lensY =
  window.innerHeight / 2;

let targetLensX = lensX;
let targetLensY = lensY;


/* =========================================================
   ORION DISCOVERY
========================================================= */

let orionScreenX =
  window.innerWidth / 2;

let orionScreenY =
  window.innerHeight / 2;

let orionDiscovered = false;

let orionRevealStarted = false;

let orionRevealStartTime = 0;

const ORION_LINE_DURATION = 420;
const ORION_LINE_PAUSE = 90;

let focusStartedAt = null;

const HOLD_TO_DISCOVER = 1800;


/* =========================================================
   RANDOM
========================================================= */

function seededRandom(seed) {

  const value =
    Math.sin(
      seed * 91.3458
    ) *
    47453.5453;

  return (
    value -
    Math.floor(value)
  );
}


/* =========================================================
   NORMAL STAR FIELD
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

if (options.blue) {
  star.classList.add("blue");
}

if (options.orange) {
  star.classList.add("orange");
}

if (options.cream) {
  star.classList.add("cream");
}

  if (options.twinkle) {

    star.classList.add(
      "twinkle"
    );

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
    options.opacity !==
    undefined
  ) {
    star.style.opacity =
      options.opacity;
  }

  layer.appendChild(star);
}


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
      seededRandom(
        seed * 2.31
      ) *
      width;

    const y =
      seededRandom(
        seed * 5.17
      ) *
      height;

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
      seededRandom(
        seed * 8.4
      ) < .62
    ) {
      continue;
    }

    if (
      emptyRegionB < 430 &&
      seededRandom(
        seed * 9.1
      ) < .55
    ) {
      continue;
    }

    const sizeChance =
      seededRandom(
        seed * 11.4
      );

    const colourChance =
      seededRandom(
        seed * 13.7
      );

    const twinkleChance =
      seededRandom(
        seed * 17.1
      );

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

       /*
  Most stars remain white.

  The coloured stars are deliberately
  uncommon so the field still looks
  natural rather than rainbow-like.
*/

orange:
  colourChance > .985,

warm:
  colourChance > .945 &&
  colourChance <= .985,

cream:
  colourChance > .885 &&
  colourChance <= .945,

blue:
  colourChance < .025,

cool:
  colourChance >= .025 &&
  colourChance < .085,
         
        twinkle:
          type !== "deep" &&
          twinkleChance > .91,

        duration:
          6 +
          seededRandom(
            seed * 21.3
          ) *
          8,

        opacity:
          type === "deep"
            ? .12 +
              seededRandom(
                seed * 25.2
              ) *
              .24
            : undefined
      }
    );
  }
}


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
      seededRandom(
        seed * 3.2
      ) *
      seededRandom(
        seed * 7.7
      );

    const angle =
      seededRandom(
        seed * 10.1
      ) *
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
      seededRandom(
        seed * 14.4
      );

     const colourChance =
        seededRandom(
           seed * 16.7
        );

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

         orange:
            colourChance > .992,
         
         warm:
            colourChance > .962 &&
            colourChance <= .992,
         
         cream:
            colourChance > .91 &&
            colourChance <= .962,
         
         blue:
            colourChance < .018,
         
         cool:
            colourChance >= .018 &&
            colourChance < .065,

        twinkle:
          type !== "deep" &&
          seededRandom(
            seed * 18.8
          ) > .965,

        duration:
          7 +
          seededRandom(
            seed * 22.4
          ) *
          7,

        opacity:
          type === "deep"
            ? .10 +
              seededRandom(
                seed * 26.8
              ) *
              .22
            : undefined
      }
    );
  }
}


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

  universe.style.transform = `
    translate(
      calc(-50% + ${cameraX}px),
      calc(-50% + ${cameraY}px)
    )
    scale(${zoom})
  `;

  starsDeep.style.transform = `
    translate(
      ${-cameraX * .018}px,
      ${-cameraY * .018}px
    )
  `;

  starsFar.style.transform = `
    translate(
      ${-cameraX * .032}px,
      ${-cameraY * .032}px
    )
  `;

  starsMid.style.transform = `
    translate(
      ${-cameraX * .052}px,
      ${-cameraY * .052}px
    )
  `;

  starsNear.style.transform = `
    translate(
      ${-cameraX * .075}px,
      ${-cameraY * .075}px
    )
  `;

  dustLayer.style.transform = `
    translate(
      ${-cameraX * .012}px,
      ${-cameraY * .012}px
    )
  `;
}


/* =========================================================
   TELESCOPE CANVAS
========================================================= */

function resizeTelescopeCanvas() {

  const rect =
    eyepiece
      .getBoundingClientRect();

  if (
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return;
  }

  const dpr =
    Math.min(
      window.devicePixelRatio ||
      1,
      2
    );

  telescopeCanvas.width =
    Math.round(
      rect.width *
      dpr
    );

  telescopeCanvas.height =
    Math.round(
      rect.height *
      dpr
    );

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}


/* =========================================================
   TELESCOPE BACKGROUND STARS
========================================================= */

const telescopeStars = [];


function buildTelescopeStars() {

  telescopeStars.length = 0;

  for (
    let i = 0;
    i < 1500;
    i++
  ) {

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
      .50;

    const chance =
      seededRandom(
        i * 11.91 + 160
      );

    let size = .42;

    if (
      chance > .70
    ) {
      size = .62;
    }

    if (
      chance > .91
    ) {
      size = .9;
    }

    if (
      chance > .978
    ) {
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
   ORDINARY TELESCOPE STAR
========================================================= */

function drawStar(
  x,
  y,
  radius,
  brightness
) {

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    `rgba(
      231,
      239,
      251,
      ${brightness}
    )`;

  ctx.fill();
}


/* =========================================================
   SHARED BRIGHT CONSTELLATION STAR
========================================================= */

function drawBrightStar(
  context,
  x,
  y,
  radius,
  brightness,
  glow,
  tone = "neutral"
) {

  const strength =
    Math.max(
      0,
      Math.min(
        1,
        brightness
      )
    );

  let coreColour =
    "255,255,255";

  let glowColour =
    "190,220,255";

  if (
    tone === "warm"
  ) {

    coreColour =
      "255,229,202";

    glowColour =
      "255,183,125";
  }

  if (
    tone === "cool"
  ) {

    coreColour =
      "232,244,255";

    glowColour =
      "145,195,255";
  }


  if (
    glow > 0
  ) {

    const haloRadius =
      Math.max(
        3,
        radius * 2.6
      );

    const halo =
      context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        haloRadius
      );

    halo.addColorStop(
      0,
      `rgba(
        ${coreColour},
        ${.22 * glow}
      )`
    );

    halo.addColorStop(
      .35,
      `rgba(
        ${glowColour},
        ${.09 * glow}
      )`
    );

    halo.addColorStop(
      1,
      `rgba(
        ${glowColour},
        0
      )`
    );

    context.beginPath();

    context.arc(
      x,
      y,
      haloRadius,
      0,
      Math.PI * 2
    );

    context.fillStyle =
      halo;

    context.fill();
  }


  const rayLength =
    Math.max(
      4,
      radius * 3.2
    );

  const horizontal =
    context.createLinearGradient(
      x - rayLength,
      y,
      x + rayLength,
      y
    );

  horizontal.addColorStop(
    0,
    `rgba(
      ${coreColour},
      0
    )`
  );

  horizontal.addColorStop(
    .5,
    `rgba(
      ${coreColour},
      ${.55 * strength}
    )`
  );

  horizontal.addColorStop(
    1,
    `rgba(
      ${coreColour},
      0
    )`
  );

  context.beginPath();

  context.moveTo(
    x - rayLength,
    y
  );

  context.lineTo(
    x + rayLength,
    y
  );

  context.strokeStyle =
    horizontal;

  context.lineWidth =
    .5;

  context.stroke();


  const vertical =
    context.createLinearGradient(
      x,
      y - rayLength,
      x,
      y + rayLength
    );

  vertical.addColorStop(
    0,
    `rgba(
      ${coreColour},
      0
    )`
  );

  vertical.addColorStop(
    .5,
    `rgba(
      ${coreColour},
      ${.5 * strength}
    )`
  );

  vertical.addColorStop(
    1,
    `rgba(
      ${coreColour},
      0
    )`
  );

  context.beginPath();

  context.moveTo(
    x,
    y - rayLength
  );

  context.lineTo(
    x,
    y + rayLength
  );

  context.strokeStyle =
    vertical;

  context.lineWidth =
    .5;

  context.stroke();


  context.beginPath();

  context.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  context.fillStyle =
    `rgba(
      ${coreColour},
      ${strength}
    )`;

  context.fill();


  context.beginPath();

  context.arc(
    x,
    y,
    Math.max(
      .25,
      radius * .27
    ),
    0,
    Math.PI * 2
  );

  context.fillStyle =
    "rgba(255,255,255,.98)";

  context.fill();
}


/* =========================================================
   ORION STAR DATA
========================================================= */

const orionStars = [

  {
    name: "Betelgeuse",

    revealX: .29,
    revealY: .185,

    telescopeX: -58,
    telescopeY: -72,

    size: 2.8,
    tone: "warm"
  },

  {
    name: "Bellatrix",

    revealX: .71,
    revealY: .235,

    telescopeX: 58,
    telescopeY: -60,

    size: 2.1,
    tone: "neutral"
  },

  {
    name: "Alnitak",

    revealX: .41,
    revealY: .444,

    telescopeX: -25,
    telescopeY: 0,

    size: 1.55,
    tone: "neutral"
  },

  {
    name: "Alnilam",

    revealX: .50,
    revealY: .452,

    telescopeX: 0,
    telescopeY: 3,

    size: 2.0,
    tone: "neutral"
  },

  {
    name: "Mintaka",

    revealX: .59,
    revealY: .46,

    telescopeX: 26,
    telescopeY: 7,

    size: 1.35,
    tone: "neutral"
  },

  {
    name: "Sword 1",

    revealX: .496,
    revealY: .565,

    telescopeX: -1,
    telescopeY: 42,

    size: .85,
    tone: "neutral"
  },

  {
    name: "Sword 2",

    revealX: .49,
    revealY: .645,

    telescopeX: -2,
    telescopeY: 67,

    size: .55,
    tone: "neutral"
  },

  {
    name: "Saiph",

    revealX: .33,
    revealY: .80,

    telescopeX: -46,
    telescopeY: 105,

    size: 1.7,
    tone: "neutral"
  },

  {
    name: "Rigel",

    revealX: .73,
    revealY: .805,

    telescopeX: 64,
    telescopeY: 108,

    size: 3.2,
    tone: "cool"
  }

];

/* =========================================================
   VIRGO STAR DATA
========================================================= */

const virgoStars = [

  {
    name: "Vindemiatrix",

    revealX: 490 / 620,
    revealY: 105 / 520,

    telescopeX: 82,
    telescopeY: -78,

    size: 2.0,
    tone: "warm"
  },

  {
    name: "Auva",

    revealX: 410 / 620,
    revealY: 185 / 520,

    telescopeX: 46,
    telescopeY: -42,

    size: 1.45,
    tone: "neutral"
  },

  {
    name: "Porrima",

    revealX: 330 / 620,
    revealY: 260 / 520,

    telescopeX: 8,
    telescopeY: -5,

    size: 2.1,
    tone: "neutral"
  },

  {
    name: "Spica",

    revealX: 235 / 620,
    revealY: 410 / 520,

    telescopeX: -38,
    telescopeY: 66,

    size: 3.25,
    tone: "cool"
  },

  {
    name: "Zaniah",

    revealX: 255 / 620,
    revealY: 205 / 520,

    telescopeX: -28,
    telescopeY: -30,

    size: 1.35,
    tone: "neutral"
  },

  {
    name: "Zavijava",

    revealX: 145 / 620,
    revealY: 175 / 520,

    telescopeX: -82,
    telescopeY: -44,

    size: 1.65,
    tone: "neutral"
  },

  {
    name: "Heze",

    revealX: 415 / 620,
    revealY: 320 / 520,

    telescopeX: 48,
    telescopeY: 24,

    size: 1.25,
    tone: "neutral"
  },

  {
    name: "Syrma",

    revealX: 500 / 620,
    revealY: 385 / 520,

    telescopeX: 88,
    telescopeY: 55,

    size: 1.4,
    tone: "neutral"
  }

];


/* =========================================================
   REVEALED ORION CANVAS
========================================================= */

function resizeOrionStarCanvas() {

  const cssWidth =
    orion.offsetWidth;

  const cssHeight =
    orion.offsetHeight;

  if (
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return;
  }

  const dpr =
    Math.min(
      window.devicePixelRatio ||
      1,
      2
    );

  orionStarCanvas.width =
    Math.round(
      cssWidth *
      dpr
    );

  orionStarCanvas.height =
    Math.round(
      cssHeight *
      dpr
    );

  orionStarCanvas.style.width =
    `${cssWidth}px`;

  orionStarCanvas.style.height =
    `${cssHeight}px`;

  orionStarCtx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}


function renderRevealedOrionStars() {

  const width =
    orion.offsetWidth;

  const height =
    orion.offsetHeight;

  if (
    width <= 0 ||
    height <= 0
  ) {
    return;
  }

  orionStarCtx.clearRect(
    0,
    0,
    width,
    height
  );

  orionStars.forEach(
    star => {

      drawBrightStar(
        orionStarCtx,

        width *
        star.revealX,

        height *
        star.revealY,

        star.size,

        1,

        1,

        star.tone
      );

    }
  );
}

/* =========================================================
   REVEALED VIRGO CANVAS
========================================================= */

function resizeVirgoStarCanvas() {

  const cssWidth =
    virgo.offsetWidth;

  const cssHeight =
    virgo.offsetHeight;

  if (
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return;
  }

  const dpr =
    Math.min(
      window.devicePixelRatio ||
      1,
      2
    );

  virgoStarCanvas.width =
    Math.round(
      cssWidth *
      dpr
    );

  virgoStarCanvas.height =
    Math.round(
      cssHeight *
      dpr
    );

  virgoStarCanvas.style.width =
    `${cssWidth}px`;

  virgoStarCanvas.style.height =
    `${cssHeight}px`;

  virgoStarCtx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}


function renderRevealedVirgoStars() {

  const width =
    virgo.offsetWidth;

  const height =
    virgo.offsetHeight;

  if (
    width <= 0 ||
    height <= 0
  ) {
    return;
  }

  virgoStarCtx.clearRect(
    0,
    0,
    width,
    height
  );

  virgoStars.forEach(
    star => {

      drawBrightStar(
        virgoStarCtx,

        width *
        star.revealX,

        height *
        star.revealY,

        star.size,

        1,

        1,

        star.tone
      );

    }
  );
}

/* =========================================================
   ORION POSITION
========================================================= */

function updateOrionPosition() {

  const rect =
    orion
      .getBoundingClientRect();

  orionScreenX =
    rect.left +
    rect.width / 2;

  orionScreenY =
    rect.top +
    rect.height / 2;
}

let orionRevealPausedAt = null;
let orionRevealPausedDuration = 0;

function getOrionDistance() {

  return Math.hypot(
    lensX -
    orionScreenX,

    lensY -
    orionScreenY
  );
}


/* =========================================================
   DRAW TELESCOPE ORION
========================================================= */

function drawTelescopeOrion(
  width,
  height
) {

  const distance =
    getOrionDistance();

  if (
    distance > 320 &&
    !orionRevealStarted
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


  const centreX =
    width / 2 +
    (
      orionScreenX -
      lensX
    ) *
    .55;

  const centreY =
    height / 2 +
    (
      orionScreenY -
      lensY
    ) *
    .55;


  const connections = [

    [0, 1],

    [0, 2],
    [2, 3],
    [3, 4],
    [4, 1],

    [2, 7],
    [4, 8],

    [3, 5],
    [5, 6]

  ];


  orionStars.forEach(
    (
      star,
      index
    ) => {

      let shimmer = 1;

      if (
        distance < 145 ||
        orionRevealStarted
      ) {

        shimmer =
          1 +
          Math.sin(
            performance.now() /
            470 +
            index * .9
          ) *
          .045;
      }

      let starIntensity =
        intensity;

      if (
        orionRevealStarted
      ) {

        starIntensity =
          Math.max(
            starIntensity,
            .82
          );
      }

      drawBrightStar(
        ctx,

        centreX +
        star.telescopeX,

        centreY +
        star.telescopeY,

        star.size *
        (
          .78 +
          starIntensity *
          .22
        ) *
        shimmer,

        .2 +
        starIntensity *
        .78,

        (
          distance < 145 ||
          orionRevealStarted
        )
          ? starIntensity
          : 0,

        star.tone
      );

    }
  );


  if (
    !orionRevealStarted
  ) {
    return;
  }

   const now =
  performance.now();


/*
  If Orion moves too far out of the
  telescope during the reveal, freeze
  the drawing exactly where it is.
*/

const orionStillInView =
  distance <= 210;


if (
  !orionStillInView
) {

  if (
    orionRevealPausedAt === null
  ) {
    orionRevealPausedAt = now;
  }

} else if (
  orionRevealPausedAt !== null
) {

  orionRevealPausedDuration +=
    now -
    orionRevealPausedAt;

  orionRevealPausedAt = null;
}


const effectiveNow =
  orionRevealPausedAt === null
    ? now
    : orionRevealPausedAt;


const elapsed =
  effectiveNow -
  orionRevealStartTime -
  orionRevealPausedDuration;
   
  const segmentTime =
    ORION_LINE_DURATION +
    ORION_LINE_PAUSE;


  connections.forEach(
    (
      connection,
      index
    ) => {

      const startTime =
        index *
        segmentTime;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            (
              elapsed -
              startTime
            ) /
            ORION_LINE_DURATION
          )
        );

      if (
        progress <= 0
      ) {
        return;
      }

      const start =
        orionStars[
          connection[0]
        ];

      const end =
        orionStars[
          connection[1]
        ];

      const startX =
        centreX +
        start.telescopeX;

      const startY =
        centreY +
        start.telescopeY;

      const endX =
        centreX +
        end.telescopeX;

      const endY =
        centreY +
        end.telescopeY;

      const currentX =
        startX +
        (
          endX -
          startX
        ) *
        progress;

      const currentY =
        startY +
        (
          endY -
          startY
        ) *
        progress;


      ctx.save();

      ctx.beginPath();

      ctx.moveTo(
        startX,
        startY
      );

      ctx.lineTo(
        currentX,
        currentY
      );

      ctx.strokeStyle =
        "rgba(177,210,247,.10)";

      ctx.lineWidth =
        .6;

      ctx.lineCap =
        "round";

      ctx.shadowColor =
        "rgba(185,218,255,.14)";

      ctx.shadowBlur =
        1;

      ctx.stroke();

      ctx.restore();


      ctx.save();

      ctx.beginPath();

      ctx.moveTo(
        startX,
        startY
      );

      ctx.lineTo(
        currentX,
        currentY
      );

      ctx.strokeStyle =
        "rgba(226,238,252,.68)";

      ctx.lineWidth =
        .7;

      ctx.lineCap =
        "round";

      ctx.stroke();

      ctx.restore();


      if (
        progress < 1
      ) {

        drawBrightStar(
          ctx,
          currentX,
          currentY,
          1,
          .95,
          .8,
          "neutral"
        );
      }
    }
  );
}


/* =========================================================
   TELESCOPE BACKGROUND
========================================================= */

function drawTelescopeBackground(
  width,
  height
) {

  ctx.fillStyle =
    "#07111d";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const glow =
    ctx.createRadialGradient(
      width * .43,
      height * .38,
      0,

      width * .5,
      height * .5,
      width * .7
    );

  glow.addColorStop(
    0,
    "rgba(29,45,65,.10)"
  );

  glow.addColorStop(
    .55,
    "rgba(8,18,31,.035)"
  );

  glow.addColorStop(
    1,
    "rgba(0,2,7,0)"
  );

  ctx.fillStyle =
    glow;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}


/* =========================================================
   TELESCOPE FIELD STARS
========================================================= */

function drawTelescopeStars(
  width,
  height
) {

  const fieldOffsetX =
    lensX *
    .52;

  const fieldOffsetY =
    lensY *
    .52;

  const wrapWidth =
    1200;

  const wrapHeight =
    900;

  telescopeStars.forEach(
    star => {

      let x =
        width / 2 +
        star.x -
        fieldOffsetX;

      let y =
        height / 2 +
        star.y -
        fieldOffsetY;

      x =
        (
          x +
          wrapWidth *
          10
        ) %
        wrapWidth;

      y =
        (
          y +
          wrapHeight *
          10
        ) %
        wrapHeight;

      if (
        x >
        width + 100
      ) {

        x -=
          wrapWidth;
      }

      if (
        y >
        height + 100
      ) {

        y -=
          wrapHeight;
      }

      if (
        x < -20 ||
        x > width + 20 ||
        y < -20 ||
        y > height + 20
      ) {
        return;
      }

      drawStar(
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

  lensX +=
    (
      targetLensX -
      lensX
    ) *
    .24;

  lensY +=
    (
      targetLensY -
      lensY
    ) *
    .24;

  eyepiece.style.left =
    `${lensX}px`;

  eyepiece.style.top =
    `${lensY}px`;

  const rect =
    eyepiece
      .getBoundingClientRect();

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

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  drawTelescopeBackground(
    width,
    height
  );

  drawTelescopeStars(
    width,
    height
  );

  drawTelescopeOrion(
    width,
    height
  );
}


/* =========================================================
   LENS MOVEMENT
========================================================= */

function clampLens(
  x,
  y
) {

  const rect =
    eyepiece
      .getBoundingClientRect();

  const radius =
    Math.max(
      rect.width / 2,
      90
    );

  const padding =
    14;

  return {

    x:
      Math.max(
        radius +
        padding,

        Math.min(
          window.innerWidth -
          radius -
          padding,

          x
        )
      ),

    y:
      Math.max(
        radius +
        padding,

        Math.min(
          window.innerHeight -
          radius -
          padding,

          y
        )
      )

  };
}


function moveLens(
  x,
  y
) {

  const position =
    clampLens(
      x,
      y
    );

  targetLensX =
    position.x;

  targetLensY =
    position.y;

  focusStartedAt =
    null;
}


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

  telescopeButton
    .classList
    .toggle(
      "active",
      active
    );

  telescopeView
    .setAttribute(
      "aria-hidden",
      active
        ? "false"
        : "true"
    );

  telescopeDragging =
    false;

  telescopePointerId =
    null;

  focusStartedAt =
    null;

  if (
    active
  ) {

    lensX =
      window.innerWidth /
      2;

    lensY =
      window.innerHeight /
      2;

    targetLensX =
      lensX;

    targetLensY =
      lensY;

    requestAnimationFrame(
      resizeTelescopeCanvas
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
   TELESCOPE POINTER
========================================================= */

telescopeView.addEventListener(
  "pointerdown",
  event => {

    if (
      !telescopeActive
    ) {
      return;
    }

    telescopeDragging =
      true;

    telescopePointerId =
      event.pointerId;

    moveLens(
      event.clientX,
      event.clientY
    );

    try {

      telescopeView
        .setPointerCapture(
          event.pointerId
        );

    } catch (error) {}

    event.preventDefault();
  }
);


telescopeView.addEventListener(
  "pointermove",
  event => {

    if (
      !telescopeActive
    ) {
      return;
    }

    if (
      event.pointerType ===
      "mouse"
    ) {

      moveLens(
        event.clientX,
        event.clientY
      );

      return;
    }

    if (
      !telescopeDragging ||
      event.pointerId !==
      telescopePointerId
    ) {
      return;
    }

    moveLens(
      event.clientX,
      event.clientY
    );

    event.preventDefault();
  }
);


function endTelescopePointer(
  event
) {

  if (
    event.pointerId !==
    telescopePointerId
  ) {
    return;
  }

  telescopeDragging =
    false;

  telescopePointerId =
    null;
}


telescopeView.addEventListener(
  "pointerup",
  endTelescopePointer
);

telescopeView.addEventListener(
  "pointercancel",
  endTelescopePointer
);


/* =========================================================
   DISCOVERY
========================================================= */

function checkOrionFocus(
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
    getOrionDistance();

  if (
    distance > 75 ||
    telescopeDragging
  ) {

    focusStartedAt =
      null;

    return;
  }

  if (
    focusStartedAt ===
    null
  ) {

    focusStartedAt =
      timestamp;
  }

  if (
    timestamp -
    focusStartedAt >=
    HOLD_TO_DISCOVER
  ) {

    discoverOrion();
  }
}


function discoverOrion() {

  if (
    orionDiscovered ||
    orionRevealStarted
  ) {
    return;
  }

   orionRevealStarted =
  true;

orionRevealStartTime =
  performance.now();

orionRevealPausedAt =
  null;

orionRevealPausedDuration =
  0;

focusStartedAt =
  null;

 function waitForOrionReveal() {

  const segmentTime =
    ORION_LINE_DURATION +
    ORION_LINE_PAUSE;

  const requiredTime =
    9 * segmentTime +
    900;


  const now =
    performance.now();

  const effectiveNow =
    orionRevealPausedAt === null
      ? now
      : orionRevealPausedAt;

  const elapsed =
    effectiveNow -
    orionRevealStartTime -
    orionRevealPausedDuration;


  if (
    elapsed < requiredTime
  ) {

    requestAnimationFrame(
      waitForOrionReveal
    );

    return;
  }


  orionDiscovered =
    true;

  discoveryNumber.textContent =
    "1";

  orion.classList.add(
    "discovered"
  );

  navigationHint
    .classList
    .add(
      "hidden"
    );

  navigationHintHidden =
    true;

setTimeout(
  () => {

    setTelescope(
      false
    );


    /*
      Orion has now been fully discovered.
      Tell Faris what to do next.
    */

    const hintTitle =
      navigationHint.querySelector(
        "p"
      );

    const hintText =
      navigationHint.querySelector(
        "span"
      );


    hintTitle.textContent =
      "You found something.";

    hintText.textContent =
      "Tap the constellation to step inside";


    navigationHint
      .classList
      .remove(
        "hidden"
      );

    navigationHintHidden =
      false;

  },
  650
 );
}

requestAnimationFrame(
  waitForOrionReveal
);
}


/* =========================================================
   NORMAL UNIVERSE POINTER
========================================================= */

app.addEventListener(
  "pointerdown",
  event => {

    if (
      telescopeActive ||
      event.target.closest(
        "#telescopeButton"
      )
    ) {
      return;
    }

    activePointers.set(
      event.pointerId,
      {
        x:
          event.clientX,

        y:
          event.clientY
      }
    );

    if (
      activePointers.size ===
      1
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
    }

    if (
      activePointers.size ===
      2
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

    try {

      app.setPointerCapture(
        event.pointerId
      );

    } catch (error) {}
  }
);


app.addEventListener(
  "pointermove",
  event => {

    if (
      telescopeActive
    ) {
      return;
    }

    if (
      activePointers.has(
        event.pointerId
      )
    ) {

      activePointers.set(
        event.pointerId,
        {
          x:
            event.clientX,

          y:
            event.clientY
        }
      );
    }

    if (
      activePointers.size ===
      2
    ) {

      const points =
        Array.from(
          activePointers.values()
        );

      const distance =
        Math.hypot(
          points[1].x -
          points[0].x,

          points[1].y -
          points[0].y
        );

      if (
        pinchStartDistance >
        0
      ) {

        const ratio =
          distance /
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

    if (
      universeDragging
    ) {

      targetX =
        dragCameraStartX +
        (
          event.clientX -
          dragStartX
        );

      targetY =
        dragCameraStartY +
        (
          event.clientY -
          dragStartY
        );

      clampCamera();
    }
  }
);


function endUniversePointer(
  event
) {

  if (
    telescopeActive
  ) {
    return;
  }

  activePointers.delete(
    event.pointerId
  );

  if (
    activePointers.size ===
    0
  ) {

    universeDragging =
      false;

    pinchStartDistance =
      0;

    app.classList.remove(
      "dragging"
    );

    return;
  }

  if (
    activePointers.size ===
    1
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
  endUniversePointer
);

app.addEventListener(
  "pointercancel",
  endUniversePointer
);


/* =========================================================
   WHEEL ZOOM
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

let navigationHintHidden =
  false;


function hideNavigationHint() {

  if (
    navigationHintHidden
  ) {
    return;
  }

  navigationHintHidden =
    true;

  navigationHint
    .classList
    .add(
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
     
     resizeOrionStarCanvas();
     renderRevealedOrionStars();
     
     resizeVirgoStarCanvas();
     renderRevealedVirgoStars();

if (
  !telescopeActive


    ) {
      return;
    }

    const position =
      clampLens(
        targetLensX,
        targetLensY
      );

    lensX =
      position.x;

    lensY =
      position.y;

    targetLensX =
      position.x;

    targetLensY =
      position.y;

    requestAnimationFrame(
      resizeTelescopeCanvas
    );
  }
);


/* =========================================================
   LOOP
========================================================= */

function animate(
  timestamp
) {

  renderCamera();

  updateOrionPosition();

  renderTelescope();

  checkOrionFocus(
    timestamp
  );

  requestAnimationFrame(
    animate
  );
}


/* =========================================================
   START
========================================================= */

function initialise() {

  buildUniverseStars();

  buildTelescopeStars();

  resizeOrionStarCanvas();
  renderRevealedOrionStars();

   resizeVirgoStarCanvas();
   renderRevealedVirgoStars();

setTelescope(
    false
  );

  requestAnimationFrame(
    animate
  );
}

/* =========================================================
   ORION CHAPTER
========================================================= */

const orionChapter =
  document.getElementById(
    "orionChapter"
  );

const orionMemoryStage =
  document.getElementById(
    "orionMemoryStage"
  );

const orionMemoryCard =
  document.getElementById(
    "orionMemoryCard"
  );

const orionMemoryDate =
  document.getElementById(
    "orionMemoryDate"
  );

const orionMemoryTitle =
  document.getElementById(
    "orionMemoryTitle"
  );

const orionMemoryText =
  document.getElementById(
    "orionMemoryText"
  );

const orionContinue =
  document.getElementById(
    "orionContinue"
  );

const orionProgress =
  document.getElementById(
    "orionProgress"
  );

const orionTravellingLight =
  document.getElementById(
    "orionTravellingLight"
  );

const orionEnding =
  document.getElementById(
    "orionEnding"
  );

const orionReturn =
  document.getElementById(
    "orionReturn"
  );


const orionExit =
  document.getElementById(
    "orionExit"
  );


let enteringOrion = false;

let orionMemoryIndex = -1;

let orionTransitioning = false;


/*
  Five moments.

  starIndex tells the chapter which
  real Orion star to travel toward.
*/

const orionMemories = [

  {
    date:
      "04.05.2024",

    title:
      "We matched.",

    text:
      "Just one match on Muzz. Neither of us knew what it was going to become yet.",

    starIndex:
      0
  },


  {
    date:
      "08.05.2024",

    title:
      "Our first date.",

    text:
      "You were late. I made that stupid fat gesture at you. Then my Apple Watch decided to expose an OKC notification. Somehow, we just laughed.",

    starIndex:
      2
  },


  {
    date:
      "13.07.2024",

    title:
      "Just us.",

    text:
      "We became exclusive.",

    starIndex:
      3
  },


  {
    date:
      "19.11.2024",

    title:
      "We became us.",

    text:
      "On the way back from JB, I asked you to be my boyfriend. After months of getting to know each other, whatever this was between us finally had a name... you were my boyfriend and I was your girlfriend.",

    starIndex:
      4
  },


  {
    date:
      "02.12.2024",

    title:
      "Our day.",

    text:
      "Okay technically we were already us by then HAHAHA. We just decided our actual anniversary was way too close to my birthday, so 02.12 became ours instead. And now I get to celebrate another year of us with you sayang.",

     starIndex:
        8
  }
];
       
       
/* ========================================================= */

function focusOrionStar(
  starIndex,
  zoomLevel = 1.82
) {

  const position =
    getOrionStarScreenPosition(
      starIndex
    );


  /*
    Keep the star slightly ABOVE centre,
    leaving breathing room for the copy.
  */

  const desiredX =
    window.innerWidth /
    2;


  const desiredY =
    window.innerHeight *
    .36;


  const deltaX =
    desiredX -
    position.x;


  const deltaY =
    desiredY -
    position.y;


  targetX +=
    deltaX /
    zoom;


  targetY +=
    deltaY /
    zoom;


  targetZoom =
    Math.min(
      MAX_ZOOM,
      zoomLevel
    );


  clampCamera();
}


/* =========================================================
   ACTIVE STAR
========================================================= */

function setActiveMemoryStar(
  starIndex
) {

  const star =
    orionStars[
      starIndex
    ];


  orion.style.setProperty(
    "--memory-star-x",
    `${star.revealX * 100}%`
  );


  orion.style.setProperty(
    "--memory-star-y",
    `${star.revealY * 100}%`
  );


  orion.classList.add(
    "memory-star-active"
  );
}


/* =========================================================
   SHOW MEMORY
========================================================= */

function showOrionMemory(
  index
) {

  const memory =
    orionMemories[
      index
    ];


  orionMemoryIndex =
    index;


  orionMemoryDate.textContent =
    memory.date;


  orionMemoryTitle.textContent =
    memory.title;


  orionMemoryText.textContent =
    memory.text;


  const dots =
    orionProgress
      .querySelectorAll(
        ".orion-progress-dot"
      );


  dots.forEach(
    (
      dot,
      dotIndex
    ) => {

      dot.classList.toggle(
        "active",
        dotIndex === index
      );


      dot.classList.toggle(
        "past",
        dotIndex < index
      );

    }
  );


  setActiveMemoryStar(
    memory.starIndex
  );


  orionMemoryStage
    .classList
    .add(
      "show"
    );


  requestAnimationFrame(
    () => {

      orionMemoryCard
        .classList
        .add(
          "show"
        );

    }
  );


  setTimeout(
    () => {

      orionMemoryStage
        .classList
        .add(
          "ready"
        );

      orionTransitioning =
        false;

    },
    900
  );
}

/* =========================================================
   TRAVEL BETWEEN MEMORIES
========================================================= */

function getOrionStarLocalPosition(
  starIndex
) {

  const star =
    orionStars[
      starIndex
    ];

  return {

    x:
      star.revealX *
      orion.offsetWidth,

    y:
      star.revealY *
      orion.offsetHeight

  };
}


function placeTravellingLight(
  starIndex
) {

  const position =
    getOrionStarLocalPosition(
      starIndex
    );


  orionTravellingLight.style.left =
    `${position.x}px`;


  orionTravellingLight.style.top =
    `${position.y}px`;
}


/*
  Some memories are separated by more
  than one real Orion segment.

  Instead of cutting diagonally through
  empty space, the light follows the
  actual constellation.
*/

const orionMemoryRoutes = [

  /*
    04.05
    Betelgeuse → Alnitak
  */

  [
    0,
    2
  ],


  /*
    08.05
    Alnitak → Alnilam
  */

  [
    2,
    3
  ],


  /*
    13.07
    Alnilam → Mintaka
  */

  [
    3,
    4
  ],


  /*
    19.11
    Mintaka → Rigel
  */

  [
    4,
    8
  ]

];


function animateLightRoute(
  route,
  routeIndex,
  onComplete
) {

  if (
    routeIndex >=
    route.length - 1
  ) {

    onComplete();

    return;
  }


  const fromStar =
    route[
      routeIndex
    ];


  const toStar =
    route[
      routeIndex + 1
    ];


  placeTravellingLight(
    fromStar
  );


  orionTravellingLight
    .classList
    .remove(
      "travel"
    );


  /*
    Force Safari to commit the start
    point before enabling transition.
  */

  void orionTravellingLight.offsetWidth;


  orionTravellingLight
    .classList
    .add(
      "travel"
    );


  /*
    Because both coordinates now belong
    to #orion, this remains on the line
    even while the universe moves.
  */

  requestAnimationFrame(
    () => {

      const destination =
        getOrionStarLocalPosition(
          toStar
        );


      orionTravellingLight.style.left =
        `${destination.x}px`;


      orionTravellingLight.style.top =
        `${destination.y}px`;

    }
  );


  setTimeout(
    () => {

      animateLightRoute(
        route,
        routeIndex + 1,
        onComplete
      );

    },
    1375
  );
}


function travelToNextOrionMemory() {

  if (
    orionTransitioning
  ) {
    return;
  }


  if (
    orionMemoryIndex >=
    orionMemories.length - 1
  ) {

    finishOrionChapter();

    return;
  }


  orionTransitioning =
    true;


  orionMemoryStage
    .classList
    .remove(
      "ready"
    );


  orionMemoryCard
    .classList
    .remove(
      "show"
    );


  const nextIndex =
    orionMemoryIndex + 1;


  const nextMemory =
    orionMemories[
      nextIndex
    ];


  const route =
    orionMemoryRoutes[
      orionMemoryIndex
    ];


  /*
    Move the camera toward the next
    memory at the same time as the
    constellation-bound light travels.
  */

  focusOrionStar(
    nextMemory.starIndex
  );


  animateLightRoute(
    route,
    0,
    () => {

      orionTravellingLight
        .classList
        .remove(
          "travel"
        );


      /*
        Leave a tiny pause after the
        light reaches the star.
      */

      setTimeout(
        () => {

          showOrionMemory(
            nextIndex
          );

        },
        180
      );

    }
  );
}

/* =========================================================
   ENTER ORION
========================================================= */

function enterOrionChapter() {

  if (
    !orionDiscovered ||
    enteringOrion ||
    telescopeActive
  ) {
    return;
  }


  enteringOrion = true;

   navigationHint
  .classList
  .add(
    "hidden"
  );

navigationHintHidden =
  true;

  orionMemoryIndex = -1;

  orionTransitioning = true;


  universeDragging = false;

  activePointers.clear();

  app.classList.remove(
    "dragging"
  );


  orionChapter
    .classList
    .add(
      "active"
    );


  orionChapter
    .setAttribute(
      "aria-hidden",
      "false"
    );


  /*
    Centre Orion first.
  */

  const rect =
    orion.getBoundingClientRect();


  const centreX =
    rect.left +
    rect.width / 2;


  const centreY =
    rect.top +
    rect.height / 2;


  targetX +=
    (
      window.innerWidth /
      2 -
      centreX
    ) /
    zoom;


  targetY +=
    (
      window.innerHeight /
      2 -
      centreY
    ) /
    zoom;


  targetZoom =
    Math.min(
      MAX_ZOOM,
      1.55
    );


  clampCamera();


  app.classList.add(
    "entering-orion"
  );


  /*
    Opening title.
  */

  setTimeout(
    () => {

      orionChapterIntro
        .classList
        .add(
          "show"
        );

    },
    1100
  );


  /*
    Fade title away.
  */

  setTimeout(
    () => {

      orionChapterIntro
        .classList
        .remove(
          "show"
        );


      app.classList.add(
        "orion-memory-mode"
      );


      focusOrionStar(
        orionMemories[0]
          .starIndex
      );

    },
    3300
  );


  /*
    First memory.
  */

  setTimeout(
    () => {

      showOrionMemory(
        0
      );

    },
    4550
  );
}


/* =========================================================
   FINISH ORION
========================================================= */

function finishOrionChapter() {

  if (
    orionTransitioning
  ) {
    return;
  }


  orionTransitioning =
    true;


  orionMemoryStage
    .classList
    .remove(
      "ready"
    );


  orionMemoryCard
    .classList
    .remove(
      "show"
    );


  orion.classList.remove(
    "memory-star-active"
  );


  /*
    Pull back and reveal Orion again.
  */

  app.classList.remove(
    "orion-memory-mode"
  );


  const rect =
    orion.getBoundingClientRect();


  const centreX =
    rect.left +
    rect.width / 2;


  const centreY =
    rect.top +
    rect.height / 2;


  targetX +=
    (
      window.innerWidth /
      2 -
      centreX
    ) /
    zoom;


  targetY +=
    (
      window.innerHeight /
      2 -
      centreY
    ) /
    zoom;


  targetZoom = 1.22;


  clampCamera();


  setTimeout(
    () => {

      orionMemoryStage
        .classList
        .remove(
          "show"
        );


      orionEnding
        .classList
        .add(
          "show"
        );

    },
    1400
  );
}


/* =========================================================
   RETURN TO UNIVERSE
========================================================= */

function leaveOrionChapter() {

  orionEnding
    .classList
    .remove(
      "show"
    );


  orionChapterIntro
    .classList
    .remove(
      "show"
    );


  orionMemoryStage
    .classList
    .remove(
      "show",
      "ready"
    );


  orionMemoryCard
    .classList
    .remove(
      "show"
    );


  orion.classList.remove(
    "memory-star-active"
  );


  app.classList.remove(
    "orion-memory-mode",
  );


  /*
    Return to a comfortable universe
    view centred around Orion.
  */

  targetZoom = 1;


  const rect =
    orion.getBoundingClientRect();


  const centreX =
    rect.left +
    rect.width / 2;


  const centreY =
    rect.top +
    rect.height / 2;


  targetX +=
    (
      window.innerWidth /
      2 -
      centreX
    ) /
    zoom;


  targetY +=
    (
      window.innerHeight /
      2 -
      centreY
    ) /
    zoom;


  clampCamera();


  setTimeout(
    () => {

      orionChapter
        .classList
        .remove(
          "active"
        );


      orionChapter
        .setAttribute(
          "aria-hidden",
          "true"
        );

       app.classList.remove(
          "entering-orion"
       );


      enteringOrion = false;

      orionTransitioning = false;

      orionMemoryIndex = -1;

    },
    900
  );
}


/* =========================================================
   ORION CONTROLS
========================================================= */

orionContinue.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    travelToNextOrionMemory();

  }
);

orionReturn.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    /*
      The final return button only exists
      after Faris has completed the entire
      Orion chapter.

      This permanently unlocks Orion's
      map label.
    */

    orion.classList.add(
      "completed"
    );


    leaveOrionChapter();

  }
);

orionExit.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    leaveOrionChapter();

  }
);
/* =========================================================
   TAP DISCOVERED ORION
========================================================= */

let appTapStartX = 0;
let appTapStartY = 0;


app.addEventListener(
  "pointerdown",
  event => {

    if (
      !orionDiscovered ||
      enteringOrion ||
      telescopeActive
    ) {
      return;
    }

    appTapStartX =
      event.clientX;

    appTapStartY =
      event.clientY;
  },
  true
);


app.addEventListener(
  "pointerup",
  event => {

    if (
      !orionDiscovered ||
      enteringOrion ||
      telescopeActive
    ) {
      return;
    }

    const moved =
      Math.hypot(
        event.clientX -
        appTapStartX,

        event.clientY -
        appTapStartY
      );

    if (
      moved >= 18
    ) {
      return;
    }


    const rect =
      orion.getBoundingClientRect();

    const paddingX =
      rect.width * .12;

    const paddingY =
      rect.height * .08;


    const insideOrion =
      event.clientX >=
        rect.left + paddingX &&

      event.clientX <=
        rect.right - paddingX &&

      event.clientY >=
        rect.top + paddingY &&

      event.clientY <=
        rect.bottom - paddingY;


    if (
      insideOrion
    ) {

      event.preventDefault();

      enterOrionChapter();

    }
  },
  true
);


/* =========================================================
   INITIALISE
========================================================= */

initialise();
