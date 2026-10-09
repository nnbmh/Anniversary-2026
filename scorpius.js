/* ==========================================
   SCORPIUS — THE MANY SIDES OF ME
========================================== */

const SCORPIUS_NS = "http://www.w3.org/2000/svg";

/*
  Stylised Scorpius arrangement.

  These coordinates preserve the
  recognisable curved shape.

  They are not a precise astronomical
  projection.
*/

const scorpiusStars = [
  { id: "jabbah", x: 155, y: 80, size: 3.8, personality: true },
  { id: "acrab", x: 225, y: 105, size: 4.2, personality: true },
  { id: "dschubba", x: 200, y: 165, size: 4.5, personality: true },
  { id: "pi", x: 280, y: 190, size: 2.7 },

  { id: "antares", x: 245, y: 265, size: 6.2 },

  { id: "tau", x: 260, y: 325, size: 3.1 },
  { id: "epsilon", x: 280, y: 380, size: 3.3 },
  { id: "mu", x: 310, y: 430, size: 2.7 },
  { id: "zeta", x: 350, y: 475, size: 2.8 },
  { id: "eta", x: 395, y: 510, size: 3.2 },

  { id: "sargas", x: 435, y: 520, size: 4.4, personality: true },
  { id: "iota", x: 465, y: 490, size: 2.7 },
  { id: "kappa", x: 475, y: 440, size: 3.1 },

  { id: "shaula", x: 450, y: 385, size: 5, personality: true },
  { id: "lesath", x: 415, y: 370, size: 3.8, personality: true }
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

const scorpiusPersonalityNames = {
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

let scorpiusDiscovered = false;
let scorpiusRevealStarted = false;

let scorpiusFocusStartedAt = null;
let scorpiusRevealStartTime = 0;
let scorpiusPausedAt = null;
let scorpiusPausedDuration = 0;

const SCORPIUS_HOLD = 1800;
const SCORPIUS_LINE_DURATION = 420;
const SCORPIUS_LINE_PAUSE = 90;

let scorpiusElement = null;

const scorpiusStarById = Object.fromEntries(
  scorpiusStars.map(star => [star.id, star])
);

/* ==========================================
   SVG HELPERS
========================================== */

function scorpiusSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(
    SCORPIUS_NS,
    tag
  );

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

/*
  Four-point star with tapered tips.
*/

function scorpiusStarPath(x, y, size) {
  const inner = size * 0.27;

  return [
    `M ${x} ${y - size * 1.8}`,
    `Q ${x + inner} ${y - inner}`,
    `${x + size} ${y}`,
    `Q ${x + inner} ${y + inner}`,
    `${x} ${y + size * 1.8}`,
    `Q ${x - inner} ${y + inner}`,
    `${x - size} ${y}`,
    `Q ${x - inner} ${y - inner}`,
    `${x} ${y - size * 1.8}`,
    "Z"
  ].join(" ");
}

/* ==========================================
   BUILD CONSTELLATION
========================================== */

function buildScorpiusMap(svg, universeMode = false) {
  if (!svg) return;

  svg.innerHTML = "";

  const lineGroup = scorpiusSvgElement("g", {
    class: "scorpius-lines"
  });

  scorpiusConnections.forEach(([startId, endId]) => {
    const start = scorpiusStarById[startId];
    const end = scorpiusStarById[endId];

    const line = scorpiusSvgElement("line", {
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      class: "scorpius-line"
    });

    lineGroup.appendChild(line);
  });

  svg.appendChild(lineGroup);

  scorpiusStars.forEach((star, index) => {
    const classes = ["scorpius-star"];

    if (star.personality) {
      classes.push("personality");
    }

    if (star.id === "antares") {
      classes.push("antares");
    }

    const group = scorpiusSvgElement("g", {
      class: classes.join(" "),
      "data-star": star.id
    });

    group.style.setProperty(
      "--twinkle-duration",
      `${3 + (index % 5) * 0.7}s`
    );

    group.style.setProperty(
      "--twinkle-delay",
      `${-(index % 7) * 0.6}s`
    );

    const glow = scorpiusSvgElement("circle", {
      cx: star.x,
      cy: star.y,
      r: star.size * 4,
      class: "scorpius-star-glow"
    });

    const core = scorpiusSvgElement("path", {
      d: scorpiusStarPath(
        star.x,
        star.y,
        star.size
      ),
      class: "scorpius-star-core"
    });

    group.appendChild(glow);
    group.appendChild(core);

    if (star.personality && !universeMode) {
      group.addEventListener("click", () => {
        console.log(
          "Personality:",
          scorpiusPersonalityNames[star.id]
        );
      });
    }

    svg.appendChild(group);
  });
}

/* ==========================================
   CREATE UNIVERSE CONSTELLATION
========================================== */

function initialiseScorpius() {
  const universe = document.getElementById("universe");

  if (!universe) return;

  scorpiusElement = document.createElement("section");

  scorpiusElement.id = "scorpius";
  scorpiusElement.className = "constellation";

  scorpiusElement.setAttribute(
    "aria-label",
    "Scorpius constellation"
  );

  scorpiusElement.innerHTML = `
    <svg
      class="scorpius-universe-map"
      viewBox="100 40 420 520"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    ></svg>

    <div class="scorpius-universe-label">
      SCORPIUS · 17.11
    </div>
  `;

  universe.appendChild(scorpiusElement);

  buildScorpiusMap(
    scorpiusElement.querySelector("svg"),
    true
  );

  /*
    Before discovery, the universe stars
    remain faint and the lines are hidden.
  */

  scorpiusElement.addEventListener("click", event => {
    if (!scorpiusDiscovered || telescopeActive) {
      return;
    }

    event.stopPropagation();
    enterScorpius();
  });

  const exitButton = document.getElementById("scorpiusExit");

  if (exitButton) {
    exitButton.addEventListener(
      "click",
      exitScorpius
    );
  }
}

/* ==========================================
   POSITION
========================================== */

function getScorpiusPosition() {
  if (!scorpiusElement) return null;

  const rect = scorpiusElement.getBoundingClientRect();

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
   TELESCOPE DRAWING
========================================== */

function drawTelescopeScorpius(width, height) {
  if (!scorpiusElement) return;

  const distance = getScorpiusDistance();

  if (distance > 320 && !scorpiusRevealStarted) {
    return;
  }

  let intensity = 0.12;

  if (distance < 260) intensity = 0.2;
  if (distance < 200) intensity = 0.32;
  if (distance < 145) intensity = 0.48;
  if (distance < 95) intensity = 0.72;
  if (distance < 55) intensity = 1;

  const position = getScorpiusPosition();

  const centreX =
    width / 2 + (position.x - lensX) * 0.55;

  const centreY =
    height / 2 + (position.y - lensY) * 0.55;

  const scale = 0.36;

  const point = star => ({
    x: centreX + (star.x - 290) * scale,
    y: centreY + (star.y - 290) * scale
  });

  const now = performance.now();

  let completedLines = 0;
  let currentLineProgress = 0;

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

    currentLineProgress = Math.min(
      1,
      (elapsed % segmentTime) /
        SCORPIUS_LINE_DURATION
    );
  }

  if (scorpiusDiscovered) {
    completedLines = scorpiusConnections.length;
  }

  /*
    Draw constellation lines.
  */

  ctx.save();

  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";

  ctx.strokeStyle =
    "rgba(210, 225, 255, 0.82)";

  ctx.shadowColor =
    "rgba(175, 195, 255, 0.65)";

  ctx.shadowBlur = 5;

  scorpiusConnections.forEach(([startId, endId], index) => {
    if (index > completedLines) return;

    const progress =
      index < completedLines
        ? 1
        : currentLineProgress;

    if (progress <= 0) return;

    const start = point(scorpiusStarById[startId]);
    const end = point(scorpiusStarById[endId]);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    ctx.lineTo(
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress
    );

    ctx.stroke();
  });

  ctx.restore();

  /*
    Draw glowing stars.
  */

  scorpiusStars.forEach((star, index) => {
    const p = point(star);

    const twinkle =
      0.84 +
      Math.sin(now * 0.0017 + index * 1.9) *
        0.16;

    const alpha = Math.max(
      intensity,
      scorpiusRevealStarted ? 0.9 : 0
    );

    const size = star.size * 0.75;

    const isAntares = star.id === "antares";

    ctx.save();

    ctx.globalAlpha = alpha * twinkle;

    ctx.fillStyle = isAntares
      ? "#ffad79"
      : star.personality
        ? "#fff4e6"
        : "#fffdf8";

    ctx.shadowColor = isAntares
      ? "rgba(255, 110, 70, 0.9)"
      : "rgba(195, 210, 255, 0.85)";

    ctx.shadowBlur = isAntares ? 14 : 8;

    /*
      Four-point star shape.
    */

    ctx.beginPath();

    ctx.moveTo(p.x, p.y - size * 1.8);
    ctx.quadraticCurveTo(
      p.x + size * 0.27,
      p.y - size * 0.27,
      p.x + size,
      p.y
    );

    ctx.quadraticCurveTo(
      p.x + size * 0.27,
      p.y + size * 0.27,
      p.x,
      p.y + size * 1.8
    );

    ctx.quadraticCurveTo(
      p.x - size * 0.27,
      p.y + size * 0.27,
      p.x - size,
      p.y
    );

    ctx.quadraticCurveTo(
      p.x - size * 0.27,
      p.y - size * 0.27,
      p.x,
      p.y - size * 1.8
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
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

  const distance = getScorpiusDistance();

  if (distance > 75 || telescopeDragging) {
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

  scorpiusRevealStartTime = performance.now();
  scorpiusPausedAt = null;
  scorpiusPausedDuration = 0;

  requestAnimationFrame(waitForScorpiusReveal);
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
    requestAnimationFrame(waitForScorpiusReveal);
    return;
  }

  scorpiusDiscovered = true;
  scorpiusRevealStarted = false;

  scorpiusElement.classList.add("discovered");

  /*
    Update the existing discovery counter.
  */

  const discoveryNumber =
    document.getElementById("discoveryNumber");

  if (discoveryNumber) {
    discoveryNumber.textContent =
      Number(orionDiscovered) +
      Number(virgoDiscovered) +
      1;
  }

  setTimeout(() => {
    setTelescope(false);

    const navigationHint =
      document.getElementById("navigationHint");

    if (navigationHint) {
      const title = navigationHint.querySelector("p");
      const text = navigationHint.querySelector("span");

      if (title) {
        title.textContent = "You found something.";
      }

      if (text) {
        text.textContent =
          "Tap the constellation to step inside";
      }

      navigationHint.classList.remove("hidden");
    }
  }, 650);
}

/* ==========================================
   CHAPTER
========================================== */

function enterScorpius() {
  if (!scorpiusDiscovered) return;

  const chapter =
    document.getElementById("scorpiusChapter");

  const svg =
    document.getElementById("scorpiusMap");

  if (!chapter || !svg) return;

  buildScorpiusMap(svg);

  chapter.classList.add("active");
}

function exitScorpius() {
  const chapter =
    document.getElementById("scorpiusChapter");

  if (!chapter) return;

  chapter.classList.remove("active");
}

/* ==========================================
   INITIALISE
========================================== */

initialiseScorpius();
