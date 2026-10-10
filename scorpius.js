/* ==========================================
   SCORPIUS STAR POSITIONS

   Shape based on your reference:
   - Head at upper right
   - Antares near upper centre
   - Body curves downward to the left
   - Tail hooks upward at lower left
========================================== */

const scorpiusStars = [

  // Head and upper branches

  {
    id: "jabbah",
    x: 455,
    y: 65,
    size: 3.5
  },

  {
    id: "acrab",
    x: 470,
    y: 120,
    size: 4.0
  },

  {
    id: "dschubba",
    x: 468,
    y: 165,
    size: 4.2
  },

  {
    id: "pi",
    x: 415,
    y: 145,
    size: 2.8
  },


  // Antares — warm reddish heart

  {
    id: "antares",
    x: 355,
    y: 190,
    size: 6.2
  },


  // Body descending left

  {
    id: "tau",
    x: 330,
    y: 225,
    size: 3.0
  },

  {
    id: "epsilon",
    x: 285,
    y: 315,
    size: 3.5
  },

  {
    id: "mu",
    x: 280,
    y: 380,
    size: 2.8
  },

  {
    id: "zeta",
    x: 275,
    y: 455,
    size: 3.0
  },


  // Lower curve

  {
    id: "eta",
    x: 215,
    y: 475,
    size: 3.2
  },

  {
    id: "sargas",
    x: 155,
    y: 475,
    size: 4.5
  },


  // Tail hooking upward

  {
    id: "iota",
    x: 120,
    y: 430,
    size: 2.8
  },

  {
    id: "kappa",
    x: 135,
    y: 405,
    size: 3.0
  },

  {
    id: "shaula",
    x: 155,
    y: 380,
    size: 5.0
  },

  {
    id: "lesath",
    x: 165,
    y: 365,
    size: 3.8
  }

];

/* ==========================================
   SCORPIUS CONNECTIONS

   Follows the reference silhouette.
   Lines are reserved for discovery.
========================================== */

const scorpiusConnections = [

  // Head and branches

  ["jabbah", "acrab"],
  ["acrab", "dschubba"],

  ["acrab", "pi"],
  ["pi", "antares"],

  // Body

  ["antares", "tau"],
  ["tau", "epsilon"],
  ["epsilon", "mu"],
  ["mu", "zeta"],

  // Lower curve

  ["zeta", "eta"],
  ["eta", "sargas"],

  // Hooked tail

  ["sargas", "iota"],
  ["iota", "kappa"],
  ["kappa", "shaula"],
  ["shaula", "lesath"]

];


/* ==========================================
   PERSONALITY STARS

   Reserved for the chapter.
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
   SCORPIUS STAR DESIGNS

   Uses the same settings as
   Orion and Virgo in main.js.
========================================== */

const scorpiusStarDesigns = {
  jabbah: {
    flareV: 0.82,
    flareH: 0.66,
    glow: 0.70,
    speed: 0.54,
    phase: 0.4
  },

  acrab: {
    flareV: 1.02,
    flareH: 0.78,
    glow: 0.85,
    speed: 0.59,
    phase: 1.8
  },

  dschubba: {
    flareV: 1.12,
    flareH: 0.90,
    glow: 0.95,
    speed: 0.70,
    phase: 3.1
  },

  pi: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 5.2
  },

  antares: {
    flareV: 1.55,
    flareH: 1.18,
    glow: 1.35,
    speed: 0.62,
    phase: 0.5
  },

  tau: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 2.7
  },

  epsilon: {
    flareV: 0.95,
    flareH: 0.78,
    glow: 0.82,
    speed: 0.58,
    phase: 1.6
  },

  mu: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 4.7
  },

  zeta: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 3.4
  },

  eta: {
    flareV: 0.76,
    flareH: 0.62,
    glow: 0.70,
    speed: 0.53,
    phase: 2.1
  },

  sargas: {
    flareV: 1.22,
    flareH: 0.94,
    glow: 1.00,
    speed: 0.66,
    phase: 2.8
  },

  iota: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 5.5
  },

  kappa: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 1.1
  },

  shaula: {
    flareV: 1.35,
    flareH: 1.05,
    glow: 1.05,
    speed: 0.72,
    phase: 0.3
  },

  lesath: {
    flareV: 0.90,
    flareH: 0.70,
    glow: 0.76,
    speed: 0.60,
    phase: 5.3
  }
};/* ==========================================
   SCORPIUS STAR DESIGNS

   Uses the same settings as
   Orion and Virgo in main.js.
========================================== */

