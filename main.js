/* =========================================================
   OUR LITTLE UNIVERSE
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
const orionStarCanvas = document.getElementById("orionStarCanvas");
const orionStarCtx = orionStarCanvas.getContext("2d");

const virgo = document.getElementById("virgo");
const virgoStarCanvas = document.getElementById("virgoStarCanvas");
const virgoStarCtx = virgoStarCanvas.getContext("2d");

const telescopeView = document.getElementById("telescopeView");
const eyepiece = document.getElementById("eyepiece");
const telescopeCanvas = document.getElementById("telescopeCanvas");
const telescopeButton = document.getElementById("telescopeButton");

const navigationHint = document.getElementById("navigationHint");
const discoveryMessage = document.getElementById("discoveryMessage");
const discoveryNumber = document.getElementById("discoveryNumber");
const orionChapterIntro = document.getElementById("orionChapterIntro");

const ctx = telescopeCanvas.getContext("2d");

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

const activePointers = new Map();

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

let lensX = window.innerWidth / 2;
let lensY = window.innerHeight / 2;

let targetLensX = lensX;
let targetLensY = lensY;


/* =========================================================
   ORION DISCOVERY
========================================================= */

let orionScreenX = window.innerWidth / 2;
let orionScreenY = window.innerHeight / 2;

let orionDiscovered = false;
let orionRevealStarted = false;
let orionRevealStartTime = 0;

let orionRevealPausedAt = null;
let orionRevealPausedDuration = 0;

const ORION_LINE_DURATION = 420;
const ORION_LINE_PAUSE = 90;

let focusStartedAt = null;
const HOLD_TO_DISCOVER = 1800;


/* =========================================================
   VIRGO DISCOVERY
========================================================= */

let virgoScreenX = window.innerWidth / 2;
let virgoScreenY = window.innerHeight / 2;

let virgoDiscovered = false;
let virgoRevealStarted = false;
let virgoRevealStartTime = 0;

let virgoRevealPausedAt = null;
let virgoRevealPausedDuration = 0;

let virgoFocusStartedAt = null;

const VIRGO_LINE_DURATION = 420;
const VIRGO_LINE_PAUSE = 90;


/* =========================================================
   RANDOM
========================================================= */

function seededRandom(seed) {
  const value = Math.sin(seed * 91.3458) * 47453.5453;
  return value - Math.floor(value);
}


/* =========================================================
   NORMAL STAR FIELD
========================================================= */

