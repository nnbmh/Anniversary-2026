/* ==========================================
   SCORPIUS
   THE MANY SIDES OF ME

   PHASE 1:
   UNIVERSE STARS ONLY

   Uses the same star renderer
   as Orion and Virgo.

   Does not modify:
   - Camera movement
   - Telescope controls
   - Orion
   - Virgo
========================================== */


/* ==========================================
   STAR POSITIONS
========================================== */

const scorpiusStars = [

  // Head and claws

  {
    id: "jabbah",
    x: 155,
    y: 80,
    size: 3.8
  },

  {
    id: "acrab",
    x: 225,
    y: 105,
    size: 4.2
  },

  {
    id: "dschubba",
    x: 200,
    y: 165,
    size: 4.5
  },

  {
    id: "pi",
    x: 280,
    y: 190,
    size: 2.7
  },


  // Heart

  {
    id: "antares",
    x: 245,
    y: 265,
    size: 6.2
  },


  // Body

  {
    id: "tau",
    x: 260,
    y: 325,
    size: 3.1
  },

  {
    id: "epsilon",
    x: 280,
    y: 380,
    size: 3.3
  },

  {
    id: "mu",
    x: 310,
    y: 430,
    size: 2.7
  },


  // Curved tail

  {
    id: "zeta",
    x: 350,
    y: 475,
    size: 2.8
  },

  {
    id: "eta",
    x: 395,
    y: 510,
    size: 3.2
  },

  {
    id: "sargas",
    x: 435,
    y: 520,
    size: 4.4
  },

  {
    id: "iota",
    x: 465,
    y: 490,
    size: 2.7
  },

  {
    id: "kappa",
    x: 475,
    y: 440,
    size: 3.1
  },

  {
    id: "shaula",
    x: 450,
    y: 385,
    size: 5
  },

  {
    id: "lesath",
    x: 415,
    y: 370,
    size: 3.8
  }

];


/* ==========================================
   CONNECTIONS

   Saved for the discovery sequence.
   Not drawn in this phase.
========================================== */

const scorpiusConnections = [

  ["jabbah", "acrab"],
  ["acrab", "dschubba"],

  ["dschubba", "pi"],
  ["dschubba", "antares"],
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

function drawScorpiusStar(
  star,
  timestamp
) {

  if (!scorpiusContext) {
    return;
  }


  const isAntares =
    star.id === "antares";


  const tone =
    isAntares
      ? "warm"
      : "cool";


  /*
    Scorpius has a faint
    silvery-white appearance.

    Antares is warmer and brighter.
  */

  const intensity =
    isAntares
      ? 0.9
      : 0.58;


  const size =
    star.size * 0.85;


  drawConstellationStar(

    scorpiusContext,

    star.x + 30,

    star.y + 35,

    size,

    tone,

    star.id,

    timestamp / 1000,

    intensity

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
