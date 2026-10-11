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

  // Same visual settings as Orion and Virgo

  jabbah: {
    ...constellationStarDesigns.Mintaka
  },

  acrab: {
    ...constellationStarDesigns.Saiph
  },

  dschubba: {
    ...constellationStarDesigns.Bellatrix
  },

  pi: {
    ...constellationStarDesigns["Sword 2"]
  },

  // Antares uses Spica's visual settings
  antares: {
    ...constellationStarDesigns.Spica
  },

  tau: {
    ...constellationStarDesigns["Sword 1"]
  },

  epsilon: {
    ...constellationStarDesigns.Auva
  },

  mu: {
    ...constellationStarDesigns["Sword 2"]
  },

  zeta: {
    ...constellationStarDesigns["Sword 1"]
  },

  eta: {
    ...constellationStarDesigns.Zaniah
  },

  sargas: {
    ...constellationStarDesigns.Porrima
  },

  iota: {
    ...constellationStarDesigns["Sword 2"]
  },

  kappa: {
    ...constellationStarDesigns.Heze
  },

  shaula: {
    ...constellationStarDesigns.Vindemiatrix
  },

  lesath: {
    ...constellationStarDesigns.Syrma
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

   if (!scorpiusContext) {
    return;
  }

  const cssWidth = scorpiusElement.offsetWidth;
  const cssHeight = scorpiusElement.offsetHeight;

  if (cssWidth <= 0 || cssHeight <= 0) {
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
    dpr, 0, 0, dpr, 0, 0
  );


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

  const scales = {
    jabbah: 0.30,
    acrab: 0.43,
    dschubba: 0.56,
    pi: 0.22,
    antares: 1,
    tau: 0.35,
    epsilon: 0.49,
    mu: 0.24,
    zeta: 0.29,
    eta: 0.41,
    sargas: 0.61,
    iota: 0.21,
    kappa: 0.33,
    shaula: 0.65,
    lesath: 0.38
  };

  const scale = scales[star.id];

  if (scale === undefined) return;

  const isAntares = star.id === "antares";

  const x = star.x + 30;
  const y = star.y + 35;

  const time = timestamp / 1000;

  // Preserve Antares exactly as it currently appears.
  if (isAntares) {
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

  /*
    Draw a proportionally smaller version
    of Antares's four-pointed shape.

    Scaling the canvas also scales the
    ray thickness and central glow.
  */

  const index = scorpiusStars.indexOf(star);

  const gentlePulse =
    0.94 +
    0.025 *
    Math.sin(time * 0.7 + index * 1.8);

  scorpiusContext.save();

  scorpiusContext.translate(x, y);
  scorpiusContext.scale(scale, scale);

  drawConstellationStar(
    scorpiusContext,
    0,
    0,
    3.05 * 1.52,
    "neutral",
    "Spica",
    0,
    gentlePulse
  );

  scorpiusContext.restore();
}

/* ==========================================
   ANIMATION

   Separate from main.js.

   If Scorpius encounters an error,
   its animation stops without
   stopping the universe's loop.
========================================== */

function animateScorpius(timestamp) {
  if (!scorpiusReady || !scorpiusContext) {
    return;
  }

  try {
    const width = scorpiusElement.offsetWidth;
    const height = scorpiusElement.offsetHeight;

    if (width <= 0 || height <= 0) {
      requestAnimationFrame(animateScorpius);
      return;
    }

    scorpiusContext.clearRect(
      0,
      0,
      width,
      scorpiusCanvas.offsetHeight
    );

    scorpiusStars.forEach(star => {
      drawScorpiusStar(star, timestamp);
    });

  } catch (error) {
    console.error(
      "Scorpius rendering error:",
      error
    );
    scorpiusReady = false;
    return;
  }

  requestAnimationFrame(animateScorpius);
}

/* ==========================================
   INITIALISE
========================================== */

initialiseScorpius();