function createStar(layer, x, y, options = {}) {
  const star = document.createElement("span");

  star.className = "sky-star";

  if (options.tiny) star.classList.add("tiny");
  if (options.large) star.classList.add("large");

  if (options.warm) star.classList.add("warm");
  if (options.cool) star.classList.add("cool");
  if (options.blue) star.classList.add("blue");
  if (options.orange) star.classList.add("orange");
  if (options.cream) star.classList.add("cream");

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
    star.style.opacity = options.opacity;
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
  for (let i = 0; i < count; i++) {
    const seed = i + seedOffset;

    const x = seededRandom(seed * 2.31) * width;
    const y = seededRandom(seed * 5.17) * height;

    const emptyRegionA = Math.hypot(
      x - width * .25,
      y - height * .34
    );

    const emptyRegionB = Math.hypot(
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

    const sizeChance = seededRandom(seed * 11.4);
    const colourChance = seededRandom(seed * 13.7);
    const twinkleChance = seededRandom(seed * 17.1);

    createStar(layer, x, y, {
      tiny: sizeChance < .44,

      large:
        type === "near" &&
        sizeChance > .94,

      orange: colourChance > .985,

      warm:
        colourChance > .945 &&
        colourChance <= .985,

      cream:
        colourChance > .885 &&
        colourChance <= .945,

      blue: colourChance < .025,

      cool:
        colourChance >= .025 &&
        colourChance < .085,

      twinkle:
        type !== "deep" &&
        twinkleChance > .91,

      duration:
        6 +
        seededRandom(seed * 21.3) * 8,

      opacity:
        type === "deep"
          ? .12 + seededRandom(seed * 25.2) * .24
          : undefined
    });
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
  for (let i = 0; i < count; i++) {
    const seed = i + seedOffset;

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

    const sizeChance = seededRandom(seed * 14.4);
    const colourChance = seededRandom(seed * 16.7);

    createStar(layer, x, y, {
      tiny: sizeChance < .66,

      large:
        type === "near" &&
        sizeChance > .985,

      orange: colourChance > .992,

      warm:
        colourChance > .962 &&
        colourChance <= .992,

      cream:
        colourChance > .91 &&
        colourChance <= .962,

      blue: colourChance < .018,

      cool:
        colourChance >= .018 &&
        colourChance < .065,

      twinkle:
        type !== "deep" &&
        seededRandom(seed * 18.8) > .965,

      duration:
        7 +
        seededRandom(seed * 22.4) * 7,

      opacity:
        type === "deep"
          ? .10 + seededRandom(seed * 26.8) * .22
          : undefined
    });
  }
}


/*
  Extra Virgo stars live around the constellation
  rather than piling directly behind it.
*/

function buildAnnulusCluster(
  layer,
  centreX,
  centreY,
  innerX,
  innerY,
  outerX,
  outerY,
  count,
  seedOffset,
  type
) {
  for (let i = 0; i < count; i++) {
    const seed = i + seedOffset;

    const angle =
      seededRandom(seed * 10.1) *
      Math.PI *
      2;

    const distance =
      .15 +
      seededRandom(seed * 3.2) *
      .85;

    const radiusX =
      innerX +
      (outerX - innerX) *
      distance;

    const radiusY =
      innerY +
      (outerY - innerY) *
      distance;

    const x =
      centreX +
      Math.cos(angle) *
      radiusX;

    const y =
      centreY +
      Math.sin(angle) *
      radiusY;

    const sizeChance =
      seededRandom(seed * 14.4);

    const colourChance =
      seededRandom(seed * 16.7);

    createStar(layer, x, y, {
      tiny: sizeChance < .72,

      large:
        type === "near" &&
        sizeChance > .992,

      orange: colourChance > .994,

      warm:
        colourChance > .968 &&
        colourChance <= .994,

      cream:
        colourChance > .92 &&
        colourChance <= .968,

      blue: colourChance < .016,

      cool:
        colourChance >= .016 &&
        colourChance < .06,

      twinkle:
        type !== "deep" &&
        seededRandom(seed * 18.8) > .97,

      duration:
        7 +
        seededRandom(seed * 22.4) * 7,

      opacity:
        type === "deep"
          ? .10 + seededRandom(seed * 26.8) * .20
          : undefined
    });
  }
}


function buildUniverseStars() {
  const width = universe.offsetWidth;
  const height = universe.offsetHeight;

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

  /*
    VIRGO REGION

    Dense surrounding field similar to Orion,
    while keeping Virgo itself readable.
  */

  buildAnnulusCluster(
    starsDeep,
    930,
    690,
    115,
    90,
    690,
    470,
    330,
    22000,
    "deep"
  );

  buildAnnulusCluster(
    starsFar,
    930,
    690,
    105,
    80,
    590,
    410,
    100,
    24000,
    "far"
  );

  buildAnnulusCluster(
    starsMid,
    930,
    690,
    120,
    90,
    500,
    350,
    28,
    26000,
    "mid"
  );

  buildAnnulusCluster(
    starsNear,
    930,
    690,
    145,
    110,
    470,
    330,
    7,
    28000,
    "near"
  );
}


/* =========================================================
   CAMERA
========================================================= */

function clampCamera() {
  const limitX =
    universe.offsetWidth * .34;

  const limitY =
    universe.offsetHeight * .34;

  targetX = Math.max(
    -limitX,
    Math.min(limitX, targetX)
  );

  targetY = Math.max(
    -limitY,
    Math.min(limitY, targetY)
  );
}


function renderCamera() {
  const movementEasing =
    universeDragging
      ? .32
      : CAMERA_EASING;

  cameraX +=
    (targetX - cameraX) *
    movementEasing;

  cameraY +=
    (targetY - cameraY) *
    movementEasing;

  zoom +=
    (targetZoom - zoom) *
    ZOOM_EASING;

  universe.style.transform = `
    translate(
      calc(-50% + ${cameraX}px),
      calc(-50% + ${cameraY}px)
    )
    scale(${zoom})
  `;

  starsDeep.style.transform =
    `translate(${-cameraX * .018}px, ${-cameraY * .018}px)`;

  starsFar.style.transform =
    `translate(${-cameraX * .032}px, ${-cameraY * .032}px)`;

  starsMid.style.transform =
    `translate(${-cameraX * .052}px, ${-cameraY * .052}px)`;

  starsNear.style.transform =
    `translate(${-cameraX * .075}px, ${-cameraY * .075}px)`;

  dustLayer.style.transform =
    `translate(${-cameraX * .012}px, ${-cameraY * .012}px)`;
}


/* =========================================================
   TELESCOPE CANVAS
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

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  telescopeCanvas.width =
    Math.round(rect.width * dpr);

  telescopeCanvas.height =
    Math.round(rect.height * dpr);

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

  for (let i = 0; i < 1500; i++) {
    const x =
      (
        seededRandom(i * 2.13 + 40) -
        .5
      ) *
      1200;

    const y =
      (
        seededRandom(i * 4.71 + 80) -
        .5
      ) *
      900;

    const brightness =
      .10 +
      seededRandom(i * 7.37 + 120) *
      .50;

    const chance =
      seededRandom(i * 11.91 + 160);

    let size = .42;

    if (chance > .70) size = .62;
    if (chance > .91) size = .9;
    if (chance > .978) size = 1.2;

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
    `rgba(231,239,251,${brightness})`;

  ctx.fill();
}


/* =========================================================
   CONSTELLATION STAR DATA
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
    size: 2,
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

const virgoStars = [
  {
    name: "Vindemiatrix",
    revealX: 375 / 620,
    revealY: 183 / 520,
    telescopeX: 33,
    telescopeY: -39,
    size: 2.25,
    tone: "warm"
  },

  {
    name: "Auva",
    revealX: 383 / 620,
    revealY: 276 / 520,
    telescopeX: 37,
    telescopeY: 8,
    size: 1.65,
    tone: "neutral"
  },

  {
    name: "Porrima",
    revealX: 310 / 620,
    revealY: 302 / 520,
    telescopeX: 0,
    telescopeY: 21,
    size: 2.15,
    tone: "neutral"
  },

  {
    name: "Spica",
    revealX: 295 / 620,
    revealY: 485 / 520,
    telescopeX: -8,
    telescopeY: 113,
    size: 3.05,
    tone: "cool"
  },

  {
    name: "Zaniah",
    revealX: 310 / 620,
    revealY: 197 / 520,
    telescopeX: 0,
    telescopeY: -32,
    size: 1.75,
    tone: "neutral"
  },

  {
    name: "Zavijava",
    revealX: 225 / 620,
    revealY: 168 / 520,
    telescopeX: -43,
    telescopeY: -46,
    size: 1.95,
    tone: "neutral"
  },

  {
    name: "Heze",
    revealX: 419 / 620,
    revealY: 339 / 520,
    telescopeX: 55,
    telescopeY: 40,
    size: 1.5,
    tone: "neutral"
  },

  {
    name: "Syrma",
    revealX: 361 / 620,
    revealY: 435 / 520,
    telescopeX: 26,
    telescopeY: 88,
    size: 1.8,
    tone: "neutral"
  }
];


/*
  Extra stars complete Virgo's silhouette.
  Visual only — no memories attached.
*/

const virgoVisualStars = [
  {
    revealX: 393 / 620,
    revealY: 35 / 520,
    telescopeX: 42,
    telescopeY: -113,
    size: 1.7,
    tone: "neutral"
  },

  {
    revealX: 393 / 620,
    revealY: 119 / 520,
    telescopeX: 42,
    telescopeY: -71,
    size: 1.3,
    tone: "neutral"
  },

  {
    revealX: 255 / 620,
    revealY: 347 / 520,
    telescopeX: -28,
    telescopeY: 44,
    size: 1.55,
    tone: "warm"
  },

  {
    revealX: 201 / 620,
    revealY: 444 / 520,
    telescopeX: -55,
    telescopeY: 92,
    size: 1.25,
    tone: "neutral"
  },

  {
    revealX: 329 / 620,
    revealY: 424 / 520,
    telescopeX: 10,
    telescopeY: 82,
    size: 1.6,
    tone: "cool"
  }
];


/* =========================================================
   SHARED CONSTELLATION STAR APPEARANCE
========================================================= */

const constellationStarDesigns = {
  Vindemiatrix: {
    flareV: 1.35,
    flareH: 1.05,
    glow: 1.05,
    speed: .72,
    phase: .3
  },

  Auva: {
    flareV: .95,
    flareH: .78,
    glow: .82,
    speed: .58,
    phase: 1.6
  },

  Porrima: {
    flareV: 1.22,
    flareH: .94,
    glow: 1,
    speed: .66,
    phase: 2.8
  },

  Spica: {
    flareV: 2.75,
    flareH: 1.65,
    glow: 1.95,
    speed: .78,
    phase: .8
  },

  Zaniah: {
    flareV: .76,
    flareH: .62,
    glow: .7,
    speed: .53,
    phase: 3.7
  },

  Zavijava: {
    flareV: 1.02,
    flareH: .82,
    glow: .86,
    speed: .63,
    phase: 4.5
  },

  Heze: {
    flareV: .68,
    flareH: .55,
    glow: .64,
    speed: .49,
    phase: 2.1
  },

  Syrma: {
    flareV: .9,
    flareH: .7,
    glow: .76,
    speed: .6,
    phase: 5.3
  },

  Betelgeuse: {
    flareV: 1.55,
    flareH: 1.18,
    glow: 1.35,
    speed: .62,
    phase: .5
  },

  Bellatrix: {
    flareV: 1.12,
    flareH: .9,
    glow: .95,
    speed: .7,
    phase: 1.4
  },

  Alnitak: {
    flareV: .9,
    flareH: .72,
    glow: .75,
    speed: .57,
    phase: 2.1
  },

  Alnilam: {
    flareV: 1.05,
    flareH: .82,
    glow: .9,
    speed: .64,
    phase: 3.2
  },

  Mintaka: {
    flareV: .82,
    flareH: .66,
    glow: .7,
    speed: .54,
    phase: 4.1
  },

  "Sword 1": {
    flareV: .68,
    flareH: .52,
    glow: .55,
    speed: .74,
    phase: 2.7
  },

  "Sword 2": {
    flareV: .55,
    flareH: .44,
    glow: .45,
    speed: .6,
    phase: 5.2
  },

  Saiph: {
    flareV: 1.02,
    flareH: .78,
    glow: .85,
    speed: .59,
    phase: 3.8
  },

  Rigel: {
    flareV: 1.85,
    flareH: 1.35,
    glow: 1.55,
    speed: .76,
    phase: 1
  }
};


function drawConstellationStar(
  context,
  x,
  y,
  size,
  tone = "neutral",
  starName = "",
  time = 0,
  intensity = 1
) {
  const design =
    constellationStarDesigns[starName] || {
      flareV: 1,
      flareH: .8,
      glow: .8,
      speed: .6,
      phase: 0
    };

  const wave =
    (
      Math.sin(
        time *
        design.speed *
        Math.PI *
        2 +
        design.phase
      ) +
      1
    ) / 2;

  const alpha =
    Math.max(
      .08,
      Math.min(1, intensity)
    );

  const brightness =
    (.58 + wave * .42) *
    alpha;

  const flarePulse =
    .88 +
    wave * .22;

  let core = "255,250,236";
  let glow = "205,225,255";

  if (tone === "warm") {
    core = "255,235,205";
    glow = "255,205,160";
  }

  if (tone === "cool") {
    core = "244,250,255";
    glow = "170,210,255";
  }

  context.save();

  /* soft bloom */

  const bloomRadius =
    size *
    7.4 *
    design.glow *
    (.9 + wave * .14);

  const bloom =
    context.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      bloomRadius
    );

  bloom.addColorStop(
    0,
    `rgba(${core},${.32 * brightness})`
  );

  bloom.addColorStop(
    .12,
    `rgba(${glow},${.18 * brightness})`
  );

  bloom.addColorStop(
    .36,
    `rgba(${glow},${.065 * brightness})`
  );

  bloom.addColorStop(
    1,
    `rgba(${glow},0)`
  );

  context.beginPath();

  context.arc(
    x,
    y,
    bloomRadius,
    0,
    Math.PI * 2
  );

  context.fillStyle = bloom;
  context.fill();

  /* vertical ray */

  const verticalLength =
    size *
    7.4 *
    design.flareV *
    flarePulse;

  const verticalGradient =
    context.createLinearGradient(
      x,
      y - verticalLength,
      x,
      y + verticalLength
    );

  verticalGradient.addColorStop(0, `rgba(${glow},0)`);
  verticalGradient.addColorStop(.38, `rgba(${glow},${.08 * brightness})`);
  verticalGradient.addColorStop(.49, `rgba(${core},${.5 * brightness})`);
  verticalGradient.addColorStop(.5, `rgba(255,255,255,${.92 * brightness})`);
  verticalGradient.addColorStop(.51, `rgba(${core},${.5 * brightness})`);
  verticalGradient.addColorStop(.62, `rgba(${glow},${.08 * brightness})`);
  verticalGradient.addColorStop(1, `rgba(${glow},0)`);

  context.beginPath();
  context.moveTo(
    x,
    y - verticalLength
  );

  context.lineTo(
    x,
    y + verticalLength
  );

  context.strokeStyle = verticalGradient;

  context.lineWidth =
    starName === "Spica"
      ? .78
      : starName === "Rigel"
        ? .7
        : .45;

  context.stroke();

  /* horizontal ray */

  const horizontalLength =
    size *
    6.2 *
    design.flareH *
    flarePulse;

  const horizontalGradient =
    context.createLinearGradient(
      x - horizontalLength,
      y,
      x + horizontalLength,
      y
    );

  horizontalGradient.addColorStop(0, `rgba(${glow},0)`);
  horizontalGradient.addColorStop(.38, `rgba(${glow},${.07 * brightness})`);
  horizontalGradient.addColorStop(.49, `rgba(${core},${.45 * brightness})`);
  horizontalGradient.addColorStop(.5, `rgba(255,255,255,${.8 * brightness})`);
  horizontalGradient.addColorStop(.51, `rgba(${core},${.45 * brightness})`);
  horizontalGradient.addColorStop(.62, `rgba(${glow},${.07 * brightness})`);
  horizontalGradient.addColorStop(1, `rgba(${glow},0)`);

  context.beginPath();
  context.moveTo(
    x - horizontalLength,
    y
  );

  context.lineTo(
    x + horizontalLength,
    y
  );

  context.strokeStyle = horizontalGradient;

  context.lineWidth =
    starName === "Spica"
      ? .66
      : starName === "Rigel"
        ? .58
        : .4;

  context.stroke();

  /* ✦ core */

  const majorStar =
    starName === "Spica" ||
    starName === "Rigel" ||
    starName === "Betelgeuse";

  const coreVertical =
    size *
    (
      starName === "Spica"
        ? 1.95
        : majorStar
          ? 1.55
          : 1.25
    );

  const coreHorizontal =
    size *
    (
      starName === "Spica"
        ? 1.32
        : majorStar
          ? 1.1
          : .95
    );

  const waist =
    Math.max(
      .28,
      size * .16
    );

  context.beginPath();
  context.moveTo(
    x,
    y - coreVertical
  );

  context.quadraticCurveTo(
    x + waist,
    y - waist,
    x + coreHorizontal,
    y
  );

  context.quadraticCurveTo(
    x + waist,
    y + waist,
    x,
    y + coreVertical
  );

  context.quadraticCurveTo(
    x - waist,
    y + waist,
    x - coreHorizontal,
    y
  );

  context.quadraticCurveTo(
    x - waist,
    y - waist,
    x,
    y - coreVertical
  );

  context.closePath();

  context.shadowColor =
    `rgba(${glow},${.9 * brightness})`;

  context.shadowBlur =
    majorStar
      ? 8 + wave * 5
      : 4 + wave * 3;

  context.fillStyle =
    `rgba(${core},${(.82 + wave * .18) * alpha})`;

  context.fill();

  /* white-hot centre */

  context.shadowBlur =
    4 +
    wave * 3;

  context.beginPath();

  context.arc(
    x,
    y,
    Math.max(
      .35,
      size * .16
    ),
    0,
    Math.PI * 2
  );

  context.fillStyle =
    `rgba(255,255,255,${.98 * alpha})`;

  context.fill();
  context.restore();
}


/* =========================================================
   REVEALED ORION CANVAS
========================================================= */

function resizeOrionStarCanvas() {
  const cssWidth = orion.offsetWidth;
  const cssHeight = orion.offsetHeight;

  if (
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return;
  }

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  orionStarCanvas.width =
    Math.round(cssWidth * dpr);

  orionStarCanvas.height =
    Math.round(cssHeight * dpr);

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


function renderRevealedOrionStars(
  timestamp = performance.now()
) {
  const width = orion.offsetWidth;
  const height = orion.offsetHeight;

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

  const time =
    timestamp / 1000;

  orionStars.forEach(star => {
    let displaySize =
      Math.max(
        1.05,
        star.size * 1.16
      );

    if (star.name === "Rigel") {
      displaySize =
        star.size * 1.28;
    }

    if (star.name === "Betelgeuse") {
      displaySize =
        star.size * 1.22;
    }

    drawConstellationStar(
      orionStarCtx,
      width * star.revealX,
      height * star.revealY,
      displaySize,
      star.tone,
      star.name,
      time,
      1
    );
  });
}


/* =========================================================
   REVEALED VIRGO CANVAS
========================================================= */

function resizeVirgoStarCanvas() {
  const cssWidth = virgo.offsetWidth;
  const cssHeight = virgo.offsetHeight;

  if (
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return;
  }

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  virgoStarCanvas.width =
    Math.round(cssWidth * dpr);

  virgoStarCanvas.height =
    Math.round(cssHeight * dpr);

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


function renderRevealedVirgoStars(
  timestamp = performance.now()
) {
  const width = virgo.offsetWidth;
  const height = virgo.offsetHeight;

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

  const time =
    timestamp / 1000;

  virgoStars.forEach(star => {
    const displaySize =
      star.name === "Spica"
        ? star.size * 1.52
        : Math.max(
            1.5,
            star.size * 1.2
          );

    drawConstellationStar(
      virgoStarCtx,
      width * star.revealX,
      height * star.revealY,
      displaySize,
      star.tone,
      star.name,
      time,
      1
    );
  });

  virgoVisualStars.forEach(
    (star, index) => {
      drawConstellationStar(
        virgoStarCtx,
        width * star.revealX,
        height * star.revealY,
        star.size,
        star.tone,
        `VirgoVisual${index}`,
        time,
        .82
      );
    }
  );
}


/* =========================================================
   ORION POSITION
========================================================= */

function updateOrionPosition() {
  const rect =
    orion.getBoundingClientRect();

  orionScreenX =
    rect.left +
    rect.width / 2;

  orionScreenY =
    rect.top +
    rect.height / 2;
}


function getOrionDistance() {
  return Math.hypot(
    lensX - orionScreenX,
    lensY - orionScreenY
  );
}


/* =========================================================
   VIRGO POSITION
========================================================= */

function updateVirgoPosition() {
  const rect =
    virgo.getBoundingClientRect();

  virgoScreenX =
    rect.left +
    rect.width / 2;
     virgoScreenY =
    rect.top +
    rect.height / 2;
}


function getVirgoDistance() {
  return Math.hypot(
    lensX - virgoScreenX,
    lensY - virgoScreenY
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

  if (distance < 260) {
    intensity = .20;
  }

  if (distance < 200) {
    intensity = .32;
  }

  if (distance < 145) {
    intensity = .48;
  }

  if (distance < 95) {
    intensity = .72;
  }

  if (distance < 55) {
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

  const time =
    performance.now() /
    1000;

  orionStars.forEach(
    star => {
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

      let telescopeSize =
        star.size *
        (
          .9 +
          starIntensity *
          .2
        );

      if (
        star.name ===
        "Rigel"
      ) {
        telescopeSize *=
          1.18;
      }

      if (
        star.name ===
        "Betelgeuse"
      ) {
        telescopeSize *=
          1.12;
      }

      drawConstellationStar(
        ctx,

        centreX +
        star.telescopeX,

        centreY +
        star.telescopeY,

        telescopeSize,

        star.tone,

        star.name,

        time,

        .2 +
        starIntensity *
        .8
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
    Pause the reveal if Orion moves
    outside the telescope.
  */

  const orionStillInView =
    distance <= 210;

  if (
    !orionStillInView
  ) {
    if (
      orionRevealPausedAt ===
      null
    ) {
      orionRevealPausedAt =
        now;
    }
  } else if (
    orionRevealPausedAt !==
    null
  ) {
    orionRevealPausedDuration +=
      now -
      orionRevealPausedAt;

    orionRevealPausedAt =
      null;
  }

  const effectiveNow =
    orionRevealPausedAt ===
    null
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

      /*
        Soft glow underneath.
      */

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

      /*
        Main constellation line.
      */

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

      /*
        Small travelling point while
        the segment is being drawn.
      */

      if (
        progress < 1
      ) {
        drawConstellationStar(
          ctx,
          currentX,
          currentY,
          1,
          "neutral",
          "",
          time,
          .95
        );
      }
    }
  );
}


/* =========================================================
   DRAW TELESCOPE VIRGO
========================================================= */

function drawTelescopeVirgo(
  width,
  height
) {
  const distance =
    getVirgoDistance();

  if (
    distance > 320 &&
    !virgoRevealStarted
  ) {
    return;
  }

  let intensity = .12;

  if (distance < 260) intensity = .20;
  if (distance < 200) intensity = .32;
  if (distance < 145) intensity = .48;
  if (distance < 95) intensity = .72;
  if (distance < 55) intensity = 1;

  const centreX =
    width / 2 +
    (virgoScreenX - lensX) * .55;

  const centreY =
    height / 2 +
    (virgoScreenY - lensY) * .55;

  const telescopeVirgoStars = [
    ...virgoStars,
    ...virgoVisualStars
  ];

  /*
    0 Vindemiatrix
    1 Auva
    2 Porrima
    3 Spica
    4 Zaniah
    5 Zavijava
    6 Heze
    7 Syrma

    8-12 visual-only stars
  */

  const connections = [
    [8, 9],
    [9, 0],

    [5, 4],
    [4, 0],

    [4, 2],

    [0, 1],
    [1, 6],

    [2, 6],

    [2, 10],
    [10, 11],

    [6, 7],
    [7, 12],
    [12, 3]
  ];

  const time =
    performance.now() / 1000;

  /*
    Main named Virgo stars
  */

  virgoStars.forEach(
    star => {
      let starIntensity =
        intensity;

      if (virgoRevealStarted) {
        starIntensity =
          Math.max(
            starIntensity,
            .82
          );
      }

      let telescopeSize =
        Math.max(
          1.45,
          star.size * 1.15
        );

      if (star.name === "Spica") {
        telescopeSize =
          star.size * 1.32;
      }

      if (
        star.name === "Vindemiatrix" ||
        star.name === "Porrima"
      ) {
        telescopeSize =
          star.size * 1.2;
      }

      drawConstellationStar(
        ctx,
        centreX + star.telescopeX,
        centreY + star.telescopeY,
        telescopeSize,
        star.tone,
        star.name,
        time,
        .2 + starIntensity * .8
      );
    }
  );

  /*
    Smaller visual-only stars
  */

  virgoVisualStars.forEach(
    (star, index) => {
      let starIntensity =
        intensity;

      if (virgoRevealStarted) {
        starIntensity =
          Math.max(
            starIntensity,
            .82
          );
      }

      drawConstellationStar(
        ctx,
        centreX + star.telescopeX,
        centreY + star.telescopeY,
        Math.max(
          1.2,
          star.size * 1.1
        ),
        star.tone,
        `VirgoVisual${index}`,
        time,
        .18 + starIntensity * .75
      );
    }
  );

  if (!virgoRevealStarted) {
    return;
  }

  const now =
    performance.now();

  const virgoStillInView =
    distance <= 210;

  if (!virgoStillInView) {
    if (virgoRevealPausedAt === null) {
      virgoRevealPausedAt =
        now;
    }
  } else if (
    virgoRevealPausedAt !== null
  ) {
    virgoRevealPausedDuration +=
      now - virgoRevealPausedAt;

    virgoRevealPausedAt =
      null;
  }

  const effectiveNow =
    virgoRevealPausedAt === null
      ? now
      : virgoRevealPausedAt;

  const elapsed =
    effectiveNow -
    virgoRevealStartTime -
    virgoRevealPausedDuration;

  const segmentTime =
    VIRGO_LINE_DURATION +
    VIRGO_LINE_PAUSE;

  connections.forEach(
    (connection, index) => {
      const startTime =
        index * segmentTime;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            (
              elapsed -
              startTime
            ) /
            VIRGO_LINE_DURATION
          )
        );

      if (progress <= 0) {
        return;
      }

      const start =
        telescopeVirgoStars[
          connection[0]
        ];

      const end =
        telescopeVirgoStars[
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

      ctx.beginPath();

      ctx.moveTo(
        startX,
        startY
      );

      ctx.lineTo(
        startX +
        (endX - startX) *
        progress,

        startY +
        (endY - startY) *
        progress
      );

      ctx.strokeStyle =
        "rgba(225,237,252,.72)";

      ctx.lineWidth = .8;

      ctx.stroke();
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

  drawTelescopeVirgo(
    width,
    height
  );
}


/* =========================================================
   LENS MOVEMENT
========================================================= */

function clampLens(x, y) {
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


function moveLens(x, y) {
  const position =
    clampLens(x, y);

  targetLensX =
    position.x;

  targetLensY =
    position.y;

  focusStartedAt = null;
}


/* =========================================================
   TELESCOPE TOGGLE
========================================================= */

function setTelescope(active) {
  telescopeActive = active;

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

  telescopeDragging = false;
  telescopePointerId = null;
  focusStartedAt = null;

  if (active) {
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
   ORION DISCOVERY
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
      9 *
      segmentTime +
      900;

    const now =
      performance.now();

    const effectiveNow =
      orionRevealPausedAt ===
      null
        ? now
        : orionRevealPausedAt;

    const elapsed =
      effectiveNow -
      orionRevealStartTime -
      orionRevealPausedDuration;

    if (
      elapsed <
      requiredTime
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

    navigationHint.classList.add(
      "hidden"
    );

    navigationHintHidden =
      true;

    setTimeout(
      () => {
        setTelescope(
          false
        );

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

        navigationHint.classList.remove(
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
   VIRGO DISCOVERY
========================================================= */

function checkVirgoFocus(
  timestamp
) {
  if (
    !telescopeActive ||
    virgoDiscovered
  ) {
    virgoFocusStartedAt =
      null;

    return;
  }

  const distance =
    getVirgoDistance();

  if (
    distance > 75 ||
    telescopeDragging
  ) {
    virgoFocusStartedAt =
      null;

    return;
  }

  if (
    virgoFocusStartedAt ===
    null
  ) {
    virgoFocusStartedAt =
      timestamp;
  }

  if (
    timestamp -
    virgoFocusStartedAt >=
    HOLD_TO_DISCOVER
  ) {
    discoverVirgo();
  }
}


function discoverVirgo() {
  if (
    virgoDiscovered ||
    virgoRevealStarted
  ) {
    return;
  }

  virgoRevealStarted =
    true;

  virgoRevealStartTime =
    performance.now();

  virgoRevealPausedAt =
    null;

  virgoRevealPausedDuration =
    0;

  virgoFocusStartedAt =
    null;

  function waitForVirgoReveal() {
    const segmentTime =
      VIRGO_LINE_DURATION +
      VIRGO_LINE_PAUSE;

    const requiredTime =
      13 *
      segmentTime +
      900;

    const now =
      performance.now();

    const effectiveNow =
      virgoRevealPausedAt ===
      null
        ? now
        : virgoRevealPausedAt;

    const elapsed =
      effectiveNow -
      virgoRevealStartTime -
      virgoRevealPausedDuration;

    if (
      elapsed <
      requiredTime
    ) {
      requestAnimationFrame(
        waitForVirgoReveal
      );

      return;
    }

    virgoDiscovered =
      true;

    discoveryNumber.textContent =
      orionDiscovered
        ? "2"
        : "1";

    virgo.classList.add(
      "discovered"
    );

    setTimeout(
      () => {
        setTelescope(
          false
        );

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

        navigationHint.classList.remove(
          "hidden"
        );

        navigationHintHidden =
          false;
      },
      650
    );
  }

  requestAnimationFrame(
    waitForVirgoReveal
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
           enteringVirgo ||
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
  telescopeActive ||
  enteringOrion ||
  enteringVirgo
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
   VIRGO GUIDANCE
========================================================= */

function updateVirgoGuidance(
  timestamp
) {
  if (
    !orionDiscovered ||
    virgoDiscovered ||
    enteringOrion ||
    enteringVirgo
  ) {
    app.style.setProperty(
      "--virgo-guidance",
      "0"
    );

    return;
  }

  const centreX =
    window.innerWidth /
    2;

  const centreY =
    window.innerHeight /
    2;

  const distance =
    Math.hypot(
      virgoScreenX -
      centreX,

      virgoScreenY -
      centreY
    );

  const farDistance =
    Math.min(
      window.innerWidth,
      window.innerHeight
    ) *
    1.35;

  const nearDistance =
    Math.min(
      window.innerWidth,
      window.innerHeight
    ) *
    .32;

  const proximity =
    Math.max(
      0,
      Math.min(
        1,
        (
          farDistance -
          distance
        ) /
        (
          farDistance -
          nearDistance
        )
      )
    );

  const pulse =
    .72 +
    Math.sin(
      timestamp *
      .0022
    ) *
    .28;

  const strength =
    proximity *
    (
      .55 +
      pulse *
      .45
    );

  app.style.setProperty(
    "--virgo-guidance",
    strength.toFixed(3)
  );
}


/* =========================================================
   LOOP
========================================================= */

function animate(
  timestamp
) {
  renderCamera();

  updateOrionPosition();
  updateVirgoPosition();

  updateVirgoGuidance(
    timestamp
  );

  /*
    Orion and Virgo now use the
    same animated luminous renderer.
  */

  if (
    orionDiscovered
  ) {
    renderRevealedOrionStars(
      timestamp
    );
  }

  if (
    virgoDiscovered
  ) {
    renderRevealedVirgoStars(
      timestamp
    );
  }

  if (
    enteringVirgo &&
    virgoExperience &&
    virgoExperience.classList.contains(
      "show"
    )
  ) {
    positionVirgoExperience();
  }

  renderTelescope();

  checkOrionFocus(
    timestamp
  );

  checkVirgoFocus(
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


/* =========================================================
   ORION MEMORIES
========================================================= */

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


/* =========================================================
   ORION FOCUS
========================================================= */

function focusOrionStar(
  starIndex,
  zoomLevel = 1.82
) {
  const position =
    getOrionStarScreenPosition(
      starIndex
    );

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
  Each memory follows the real
  Orion constellation segments.
*/

const orionMemoryRoutes = [
  [
    0,
    2
  ],

  [
    2,
    3
  ],

  [
    3,
    4
  ],

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
    Force Safari to commit the
    starting position first.
  */

  void orionTravellingLight.offsetWidth;

  orionTravellingLight
    .classList
    .add(
      "travel"
    );

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
    orionMemoryIndex +
    1;

  const nextMemory =
    orionMemories[
      nextIndex
    ];

  const route =
    orionMemoryRoutes[
      orionMemoryIndex
    ];

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

  enteringOrion =
    true;

  navigationHint
    .classList
    .add(
      "hidden"
    );

  navigationHintHidden =
    true;

  orionMemoryIndex =
    -1;

  orionTransitioning =
    true;

  universeDragging =
    false;

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
    Fade title and begin travelling.
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

  app.classList.remove(
    "orion-memory-mode"
  );

  /*
    Pull back and reveal Orion again.
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
    1.22;

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
    "orion-memory-mode"
  );

  /*
    Return to a comfortable universe
    view centred around Orion.
  */

  targetZoom =
    1;

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

  /*
    Keep entering-orion active until
    the chapter has actually closed.
  */

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

      enteringOrion =
        false;

      orionTransitioning =
        false;

      orionMemoryIndex =
        -1;
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

    orionTransitioning = false;

    travelToNextOrionMemory();
  }
);

orionReturn.addEventListener(
  "click",
  event => {
    event.preventDefault();
    event.stopPropagation();

    /*
      Only completing the chapter
      permanently reveals Orion's label.
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

    /*
      Emergency exit does NOT mark
      Orion as completed.
    */

    leaveOrionChapter();
  }
);

/* =========================================================
   TAP DISCOVERED ORION
========================================================= */

let appTapStartX =
  0;

let appTapStartY =
  0;


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
      rect.width *
      .12;

    const paddingY =
      rect.height *
      .08;

    const insideOrion =
      event.clientX >=
        rect.left +
        paddingX &&

      event.clientX <=
        rect.right -
        paddingX &&

      event.clientY >=
        rect.top +
        paddingY &&

      event.clientY <=
        rect.bottom -
        paddingY;

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
   VIRGO CHAPTER
========================================================= */

const virgoChapter =
  document.getElementById(
    "virgoChapter"
  );

const virgoChapterIntro =
  document.getElementById(
    "virgoChapterIntro"
  );

const virgoExit =
  document.getElementById(
    "virgoExit"
  );

let enteringVirgo =
  false;


/* =========================================================
   ENTER VIRGO
========================================================= */

function enterVirgoChapter() {
  if (
    !virgoDiscovered ||
    enteringVirgo ||
    telescopeActive
  ) {
    return;
  }

  enteringVirgo =
    true;

  /*
    Virgo is a reading experience.
    Freeze normal universe navigation
    until Faris returns to the map.
  */

  universeDragging =
    false;

  activePointers.clear();

  pinchStartDistance =
    0;

  app.classList.remove(
    "dragging"
  );

  navigationHint
    .classList
    .add(
      "hidden"
    );

  navigationHintHidden =
    true;

  virgoChapter
    .classList
    .add(
      "active"
    );

  virgoChapter
    .setAttribute(
      "aria-hidden",
      "false"
    );

  app.classList.add(
    "entering-virgo"
  );

  /*
    Move the REAL Virgo toward the centre.
    Don't zoom further in.
  */

  const rect =
    virgo.getBoundingClientRect();

  const centreX =
    rect.left +
    rect.width / 2;

  const centreY =
    rect.top +
    rect.height / 2;

  /*
    Place Virgo slightly above centre,
    leaving room underneath for copy.
  */

  const desiredX =
    window.innerWidth /
    2;

  const desiredY =
    window.innerHeight *
    .40;

  const moveX =
    (
      desiredX -
      centreX
    ) /
    zoom;

  const moveY =
    (
      desiredY -
      centreY
    ) /
    zoom;

  /*
    Move Virgo immediately to its
    chapter position instead of leaving
    the universe camera easing behind it.
  */

  cameraX +=
    moveX;

  cameraY +=
    moveY;

  targetX =
    cameraX;

  targetY =
    cameraY;

  /*
    Keep the current zoom.
  */

  targetZoom =
    zoom;

  clampCamera();

  resetVirgoExperience();

  virgo.classList.remove(
    "virgo-focused"
  );

  virgoExperience
    .classList
    .remove(
      "show"
    );

  virgoExperience
    .setAttribute(
      "aria-hidden",
      "true"
    );

  /*
    Show intro.
  */

  setTimeout(
    () => {
      virgoChapterIntro
        .classList
        .add(
          "show"
        );
    },
    650
  );

  /*
    Fade intro.
  */

  setTimeout(
    () => {
      virgoChapterIntro
        .classList
        .remove(
          "show"
        );
    },
    2400
  );

  /*
    Camera has settled by now.
    Position the invisible buttons
    over the REAL Virgo.
  */

  setTimeout(
    () => {
      positionVirgoExperience();

      virgoExperience
        .classList
        .add(
          "show"
        );

      virgo.classList.add(
        "memory-active"
      );

      virgoExperience
        .setAttribute(
          "aria-hidden",
          "false"
        );
    },
    3100
  );
}


/* =========================================================
   LEAVE VIRGO
========================================================= */

function leaveVirgoChapter() {
  virgoExperience
    .classList
    .remove(
      "show"
    );

  virgo.classList.remove(
    "memory-active"
  );

  virgoExperience
    .setAttribute(
      "aria-hidden",
      "true"
    );

  virgoChapterIntro
    .classList
    .remove(
      "show"
    );

  setTimeout(
    () => {
      virgoChapter
        .classList
        .remove(
          "active"
        );

      virgoChapter
        .setAttribute(
          "aria-hidden",
          "true"
        );

      app.classList.remove(
        "entering-virgo"
      );

      enteringVirgo =
        false;
    },
    650
  );
}


/* =========================================================
   VIRGO — THROUGH MY EYES
========================================================= */

const virgoExperience =
  document.getElementById(
    "virgoExperience"
  );

const virgoMemory =
  document.getElementById(
    "virgoMemory"
  );

const virgoMemoryNumber =
  document.getElementById(
    "virgoMemoryNumber"
  );

const virgoMemoryText =
  document.getElementById(
    "virgoMemoryText"
  );

const virgoExploreHint =
  document.getElementById(
    "virgoExploreHint"
  );

const virgoHitLayer =
  document.getElementById(
    "virgoHitLayer"
  );


/* =========================================================
   POSITION VIRGO EXPERIENCE
========================================================= */

function positionVirgoExperience() {
  const rect =
    virgo.getBoundingClientRect();

  /*
    Keep the writing underneath Virgo,
    but reserve enough room for long
    memories such as Spica.
  */

  const preferredTop =
    rect.bottom +
    18;

  const latestSafeTop =
    window.innerHeight *
    .67;

  const memoryTop =
    Math.min(
      preferredTop,
      latestSafeTop
    );

  virgoExperience.style.setProperty(
    "--virgo-memory-top",
    `${memoryTop}px`
  );

  virgoExperience.style.setProperty(
    "--virgo-memory-bottom",
    `${Math.max(
      28,
      window.innerHeight *
      .035
    )}px`
  );
}


/* =========================================================
   VIRGO MEMORY STARS
========================================================= */

const virgoMemoryStars =
  Array.from(
    document.querySelectorAll(
      ".virgo-memory-star"
    )
  );


/* =========================================================
   VIRGO MEMORIES
========================================================= */

const virgoChapterMemories = {

  Vindemiatrix: {

    title:
      "the faces you make",

    text:
      "i swear i know so many of your faces by now. the face you make when you're judging me, when you're trying not to laugh, when you're annoyed with me... even that stupid pleased-with-yourself look after you purposely annoy me. sometimes i already know what you're thinking before you even say anything."

  },


  Auva: {

    title:
      "your voice",

    text:
      "you know how you always say you can't sing? i genuinely like listening to you sing bb. especially when you're just randomly singing while doing something and you're not even thinking about it. sometimes i don't say anything cos i don't want you to stop HAHAHA."

  },


  Porrima: {

    title:
      "when something excites you",

    text:
      "i like watching you talk about something you're actually excited about. you start explaining everything to me and suddenly you have so much to say. even when i don't know half of what you're talking about, i like listening cos i like seeing you like that."

  },


  Zaniah: {

    title:
      "the little ways you care for me",

    text:
      "i don't think you realise how many little things you do that make me feel cared for. they're probably nothing to you because you just... do them. but i notice them bb."

  },


  Zavijava: {

    title:
      "the you i get to see",

    text:
      "and then there's this version of you. the random noises, stupid jokes, you purposely annoying me and then looking so happy with yourself when it works. i don't think this is the version of you everyone gets to see... but he's one of my favourites."

  },


  Heze: {

    title:
      "give yourself some credit",

    text:
      "i've heard you call yourself useless, say you've failed, or feel like you're behind everyone else. and i know me telling you otherwise doesn't magically make you believe it. but from where i'm standing, i see someone who keeps trying even when he's tired and doesn't believe in himself anymore. i wish you'd give that version of you a little more credit."

  },


  Syrma: {

    title:
      "the person i see",

    text:
      "and yes... i look at you. a lot actually HAHAHA. your face when you're concentrating, your eyes, your smile, your hair when it's doing whatever tf it wants, the way you look when you've just woken up... there are so many versions of you that have somehow become my favourite face."

  },


  Spica: {

    title:
      "",

    text:
      "I know you don't always see yourself the way I see you. Sometimes you're so much harsher on yourself than I could ever be. And I wish, just for a little while, I could lend you my eyes so you could see the person I'm looking at when I look at you. Not some perfect version of you. Just you. All the little things you've just seen — the things you probably don't even think twice about — they're part of the person I've gotten to know and love. I wish you could see yourself through my eyes sometimes, sayang."

  }

};


const virgoVisited =
  new Set();


/* =========================================================
   RESET VIRGO
========================================================= */

function resetVirgoExperience() {

  virgoVisited.clear();


  virgo.classList.remove(
    "virgo-focused",
    "virgo-focus-1",
    "virgo-focus-2",
    "virgo-focus-3",
    "virgo-focus-4",
    "virgo-focus-5",
    "virgo-focus-6",
    "virgo-focus-7",
    "virgo-focus-complete"
  );


  virgoMemoryStars.forEach(
    star => {

      star.classList.remove(
        "active",
        "visited",
        "unlocked"
      );


      delete star.dataset.discoveryNumber;


      if (
        star.dataset.star ===
        "Spica"
      ) {

        star.classList.add(
          "locked"
        );

      }

    }
  );


  virgoMemory.classList.remove(
    "show"
  );


  virgoMemoryNumber.textContent =
    "";


  virgoMemoryText.textContent =
    "";


  virgoExploreHint.classList.remove(
    "hidden",
    "one-more"
  );


  virgoExploreHint.innerHTML =
    `
      <span>
        There are things I see in you that you don't always see in yourself.
      </span>

      <small>
        TOUCH THE GLOWING STARS TO SEE WHAT I MEAN
      </small>
    `;
}


/* =========================================================
   VIRGO FOCUS
========================================================= */

function updateVirgoFocus() {

  virgo.classList.remove(
    "virgo-focus-1",
    "virgo-focus-2",
    "virgo-focus-3",
    "virgo-focus-4",
    "virgo-focus-5",
    "virgo-focus-6",
    "virgo-focus-7"
  );


  if (
    virgoVisited.size > 0 &&
    virgoVisited.size <= 7
  ) {

    virgo.classList.add(
      `virgo-focus-${virgoVisited.size}`
    );

  }
}


/* =========================================================
   SHOW VIRGO MEMORY
========================================================= */

function showVirgoCopy(
  number,
  text
) {

  virgoMemory.classList.remove(
    "show"
  );


  setTimeout(
    () => {

      virgoMemoryNumber.textContent =
        number;


      virgoMemoryText.textContent =
        text;


      virgoMemory.classList.add(
        "show"
      );

    },
    180
  );
}


/* =========================================================
   OPEN VIRGO STAR
========================================================= */

function openVirgoMemory(
  star
) {

  const starName =
    star.dataset.star;


  const memory =
    virgoChapterMemories[
      starName
    ];


  if (!memory) {
    return;
  }


  /*
    SPICA BEFORE THE OTHER SEVEN
  */

  if (
    starName === "Spica" &&
    star.classList.contains(
      "locked"
    )
  ) {

    virgoMemoryStars.forEach(
      item => {

        item.classList.remove(
          "active"
        );

      }
    );


    star.classList.add(
      "active"
    );


    showVirgoCopy(
      "",
      "not this one yet, bb."
    );


    return;
  }


  /*
    Clear the previous active star.
  */

  virgoMemoryStars.forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );


  star.classList.add(
    "active",
    "visited"
  );


  /*
    NORMAL SEVEN STARS

    These can be explored in any order.
  */

  if (
    starName !== "Spica"
  ) {

    const alreadyVisited =
      virgoVisited.has(
        starName
      );


    const discoveryNumber =
      alreadyVisited
        ? star.dataset.discoveryNumber
        : String(
            virgoVisited.size + 1
          ).padStart(
            2,
            "0"
          );


    if (!alreadyVisited) {

      star.dataset.discoveryNumber =
        discoveryNumber;

    }


    virgoVisited.add(
      starName
    );


    updateVirgoFocus();

  }


  /*
    Reveal this star's message.

    Spica deliberately has no visible
    astronomy name/heading.
  */

  const memoryHeading =
    starName === "Spica"
      ? ""
      : `${star.dataset.discoveryNumber} · ${memory.title}`;


  showVirgoCopy(
    memoryHeading,
    memory.text
  );


  virgoExploreHint.classList.add(
    "hidden"
  );


  /*
    ALL SEVEN FOUND — WAKE SPICA
  */

  if (
    virgoVisited.size >= 7 &&
    starName !== "Spica"
  ) {

    const spica =
      document.querySelector(
        '.virgo-memory-star[data-star="Spica"]'
      );


    if (spica) {

      spica.classList.remove(
        "locked"
      );


      spica.classList.add(
        "unlocked"
      );

    }


    /*
      Let the current memory stay
      visible briefly before inviting
      him to Spica.
    */

    setTimeout(
      () => {

        if (
          virgoVisited.size >= 7 &&
          !virgo.classList.contains(
            "virgo-focus-complete"
          )
        ) {

          virgoExploreHint.innerHTML =
            `
              <span>
                one more.
              </span>
            `;


          virgoExploreHint.classList.add(
            "one-more"
          );


          virgoExploreHint.classList.remove(
            "hidden"
          );

        }

      },
      900
    );
  }


  /*
    SPICA — FINAL REVEAL
  */

  if (
    starName === "Spica"
  ) {

    virgo.classList.remove(
      "virgo-focus-1",
      "virgo-focus-2",
      "virgo-focus-3",
      "virgo-focus-4",
      "virgo-focus-5",
      "virgo-focus-6",
      "virgo-focus-7"
    );


    virgo.classList.add(
      "virgo-focus-complete"
    );


    virgoExploreHint.classList.add(
      "hidden"
    );

  }
}


/* =========================================================
   VIRGO STAR CONTROLS
========================================================= */

document.addEventListener(
  "pointerdown",
  event => {

    if (
      !enteringVirgo ||
      !virgo.classList.contains(
        "memory-active"
      )
    ) {
      return;
    }


    const virgoRect =
      virgo.getBoundingClientRect();


    /*
      Convert the tap into Virgo's own
      620 × 520 coordinate system.
    */

    const tapX =
      (
        (
          event.clientX -
          virgoRect.left
        ) /
        virgoRect.width
      ) * 620;


    const tapY =
      (
        (
          event.clientY -
          virgoRect.top
        ) /
        virgoRect.height
      ) * 520;


    /*
      Exact coordinates of the eight
      interactive Virgo stars.
    */

    const hitStars = [
      ["Vindemiatrix", 375, 183],
      ["Auva",         383, 276],
      ["Porrima",      310, 302],
      ["Spica",        295, 485],
      ["Zaniah",       310, 197],
      ["Zavijava",     225, 168],
      ["Heze",         419, 339],
      ["Syrma",        361, 435]
    ];


    /*
      Generous touch radius.
    */

    const hitRadius =
      38;


    const hit =
      hitStars.find(
        ([name, x, y]) =>
          Math.hypot(
            tapX - x,
            tapY - y
          ) <= hitRadius
      );


    if (!hit) {
      return;
    }


    const star =
      virgoMemoryStars.find(
        item =>
          item.dataset.star ===
          hit[0]
      );


    if (!star) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    openVirgoMemory(
      star
    );

  },
  true
);


/* =========================================================
   VIRGO EXIT
========================================================= */

virgoExit.addEventListener(
  "click",
  event => {

    event.preventDefault();

    event.stopPropagation();


    leaveVirgoChapter();

  }
);


/* =========================================================
   TAP DISCOVERED VIRGO
========================================================= */

let virgoTapStartX =
  0;

let virgoTapStartY =
  0;


app.addEventListener(
  "pointerdown",
  event => {

    if (
      !virgoDiscovered ||
      enteringVirgo ||
      enteringOrion ||
      telescopeActive
    ) {
      return;
    }


    virgoTapStartX =
      event.clientX;


    virgoTapStartY =
      event.clientY;

  },
  true
);


app.addEventListener(
  "pointerup",
  event => {

    if (
      !virgoDiscovered ||
      enteringVirgo ||
      enteringOrion ||
      telescopeActive
    ) {
      return;
    }


    const moved =
      Math.hypot(
        event.clientX -
        virgoTapStartX,

        event.clientY -
        virgoTapStartY
      );


    if (
      moved >= 18
    ) {
      return;
    }


    const rect =
      virgo.getBoundingClientRect();


    const paddingX =
      rect.width *
      .10;


    const paddingY =
      rect.height *
      .08;


    const insideVirgo =
      event.clientX >=
        rect.left +
        paddingX &&

      event.clientX <=
        rect.right -
        paddingX &&

      event.clientY >=
        rect.top +
        paddingY &&

      event.clientY <=
        rect.bottom -
        paddingY;


    if (
      insideVirgo
    ) {

      event.preventDefault();

      event.stopPropagation();


      enterVirgoChapter();

    }

  },
  true
);


/* =========================================================
   INITIALISE
========================================================= */

initialise();
