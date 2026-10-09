/* ==========================================
   SCORPIUS — THE MANY SIDES OF ME
========================================== */
const scorpiusStars = [
  { id: "jabbah", x: 155, y: 80, size: 3.8 },
  { id: "acrab", x: 225, y: 105, size: 4.2 },
  { id: "dschubba", x: 200, y: 165, size: 4.5 },
  { id: "pi", x: 280, y: 190, size: 2.7 },

  { id: "antares", x: 245, y: 265, size: 6.2 },

  { id: "tau", x: 260, y: 325, size: 3.1 },
  { id: "epsilon", x: 280, y: 380, size: 3.3 },
  { id: "mu", x: 310, y: 430, size: 2.7 },
  { id: "zeta", x: 350, y: 475, size: 2.8 },
  { id: "eta", x: 395, y: 510, size: 3.2 },

  { id: "sargas", x: 435, y: 520, size: 4.4 },
  { id: "iota", x: 465, y: 490, size: 2.7 },
  { id: "kappa", x: 475, y: 440, size: 3.1 },

  { id: "shaula", x: 450, y: 385, size: 5 },
  { id: "lesath", x: 415, y: 370, size: 3.8 }
];

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

const scorpiusStarById = Object.fromEntries(
  scorpiusStars.map(star => [star.id, star])
);

const scorpiusPersonalities = {
  dschubba: "The Little Menace",
  acrab: "Make Up Your Mind",
  sargas: "The Social Battery",
  shaula: "The Soft Side",
  jabbah: "The Shield",
  lesath: "Behind the Silence"
};

let scorpiusElement = null;
let scorpiusCanvas = null;
let scorpiusContext = null;

let scorpiusDiscovered = false;
let scorpiusRevealStarted = false;

let scorpiusFocusStartedAt = null;
let scorpiusRevealStartTime = 0;
let scorpiusPausedAt = null;
let scorpiusPausedDuration = 0;

const SCORPIUS_HOLD = 1800;
const SCORPIUS_LINE_DURATION = 420;
const SCORPIUS_LINE_PAUSE = 90;

/* ==========================================
   CREATE CONSTELLATION
========================================== */

function initialiseScorpius() {
  const universeElement =
    document.getElementById("universe");

  if (!universeElement) return;

  scorpiusElement = document.createElement("section");

  scorpiusElement.id = "scorpius";
  scorpiusElement.className = "constellation";

  scorpiusElement.innerHTML = `
    <canvas
      class="scorpius-universe-canvas"
      width="480"
      height="580"
    ></canvas>

    <div class="scorpius-universe-label">
      SCORPIUS · 17.11
    </div>
  `;

  universeElement.appendChild(scorpiusElement);

  scorpiusCanvas =
    scorpiusElement.querySelector("canvas");

  scorpiusContext =
    scorpiusCanvas.getContext("2d");

  scorpiusElement.addEventListener(
    "click",
    event => {
      if (
        !scorpiusDiscovered ||
        telescopeActive
      ) {
        return;
      }

      event.stopPropagation();
      enterScorpius();
    }
  );

  const exitButton =
    document.getElementById("scorpiusExit");

  if (exitButton) {
    exitButton.addEventListener(
      "click",
      exitScorpius
    );
  }
}

/* ==========================================
   POSITIONS
========================================== */

