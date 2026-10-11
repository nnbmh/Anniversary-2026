/* ==========================================
   SCORPIUS · 17.11

   Uses Orion's original star renderer.

   Larger stars: Betelgeuse
   Smaller stars: Bellatrix

   Includes animated diffraction rays.

   Antares remains unchanged.
========================================== */


/* ==========================================
   STAR POSITIONS
========================================== */

const scorpiusStars = [

  { id: "jabbah", x: 455, y: 65, size: 3.5 },
  { id: "acrab", x: 470, y: 120, size: 4.0 },
  { id: "dschubba", x: 468, y: 165, size: 4.2 },
  { id: "pi", x: 415, y: 145, size: 2.8 },

  { id: "antares", x: 355, y: 190, size: 6.2 },

  { id: "tau", x: 330, y: 225, size: 3.0 },
  { id: "epsilon", x: 285, y: 315, size: 3.5 },
  { id: "mu", x: 280, y: 380, size: 2.8 },
  { id: "zeta", x: 275, y: 455, size: 3.0 },

  { id: "eta", x: 215, y: 475, size: 3.2 },
  { id: "sargas", x: 155, y: 475, size: 4.5 },

  { id: "iota", x: 120, y: 430, size: 2.8 },
  { id: "kappa", x: 135, y: 405, size: 3.0 },
  { id: "shaula", x: 155, y: 380, size: 5.0 },
  { id: "lesath", x: 165, y: 365, size: 3.8 }

];


/* ==========================================
   CONNECTIONS
========================================== */

const scorpiusConnections = [

  ["jabbah", "acrab"],
  ["acrab", "dschubba"],

  ["acrab", "pi"],
  ["pi", "antares"],

  ["antares", "tau"],
  ["tau", "epsilon"],
  ["epsilon", "mu"],
  ["mu", "zeta"],

  ["zeta", "eta"],
  ["eta", "sargas"],

  ["sargas", "iota"],
  ["iota", "kappa"],
  ["kappa", "shaula"],
  ["shaula", "lesath"]

];


/* ==========================================
   PERSONALITIES
========================================== */

const scorpiusPersonalities = {

  dschubba: "The Little Menace",
  acrab: "Make Up Your Mind",
  sargas: "The Social Battery",
  shaula: "The Soft Side",
  jabbah: "The Shield",
  lesath: "Behind the Silence"

};


/* ==========================================
   STATE
========================================== */

let scorpiusElement = null;
let scorpiusCanvas = null;
let scorpiusContext = null;
let scorpiusReady = false;


/* ==========================================
   STAR APPEARANCES

   These sizes match our previous version.

   Betelgeuse = prominent stars
   Bellatrix = smaller stars
========================================== */

const scorpiusStarVariations = {

  jabbah:   { size: 2.25, type: "Bellatrix" },
  acrab:    { size: 2.65, type: "Bellatrix" },
  dschubba: { size: 3.42, type: "Betelgeuse" },
  pi:       { size: 2.10, type: "Bellatrix" },

  tau:      { size: 2.30, type: "Bellatrix" },
  epsilon:  { size: 2.75, type: "Bellatrix" },
  mu:       { size: 2.05, type: "Bellatrix" },
  zeta:     { size: 2.40, type: "Bellatrix" },

  eta:      { size: 2.65, type: "Bellatrix" },
  sargas:   { size: 3.42, type: "Betelgeuse" },

  iota:     { size: 2.10, type: "Bellatrix" },
  kappa:    { size: 2.40, type: "Bellatrix" },
  shaula:   { size: 3.42, type: "Betelgeuse" },
  lesath:   { size: 2.50, type: "Bellatrix" }

};


/* ==========================================
   SOFT DIFFRACTION RAYS

   Uses fading gradients rather than
   straight, uniformly coloured lines.

   The rays taper naturally into darkness.
========================================== */

function drawScorpiusDiffractionRays(
  context,
  x,
  y,
  size,
  time,
  index
) {

  const phase = index * 1.37;

  const shimmer =
    (Math.sin(time * 0.75 + phase) + 1) / 2;

  const opacity =
    0.48 + shimmer * 0.32;

  const verticalLength =
    size * 13;

  const horizontalLength =
    size * 10;

  context.save();

  context.globalAlpha = opacity;

  /*
    Vertical tapered ray
  */

  const verticalGradient =
    context.createLinearGradient(
      x,
      y - verticalLength,
      x,
      y + verticalLength
    );

  verticalGradient.addColorStop(
    0,
    "rgba(195,220,255,0)"
  );

  verticalGradient.addColorStop(
    0.30,
    "rgba(195,220,255,0.05)"
  );

  verticalGradient.addColorStop(
    0.47,
    "rgba(235,245,255,0.38)"
  );

  verticalGradient.addColorStop(
    0.5,
    "rgba(255,255,255,0.85)"
  );

  verticalGradient.addColorStop(
    0.53,
    "rgba(235,245,255,0.38)"
  );

  verticalGradient.addColorStop(
    0.70,
    "rgba(195,220,255,0.05)"
  );

  verticalGradient.addColorStop(
    1,
    "rgba(195,220,255,0)"
  );

  context.beginPath();

  context.moveTo(
    x,
    y - verticalLength
  );

  context.lineTo(
    x,
    y + verticalLength
  );

  context.strokeStyle =
    verticalGradient;

  context.lineWidth = 0.55;

  context.stroke();


  /*
    Horizontal tapered ray
  */

  const horizontalGradient =
    context.createLinearGradient(
      x - horizontalLength,
      y,
      x + horizontalLength,
      y
    );

  horizontalGradient.addColorStop(
    0,
    "rgba(195,220,255,0)"
  );

  horizontalGradient.addColorStop(
    0.30,
    "rgba(195,220,255,0.05)"
  );

  horizontalGradient.addColorStop(
    0.47,
    "rgba(235,245,255,0.32)"
  );

  horizontalGradient.addColorStop(
    0.5,
    "rgba(255,255,255,0.75)"
  );

  horizontalGradient.addColorStop(
    0.53,
    "rgba(235,245,255,0.32)"
  );

  horizontalGradient.addColorStop(
    0.70,
    "rgba(195,220,255,0.05)"
  );

  horizontalGradient.addColorStop(
    1,
    "rgba(195,220,255,0)"
  );

  context.beginPath();

  context.moveTo(
    x - horizontalLength,
    y
  );

  context.lineTo(
    x + horizontalLength,
    y
  );

  context.strokeStyle =
    horizontalGradient;

  context.lineWidth = 0.45;

  context.stroke();

  context.restore();

}