const scorpiusStarDesigns = {
  jabbah: {
    flareV: 0.82,
    flareH: 0.66,
    glow: 0.70,
    speed: 0.54,
    phase: 0.4
  },

  acrab: {
    flareV: 1.02,
    flareH: 0.78,
    glow: 0.85,
    speed: 0.59,
    phase: 1.8
  },

  dschubba: {
    flareV: 1.12,
    flareH: 0.90,
    glow: 0.95,
    speed: 0.70,
    phase: 3.1
  },

  pi: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 5.2
  },

  antares: {
    flareV: 1.55,
    flareH: 1.18,
    glow: 1.35,
    speed: 0.62,
    phase: 0.5
  },

  tau: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 2.7
  },

  epsilon: {
    flareV: 0.95,
    flareH: 0.78,
    glow: 0.82,
    speed: 0.58,
    phase: 1.6
  },

  mu: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 4.7
  },

  zeta: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 3.4
  },

  eta: {
    flareV: 0.76,
    flareH: 0.62,
    glow: 0.70,
    speed: 0.53,
    phase: 2.1
  },

  sargas: {
    flareV: 1.22,
    flareH: 0.94,
    glow: 1.00,
    speed: 0.66,
    phase: 2.8
  },

  iota: {
    flareV: 0.55,
    flareH: 0.44,
    glow: 0.45,
    speed: 0.60,
    phase: 5.5
  },

  kappa: {
    flareV: 0.68,
    flareH: 0.52,
    glow: 0.55,
    speed: 0.74,
    phase: 1.1
  },

  shaula: {
    flareV: 1.35,
    flareH: 1.05,
    glow: 1.05,
    speed: 0.72,
    phase: 0.3
  },

  lesath: {
    flareV: 0.90,
    flareH: 0.70,
    glow: 0.76,
    speed: 0.60,
    phase: 5.3
  }
};

/* ==========================================
   CREATE CONSTELLATION
========================================== */

function initialiseScorpius() {

  const universeElement =
    document.getElementById("universe");

  if (!universeElement) {
    return;
  }


  // Avoid duplicate constellations

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


  /*
    Important:

    This constellation must not
    intercept touch or pointer
    events while exploring.

    The universe must remain draggable.
  */

  scorpiusElement.style.pointerEvents =
    "none";


  universeElement.appendChild(
    scorpiusElement
  );


  scorpiusCanvas =
    scorpiusElement.querySelector(
      "canvas"
    );


  if (!scorpiusCanvas) {
    return;
  }


  scorpiusContext =
    scorpiusCanvas.getContext("2d");

   const dpr = Math.min(
  window.devicePixelRatio || 1,
  2
);

scorpiusCanvas.width = Math.round(560 * dpr);
scorpiusCanvas.height = Math.round(620 * dpr);

scorpiusContext.setTransform(
  dpr, 0, 0, dpr, 0, 0
);


  if (!scorpiusContext) {
    return;
  }


  scorpiusReady = true;


  requestAnimationFrame(
    animateScorpius
  );

}


/* ==========================================
   STAR RENDERING

   Reuses drawConstellationStar()
   from main.js.
========================================== */

function drawScorpiusStar(star, timestamp) {
  if (!scorpiusContext) return;

  const sizes = {
    jabbah: 1.7,
    acrab: 2.0,
    dschubba: 2.3,
    pi: 1.35,
    antares: 2.8,
    tau: 1.5,
    epsilon: 1.85,
    mu: 1.3,
    zeta: 1.45,
    eta: 1.6,
    sargas: 2.2,
    iota: 1.25,
    kappa: 1.5,
    shaula: 2.45,
    lesath: 1.8
  };

  const isAntares = star.id === "antares";
   
   constellationStarDesigns[star.id] =
      scorpiusStarDesigns[star.id];

  const displaySize = isAntares
    ? sizes[star.id] * 1.22
    : Math.max(1.05, sizes[star.id] * 1.16);

  drawConstellationStar(
    scorpiusContext,
    star.x + 30,
    star.y + 35,
    displaySize,
    isAntares ? "warm" : "neutral",
    star.id,
    timestamp / 1000,
    1
  );
}

/* ==========================================
   ANIMATION

   Separate from main.js.

   If Scorpius encounters an error,
   its animation stops without
   stopping the universe's loop.
========================================== */

function animateScorpius(timestamp) {

  if (
    !scorpiusReady ||
    !scorpiusContext
  ) {
    return;
  }


  try {

    scorpiusContext.clearRect(
      0,
      0,
      560,
      620
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
   INITIALISE
========================================== */

initialiseScorpius();