function getScorpiusPosition() {
  if (!scorpiusElement) return null;

  const rect =
    scorpiusElement.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

function getScorpiusDistance() {
  const position = getScorpiusPosition();

  if (!position) return Infinity;

  return Math.hypot(
    lensX - position.x,
    lensY - position.y
  );
}

/* ==========================================
   SHARED STAR RENDERER
========================================== */

function drawScorpiusStar(
  context,
  x,
  y,
  star,
  time,
  intensity = 1,
  scale = 1
) {
  const tone =
    star.id === "antares"
      ? "warm"
      : "cool";

  drawConstellationStar(
    context,
    x,
    y,
    star.size * scale,
    tone,
    star.id,
    time,
    intensity
  );
}

/* ==========================================
   CONSTELLATION LINES
========================================== */

function drawScorpiusLines(
  context,
  point,
  completed,
  progress = 0
) {
  context.save();

  context.lineWidth = 1.6;
  context.lineCap = "round";

  context.strokeStyle =
    "rgba(210,225,255,0.8)";

  context.shadowColor =
    "rgba(175,195,255,0.5)";

  context.shadowBlur = 4;

  scorpiusConnections.forEach(
    ([startId, endId], index) => {
      if (index > completed) return;

      const amount =
        index < completed
          ? 1
          : progress;

      if (amount <= 0) return;

      const start =
        point(scorpiusStarById[startId]);

      const end =
        point(scorpiusStarById[endId]);

      context.beginPath();

      context.moveTo(
        start.x,
        start.y
      );

      context.lineTo(
        start.x +
          (end.x - start.x) * amount,
        start.y +
          (end.y - start.y) * amount
      );

      context.stroke();
    }
  );

  context.restore();
}

/* ==========================================
   UNIVERSE RENDERING
========================================== */

function renderScorpiusUniverse(timestamp) {
  if (
    !scorpiusContext ||
    !scorpiusCanvas
  ) {
    return;
  }

  const context = scorpiusContext;

  context.clearRect(
    0,
    0,
    480,
    580
  );

  /*
    Before discovery, show faint stars.
    After discovery, show the full shape.
  */

  const intensity =
    scorpiusDiscovered ? 1 : 0.42;

  const time = timestamp / 1000;

  if (scorpiusDiscovered) {
    drawScorpiusLines(
      context,
      star => ({
        x: star.x,
        y: star.y
      }),
      scorpiusConnections.length
    );
  }

  scorpiusStars.forEach(star => {
    drawScorpiusStar(
      context,
      star.x,
      star.y,
      star,
      time,
      intensity,
      0.85
    );
  });
}

/* ==========================================
   TELESCOPE RENDERING
========================================== */

function drawTelescopeScorpius(
  width,
  height
) {
  if (!scorpiusElement) return;

  const distance =
    getScorpiusDistance();

  if (
    distance > 320 &&
    !scorpiusRevealStarted
  ) {
    return;
  }

  let intensity = 0.12;

  if (distance < 260) intensity = 0.2;
  if (distance < 200) intensity = 0.32;
  if (distance < 145) intensity = 0.48;
  if (distance < 95) intensity = 0.72;
  if (distance < 55) intensity = 1;

  const position =
    getScorpiusPosition();

  const centreX =
    width / 2 +
    (position.x - lensX) * 0.55;

  const centreY =
    height / 2 +
    (position.y - lensY) * 0.55;

  const scale = 0.36;

  const point = star => ({
    x:
      centreX +
      (star.x - 290) * scale,

    y:
      centreY +
      (star.y - 290) * scale
  });

  const now = performance.now();

  let completedLines = 0;
  let currentProgress = 0;

  if (scorpiusRevealStarted) {
    const effectiveNow =
      scorpiusPausedAt === null
        ? now
        : scorpiusPausedAt;

    const elapsed = Math.max(
      0,
      effectiveNow -
        scorpiusRevealStartTime -
        scorpiusPausedDuration
    );

    const segmentTime =
      SCORPIUS_LINE_DURATION +
      SCORPIUS_LINE_PAUSE;

    completedLines = Math.min(
      scorpiusConnections.length,
      Math.floor(elapsed / segmentTime)
    );

    currentProgress = Math.min(
      1,
      (elapsed % segmentTime) /
        SCORPIUS_LINE_DURATION
    );
  }

  if (scorpiusDiscovered) {
    completedLines =
      scorpiusConnections.length;
  }

  if (
    scorpiusRevealStarted ||
    scorpiusDiscovered
  ) {
    drawScorpiusLines(
      ctx,
      point,
      completedLines,
      currentProgress
    );
  }

  const time = now / 1000;

  scorpiusStars.forEach(star => {
    const p = point(star);

    drawScorpiusStar(
      ctx,
      p.x,
      p.y,
      star,
      time,
      intensity,
      0.75
    );
  });
}

/* ==========================================
   DISCOVERY
========================================== */

function checkScorpiusFocus(timestamp) {
  if (
    !telescopeActive ||
    scorpiusDiscovered ||
    scorpiusRevealStarted
  ) {
    scorpiusFocusStartedAt = null;
    return;
  }

  const distance =
    getScorpiusDistance();

  if (
    distance > 75 ||
    telescopeDragging
  ) {
    scorpiusFocusStartedAt = null;
    return;
  }

  if (scorpiusFocusStartedAt === null) {
    scorpiusFocusStartedAt = timestamp;
  }

  if (
    timestamp - scorpiusFocusStartedAt >=
    SCORPIUS_HOLD
  ) {
    discoverScorpius();
  }
}

function discoverScorpius() {
  if (
    scorpiusDiscovered ||
    scorpiusRevealStarted
  ) {
    return;
  }

  scorpiusRevealStarted = true;

  scorpiusRevealStartTime =
    performance.now();

  scorpiusPausedAt = null;
  scorpiusPausedDuration = 0;

  requestAnimationFrame(
    waitForScorpiusReveal
  );
}

function waitForScorpiusReveal() {
  if (!scorpiusRevealStarted) return;

  const now = performance.now();

  const inView =
    telescopeActive &&
    getScorpiusDistance() <= 95;

  if (!inView) {
    if (scorpiusPausedAt === null) {
      scorpiusPausedAt = now;
    }
  } else if (scorpiusPausedAt !== null) {
    scorpiusPausedDuration +=
      now - scorpiusPausedAt;

    scorpiusPausedAt = null;
  }

  const effectiveNow =
    scorpiusPausedAt === null
      ? now
      : scorpiusPausedAt;

  const elapsed =
    effectiveNow -
    scorpiusRevealStartTime -
    scorpiusPausedDuration;

  const requiredTime =
    scorpiusConnections.length *
    (
      SCORPIUS_LINE_DURATION +
      SCORPIUS_LINE_PAUSE
    );

  if (elapsed < requiredTime) {
    requestAnimationFrame(
      waitForScorpiusReveal
    );
    return;
  }

  scorpiusDiscovered = true;
  scorpiusRevealStarted = false;

  scorpiusElement.classList.add(
    "discovered"
  );

  const discoveryNumber =
    document.getElementById(
      "discoveryNumber"
    );

  if (discoveryNumber) {
    discoveryNumber.textContent =
      Number(orionDiscovered) +
      Number(virgoDiscovered) +
      1;
  }

  setTimeout(() => {
    setTelescope(false);

    const navigationHint =
      document.getElementById(
        "navigationHint"
      );

    if (navigationHint) {
      const title =
        navigationHint.querySelector("p");

      const text =
        navigationHint.querySelector("span");

      if (title) {
        title.textContent =
          "You found something.";
      }

      if (text) {
        text.textContent =
          "Tap the constellation to step inside";
      }

      navigationHint.classList.remove(
        "hidden"
      );
    }
  }, 650);
}

/* ==========================================
   CHAPTER
========================================== */

function enterScorpius() {
  if (!scorpiusDiscovered) return;

  const chapter =
    document.getElementById(
      "scorpiusChapter"
    );

  if (!chapter) return;

  chapter.classList.add("active");
}

function exitScorpius() {
  const chapter =
    document.getElementById(
      "scorpiusChapter"
    );

  if (!chapter) return;

  chapter.classList.remove("active");
}

/* ==========================================
   INITIALISE
========================================== */

initialiseScorpius();
