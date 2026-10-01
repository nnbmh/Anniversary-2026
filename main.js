/* =========================================================
   OUR LITTLE UNIVERSE
   main.js
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

const discoveryMessage = document.getElementById("discoveryMessage");
const discoveryNumber = document.getElementById("discoveryNumber");

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

const MIN_ZOOM = 0.62;
const MAX_ZOOM = 1.9;

const CAMERA_EASING = 0.105;
const ZOOM_EASING = 0.09;


/* =========================================================
   NORMAL UNIVERSE INPUT
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
   ORION
========================================================= */

let orionScreenX = window.innerWidth / 2;
let orionScreenY = window.innerHeight / 2;

let orionDiscovered = false;

let focusStartedAt = null;

const HOLD_TO_DISCOVER = 1800;


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

    const x =
      seededRandom(seed * 2.31) *
      width;

    const y =
      seededRandom(seed * 5.17) *
      height;

    /*
      Preserve darker areas instead of filling
      the entire sky evenly.
    */

    const emptyRegionA =
      Math.hypot(
        x - width * 0.25,
        y - height * 0.34
      );

    const emptyRegionB =
      Math.hypot(
        x - width * 0.73,
        y - height * 0.69
      );

    if (
      emptyRegionA < 370 &&
      seededRandom(seed * 8.4) < 0.62
    ) {
      continue;
    }

    if (
      emptyRegionB < 430 &&
      seededRandom(seed * 9.1) < 0.55
    ) {
      continue;
    }

    const sizeChance =
      seededRandom(seed * 11.4);

    const colourChance =
      seededRandom(seed * 13.7);

    const twinkleChance =
      seededRandom(seed * 17.1);

    createStar(layer, x, y, {
      tiny:
        sizeChance < 0.44,

      large:
        type === "near" &&
        sizeChance > 0.94,

      warm:
        colourChance > 0.975,

      cool:
        colourChance < 0.035,

      twinkle:
        type !== "deep" &&
        twinkleChance > 0.91,

      duration:
        6 +
        seededRandom(seed * 21.3) *
        8,

      opacity:
        type === "deep"
          ? 0.12 +
            seededRandom(seed * 25.2) *
            0.24
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

    const sizeChance =
      seededRandom(seed * 14.4);

    createStar(layer, x, y, {
      tiny:
        sizeChance < 0.66,

      large:
        type === "near" &&
        sizeChance > 0.985,

      twinkle:
        type !== "deep" &&
        seededRandom(seed * 18.8) > 0.965,

      duration:
        7 +
        seededRandom(seed * 22.4) *
        7,

      opacity:
        type === "deep"
          ? 0.10 +
            seededRandom(seed * 26.8) *
            0.22
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
    width * 0.43,
    height * 0.43,
    760,
    220,
    330,
    8000,
    "deep"
  );

  buildCluster(
    starsDeep,
    width * 0.64,
    height * 0.54,
    620,
    280,
    260,
    10000,
    "deep"
  );

  buildCluster(
    starsDeep,
    width * 0.18,
    height * 0.74,
    420,
    180,
    130,
    12000,
    "deep"
  );

  buildCluster(
    starsFar,
    width * 0.44,
    height * 0.44,
    650,
    220,
    95,
    14000,
    "far"
  );

  buildCluster(
    starsFar,
    width * 0.66,
    height * 0.54,
    520,
    240,
    75,
    16000,
    "far"
  );

  buildCluster(
    starsMid,
    width * 0.45,
    height * 0.44,
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
    universe.offsetWidth * 0.34;

  const limitY =
    universe.offsetHeight * 0.34;

  targetX =
    Math.max(
      -limitX,
      Math.min(limitX, targetX)
    );

  targetY =
    Math.max(
      -limitY,
      Math.min(limitY, targetY)
    );
}


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

  universe.style.transform = `
    translate(
      calc(-50% + ${cameraX}px),
      calc(-50% + ${cameraY}px)
    )
    scale(${zoom})
  `;

  starsDeep.style.transform = `
    translate(
      ${-cameraX * 0.018}px,
      ${-cameraY * 0.018}px
    )
  `;

  starsFar.style.transform = `
    translate(
      ${-cameraX * 0.032}px,
      ${-cameraY * 0.032}px
    )
  `;

  starsMid.style.transform = `
    translate(
      ${-cameraX * 0.052}px,
      ${-cameraY * 0.052}px
    )
  `;

  starsNear.style.transform = `
    translate(
      ${-cameraX * 0.075}px,
      ${-cameraY * 0.075}px
    )
  `;

  dustLayer.style.transform = `
    translate(
      ${-cameraX * 0.012}px,
      ${-cameraY * 0.012}px
    )
  `;
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

  const dpr =
    Math.min(
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
   TELESCOPE STAR FIELD
========================================================= */

const telescopeStars = [];


function buildTelescopeStars() {
  telescopeStars.length = 0;

  for (let i = 0; i < 1500; i++) {
    const x =
      (
        seededRandom(
          i * 2.13 + 40
        ) -
        0.5
      ) *
      1200;

    const y =
      (
        seededRandom(
          i * 4.71 + 80
        ) -
        0.5
      ) *
      900;

    const brightness =
      0.10 +
      seededRandom(
        i * 7.37 + 120
      ) *
      0.50;

    const chance =
      seededRandom(
        i * 11.91 + 160
      );

    let size = 0.42;

    if (chance > 0.70) {
      size = 0.62;
    }

    if (chance > 0.91) {
      size = 0.9;
    }

    if (chance > 0.978) {
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


function drawBrightStar(
  x,
  y,
  radius,
  brightness,
  glow
) {
  if (glow > 0) {
    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        12 + radius * 3
      );

    gradient.addColorStop(
      0,
      `rgba(210,229,255,${0.16 * glow})`
    );

    gradient.addColorStop(
      0.3,
      `rgba(179,210,249,${0.06 * glow})`
    );

    gradient.addColorStop(
      1,
      "rgba(150,190,240,0)"
    );

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      12 + radius * 3,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawStar(
    x,
    y,
    radius,
    brightness
  );
}


/* =========================================================
   ORION INSIDE TELESCOPE
========================================================= */

const telescopeOrionStars = [
  { x: -58, y: -72, size: 1.9 },
  { x: 58, y: -60, size: 1.7 },

  { x: -25, y: 0, size: 1.45 },
  { x: 0, y: 3, size: 1.55 },
  { x: 26, y: 7, size: 1.4 },

  { x: -1, y: 42, size: 1.05 },
  { x: -2, y: 67, size: 0.9 },

  { x: -46, y: 105, size: 1.55 },
  { x: 64, y: 108, size: 2.05 }
];


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


function drawTelescopeOrion(
  width,
  height
) {
  if (orionDiscovered) {
    return;
  }

  const distance =
    getOrionDistance();

  if (distance > 320) {
    return;
  }

  let intensity = 0.12;

  if (distance < 260) {
    intensity = 0.20;
  }

  if (distance < 200) {
    intensity = 0.32;
  }

  if (distance < 145) {
    intensity = 0.48;
  }

  if (distance < 95) {
    intensity = 0.72;
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
    0.55;

  const centreY =
    height / 2 +
    (
      orionScreenY -
      lensY
    ) *
    0.55;

  telescopeOrionStars.forEach(
    (star, index) => {
      let shimmer = 1;

      if (distance < 145) {
        shimmer =
          1 +
          Math.sin(
            performance.now() /
            470 +
            index * 0.9
          ) *
          0.10;
      }

      drawBrightStar(
        centreX + star.x,
        centreY + star.y,

        star.size *
        (
          0.8 +
          intensity * 0.5
        ) *
        shimmer,

        0.20 +
        intensity * 0.78,

        distance < 145
          ? intensity
          : 0
      );
    }
  );
}


/* =========================================================
   DRAW TELESCOPE
========================================================= */

function drawTelescopeBackground(
  width,
  height
) {
  ctx.fillStyle = "#07111d";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const glow =
    ctx.createRadialGradient(
      width * 0.43,
      height * 0.38,
      0,

      width * 0.5,
      height * 0.5,
      width * 0.7
    );

  glow.addColorStop(
    0,
    "rgba(29,45,65,.10)"
  );

  glow.addColorStop(
    0.55,
    "rgba(8,18,31,.035)"
  );

  glow.addColorStop(
    1,
    "rgba(0,2,7,0)"
  );

  ctx.fillStyle = glow;

  ctx.fillRect(
    0,
    0,
    width,
    height
  );
}


function drawTelescopeStars(
  width,
  height
) {
  const fieldOffsetX =
    lensX * 0.52;

  const fieldOffsetY =
    lensY * 0.52;

  const wrapWidth = 1200;
  const wrapHeight = 900;

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
          wrapWidth * 10
        ) %
        wrapWidth;

      y =
        (
          y +
          wrapHeight * 10
        ) %
        wrapHeight;

      if (x > width + 100) {
        x -= wrapWidth;
      }

      if (y > height + 100) {
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

      drawStar(
        x,
        y,
        star.size,
        star.brightness
      );
    }
  );
}


function renderTelescope() {
  if (!telescopeActive) {
    return;
  }

  lensX +=
    (targetLensX - lensX) *
    0.24;

  lensY +=
    (targetLensY - lensY) *
    0.24;

  /*
    The actual eyepiece moves.
  */

  eyepiece.style.left =
    `${lensX}px`;

  eyepiece.style.top =
    `${lensY}px`;

  const rect =
    eyepiece.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

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
   TELESCOPE MOVEMENT
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
   TELESCOPE ON / OFF
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

    targetLensX = lensX;
    targetLensY = lensY;

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
   TELESCOPE POINTER INPUT

   One system handles touch, Apple Pencil and mouse.
========================================================= */

telescopeView.addEventListener(
  "pointerdown",
  event => {
    if (!telescopeActive) {
      return;
    }

    telescopeDragging = true;
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
    if (!telescopeActive) {
      return;
    }

    /*
      Mouse can move the telescope without
      requiring the button to be held.
    */

    if (
      event.pointerType === "mouse"
    ) {
      moveLens(
        event.clientX,
        event.clientY
      );

      return;
    }

    /*
      Touch/Pencil moves only while dragging.
    */

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


function endTelescopePointer(event) {
  if (
    event.pointerId !==
    telescopePointerId
  ) {
    return;
  }

  telescopeDragging = false;
  telescopePointerId = null;

  /*
    Telescope stays where it was released.
  */
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

function checkOrionFocus(timestamp) {
  if (
    !telescopeActive ||
    orionDiscovered
  ) {
    focusStartedAt = null;
    return;
  }

  const distance =
    getOrionDistance();

  if (
    distance > 75 ||
    telescopeDragging
  ) {
    focusStartedAt = null;
    return;
  }

  if (focusStartedAt === null) {
    focusStartedAt = timestamp;
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
  if (orionDiscovered) {
    return;
  }

  orionDiscovered = true;
  focusStartedAt = null;

  /*
    Reveal Orion in the main universe.
  */

  orion.classList.add(
    "discovered"
  );

  discoveryNumber.textContent = "1";

  /*
    Temporary notification only.
    The permanent ORION / The Beginning label
    is handled by the Orion HTML + CSS.
  */

  setTimeout(
    () => {
      setTelescope(false);
    },
    800
  );

  /*
    Remove the temporary notification.
  */

/* =========================================================
   NORMAL UNIVERSE POINTER INPUT
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
        x: event.clientX,
        y: event.clientY
      }
    );

    if (
      activePointers.size === 1
    ) {
      universeDragging = true;

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
      activePointers.size === 2
    ) {
      universeDragging = false;

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
    if (telescopeActive) {
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

      const distance =
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

    /*
      Drag universe
    */

    if (universeDragging) {
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


function endUniversePointer(event) {
  if (telescopeActive) {
    return;
  }

  activePointers.delete(
    event.pointerId
  );

  if (
    activePointers.size === 0
  ) {
    universeDragging = false;

    pinchStartDistance = 0;

    app.classList.remove(
      "dragging"
    );

    return;
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

    universeDragging = true;
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
   DESKTOP / TRACKPAD ZOOM
========================================================= */

app.addEventListener(
  "wheel",
  event => {
    if (telescopeActive) {
      return;
    }

    event.preventDefault();

    targetZoom +=
      -event.deltaY *
      0.001;

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

let navigationHintHidden = false;


function hideNavigationHint() {
  if (navigationHintHidden) {
    return;
  }

  navigationHintHidden = true;

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

    if (!telescopeActive) {
      return;
    }

    const position =
      clampLens(
        targetLensX,
        targetLensY
      );

    lensX = position.x;
    lensY = position.y;

    targetLensX = position.x;
    targetLensY = position.y;

    requestAnimationFrame(
      resizeTelescopeCanvas
    );
  }
);


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate(timestamp) {
  renderCamera();

  updateOrionPosition();

  renderTelescope();

  checkOrionFocus(timestamp);

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

  setTelescope(false);

  requestAnimationFrame(
    animate
  );
}


initialise();
