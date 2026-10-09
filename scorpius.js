/* ==========================================
   SCORPIUS — THE MANY SIDES OF ME
========================================== */

const scorpiusStars = [
  // Head and upper body
  { id: "jabbah", x: 185, y: 95, size: 3.8, personality: true },
  { id: "acrab", x: 245, y: 115, size: 4.2, personality: true },
  { id: "dschubba", x: 220, y: 170, size: 4.5, personality: true },
  { id: "pi", x: 285, y: 210, size: 2.8 },

  // Heart
  { id: "antares", x: 260, y: 285, size: 6.5 },

  // Body
  { id: "tau", x: 285, y: 350, size: 3 },
  { id: "epsilon", x: 305, y: 410, size: 3.3 },
  { id: "mu", x: 340, y: 460, size: 2.8 },
  { id: "zeta", x: 370, y: 505, size: 2.7 },
  { id: "eta", x: 405, y: 545, size: 3.2 },

  // Curved tail
  { id: "sargas", x: 450, y: 560, size: 4.5, personality: true },
  { id: "iota", x: 490, y: 535, size: 2.8 },
  { id: "kappa", x: 510, y: 490, size: 3 },

  // Stinger
  { id: "shaula", x: 490, y: 430, size: 5, personality: true },
  { id: "lesath", x: 455, y: 415, size: 3.8, personality: true }
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

function createScorpius() {
  const svg = document.getElementById("scorpiusMap");

  if (!svg) return;

  svg.innerHTML = "";

  const namespace = "http://www.w3.org/2000/svg";

  const getStar = id =>
    scorpiusStars.find(star => star.id === id);

  // Draw constellation lines

  scorpiusConnections.forEach(([startId, endId]) => {
    const start = getStar(startId);
    const end = getStar(endId);

    if (!start || !end) return;

    const line = document.createElementNS(namespace, "line");

    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);

    line.setAttribute("class", "scorpius-line");

    svg.appendChild(line);
  });

  // Draw stars

  scorpiusStars.forEach((star, index) => {
    const group = document.createElementNS(namespace, "g");

    group.setAttribute(
      "class",
      `scorpius-star ${
        star.personality ? "personality" : ""
      } ${star.id === "antares" ? "antares" : ""}`
    );

    group.dataset.star = star.id;

    group.style.setProperty(
      "--twinkle-duration",
      `${3 + (index % 5) * 0.7}s`
    );

    group.style.setProperty(
      "--twinkle-delay",
      `${-(index % 7) * 0.6}s`
    );

    const glow = document.createElementNS(namespace, "circle");

    glow.setAttribute("cx", star.x);
    glow.setAttribute("cy", star.y);
    glow.setAttribute("r", star.size * 4);

    glow.setAttribute("class", "scorpius-star-glow");

    const core = document.createElementNS(namespace, "circle");

    core.setAttribute("cx", star.x);
    core.setAttribute("cy", star.y);
    core.setAttribute("r", star.size);

    core.setAttribute("class", "scorpius-star-core");

    group.appendChild(glow);
    group.appendChild(core);

    if (star.personality) {
      group.addEventListener("click", () => {
        console.log(
          "Scorpius personality:",
          scorpiusPersonalityNames[star.id]
        );
      });
    }

    svg.appendChild(group);
  });
}

function enterScorpius() {
  const chapter = document.getElementById("scorpiusChapter");

  if (!chapter) return;

  chapter.classList.add("active");

  createScorpius();
}

function exitScorpius() {
  const chapter = document.getElementById("scorpiusChapter");

  if (!chapter) return;

  chapter.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const exitButton = document.getElementById("scorpiusExit");

  if (exitButton) {
    exitButton.addEventListener("click", exitScorpius);
  }
});