/* ==========================================
   DRAW INDIVIDUAL STARS
========================================== */

function drawScorpiusStar(star, timestamp) {

  if (!scorpiusContext) return;

  const x = star.x + 30;
  const y = star.y + 35;

  const time = timestamp / 1000;


  /*
    ANTARES

    Original rendering unchanged.
  */

  if (star.id === "antares") {

    drawConstellationStar(
      scorpiusContext,
      x,
      y,
      3.05 * 1.52,
      "warm",
      "Spica",
      time,
      1
    );

    return;

  }


  const variation =
    scorpiusStarVariations[star.id];

  if (!variation) return;

  const index =
    scorpiusStars.indexOf(star);

  /*
    Give each star a slightly different
    twinkling phase.
  */

  const starTime =
    time + index * 0.37;

  const tone =
    variation.type === "Betelgeuse"
      ? "warm"
      : "neutral";


  /*
    First draw the delicate diffraction
    rays behind the star.
  */

  drawScorpiusDiffractionRays(
    scorpiusContext,
    x,
    y,
    variation.size,
    time,
    index
  );


  /*
    Then draw the original Orion star.

    This includes Orion's own:
    - Soft glow
    - Four-pointed core
    - Vertical diffraction ray
    - Horizontal diffraction ray
    - Animated shimmer
  */

  drawConstellationStar(
    scorpiusContext,
    x,
    y,
    variation.size,
    tone,
    variation.type,
    starTime,
    1
  );

}


/* ==========================================
   CREATE CONSTELLATION
========================================== */

function initialiseScorpius() {

  const universeElement =
    document.getElementById("universe");

  if (!universeElement) return;

  if (
    document.getElementById("scorpius")
  ) {
    return;
  }

  scorpiusElement =
    document.createElement("section");

  scorpiusElement.id = "scorpius";

  scorpiusElement.className =
    "constellation";

  scorpiusElement.innerHTML = `

    <canvas
      class="scorpius-universe-canvas"
      width="560"
      height="620"
      aria-hidden="true"
    ></canvas>

    <div class="scorpius-universe-label">
      SCORPIUS · 17.11
    </div>

  `;

  scorpiusElement.style.pointerEvents =
    "none";

  universeElement.appendChild(
    scorpiusElement
  );

  scorpiusCanvas =
    scorpiusElement.querySelector(
      "canvas"
    );

  if (!scorpiusCanvas) return;

  scorpiusContext =
    scorpiusCanvas.getContext("2d");

  if (!scorpiusContext) return;

  const cssWidth =
    scorpiusElement.offsetWidth;

  const cssHeight =
    scorpiusElement.offsetHeight;

  if (
    cssWidth <= 0 ||
    cssHeight <= 0
  ) {
    return;
  }

  const glowPadding = 80;

  const canvasHeight =
    cssHeight + glowPadding;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  scorpiusCanvas.width =
    Math.round(cssWidth * dpr);

  scorpiusCanvas.height =
    Math.round(canvasHeight * dpr);

  scorpiusCanvas.style.width =
    `${cssWidth}px`;

  scorpiusCanvas.style.height =
    `${canvasHeight}px`;

  scorpiusContext.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  scorpiusReady = true;

  requestAnimationFrame(
    animateScorpius
  );

}


/* ==========================================
   ANIMATION
========================================== */

function animateScorpius(timestamp) {

  if (
    !scorpiusReady ||
    !scorpiusContext
  ) {
    return;
  }

  try {

    const width =
      scorpiusElement.offsetWidth;

    const height =
      scorpiusElement.offsetHeight;

    if (
      width <= 0 ||
      height <= 0
    ) {

      requestAnimationFrame(
        animateScorpius
      );

      return;
    }

    scorpiusContext.clearRect(
      0,
      0,
      width,
      scorpiusCanvas.offsetHeight
    );

    scorpiusStars.forEach(star => {

      drawScorpiusStar(
        star,
        timestamp
      );

    });

  } catch (error) {

    console.error(
      "Scorpius rendering error:",
      error
    );

    scorpiusReady = false;

    return;
  }

  requestAnimationFrame(
    animateScorpius
  );

}


/* ==========================================
   START
========================================== */

initialiseScorpius();
