/* ==========================================
   SCORPIUS — INTERACTIVE CHAPTER
   Uses the same star renderer as
   Orion and Virgo.
========================================== */

(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

    const personalities = [
    {
      id: "epsilon",
      title: "The Little Menace",
      game: "Impostor Star"
    },
    {
      id: "pi",
      title: "The Indecisive One",
      game: "Coin Toss Betrayal"
    },
    {
      id: "jabbah",
      title: "The Bossy One",
      game: "Perfect Picture"
    },
    {
      id: "sargas",
      title: "The Quiet One",
      game: "Treasure of Silence"
    },
    {
      id: "shaula",
      title: "The Soft Side",
      game: "Emergency Sunshine"
    }
  ];

  const completed = new Set();

  let chapter;
  let map;
  let canvas;
  let context;
  let message;

  const positions = {
    jabbah: [455, 65],
    acrab: [470, 120],
    dschubba: [468, 165],
    pi: [415, 145],
    antares: [355, 190],
    tau: [330, 225],
    epsilon: [285, 315],
    mu: [280, 380],
    zeta: [275, 455],
    eta: [215, 475],
    sargas: [155, 475],
    iota: [120, 430],
    kappa: [135, 405],
    shaula: [155, 380],
    lesath: [165, 365]
  };

  const connections = [
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

  function svgElement(type, attributes = {}) {
    const element = document.createElementNS(NS, type);

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element.setAttribute(key, value);
      }
    );

    return element;
  }

  function showMessage(title, description) {
    message.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const text = document.createElement("p");
    text.textContent = description;

    message.append(heading, text);
    message.classList.add("visible");
  }

  function selectStar(personality) {
  if (personality.id === "epsilon") {
    if (typeof window.openImpostorStar === "function") {
      window.openImpostorStar();
    }
    return;
  }

  showMessage(
    personality.title,
    `${personality.game} — coming next.`
  );
}

  function selectAntares() {
    if (completed.size < 5) {
      showMessage(
        "ANTARES",
        "There's something waiting at the heart of Scorpius... but not just yet."
      );

      return;
    }

    showMessage("ANTARES", "The Tiny Argument");
  }

     function updateScorpiusProgress() {
    const progress = document.getElementById(
      "scorpiusProgress"
    );

    if (!progress) return;

    progress.innerHTML = "";

    personalities.forEach(personality => {
      const star = document.createElement("span");

      star.className = completed.has(personality.id)
        ? "progress-star completed"
        : "progress-star";

      star.textContent = completed.has(personality.id)
        ? "✦"
        : "✧";

      progress.appendChild(star);
    });
  }
   
    function buildHitAreas() {
    map.innerHTML = "";

    Object.entries(positions).forEach(
      ([id, position]) => {
        const personality = personalities.find(
          item => item.id === id
        );

        const isAntares = id === "antares";

        if (!personality && !isAntares) return;

        const group = svgElement("g", {
          class: isAntares
            ? "scorpius-map-star interactive antares-final"
            : "scorpius-map-star interactive personality-star",
          role: "button",
          tabindex: "0",
          "aria-label": isAntares
            ? "Antares — The Tiny Argument"
            : `${personality.title} — ${personality.game}`
        });

        const pulse = svgElement("circle", {
           cx: position[0],
           cy: position[1],
           r: 12,
           class: "scorpius-star-pulse"
        });

        const hitArea = svgElement("circle", {
          cx: position[0],
          cy: position[1],
          r: 32,
          fill: "transparent",
          class: "scorpius-star-hit",
          "pointer-events": "all"
        });

        group.appendChild(hitArea);

        const activate = event => {
          event.preventDefault();
          event.stopPropagation();

          if (isAntares) {
            selectAntares();
            return;
          }

          selectStar(personality);
           
           if (id === "epsilon") return;
           if (!completed.has(id)) {
            completed.add(id);
            group.classList.add("explored");

            updateScorpiusProgress();

            if (completed.size === 5) {
              const antaresGroup =
                map.querySelector(".antares-final");

              if (antaresGroup) {
                antaresGroup.classList.add("unlocked");
              }

              const guidance =
                chapter.querySelector(".scorpius-guidance");

              if (guidance) {
                guidance.classList.add("all-explored");
              }
            }
          }
        };

        group.addEventListener("click", activate);

        group.addEventListener("keydown", event => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            activate(event);
          }
        });

        map.appendChild(group);
      }
    );
  }

  function setupCanvas() {
    const container = map.parentElement;

    canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";

    container.insertBefore(canvas, map);

    map.style.position = "relative";
    map.style.zIndex = "2";

    context = canvas.getContext("2d");
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return false;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    return true;
  }

  function getCanvasPoint(x, y) {
    const point = map.createSVGPoint();

    point.x = x;
    point.y = y;

    const matrix = map.getScreenCTM();

    if (!matrix) return null;

    const screenPoint = point.matrixTransform(matrix);
    const rect = canvas.getBoundingClientRect();

    return {
      x: screenPoint.x - rect.left,
      y: screenPoint.y - rect.top
    };
  }

  function drawChapter(timestamp) {
    requestAnimationFrame(drawChapter);

    if (!chapter.classList.contains("active")) {
      return;
    }

    if (!resizeCanvas()) return;

    const rect = canvas.getBoundingClientRect();

    context.clearRect(
      0,
      0,
      rect.width,
      rect.height
    );

    const points = new Map();

    Object.entries(positions).forEach(
      ([id, position]) => {
        const point = getCanvasPoint(
          position[0],
          position[1]
        );

        if (point) points.set(id, point);
      }
    );

    // Constellation lines
// Match the thin, soft Orion treatment.

context.save();

context.strokeStyle =
  "rgba(226,238,252,.68)";

context.lineWidth = .7;
context.lineCap = "round";

context.shadowColor =
  "rgba(185,218,255,.14)";

context.shadowBlur = 1;

connections.forEach(([from, to]) => {
  const a = points.get(from);
  const b = points.get(to);

  if (!a || !b) return;

  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
});

context.restore();
     
    // EXACT SAME STAR RENDERER

    if (
      typeof window.drawConstellationStar !==
      "function"
    ) {
      return;
    }

       const interactiveOrder = [
      "jabbah",
      "pi",
      "epsilon",
      "sargas",
      "shaula"
    ];

    Object.entries(positions).forEach(([id]) => {
      const point = points.get(id);
      if (!point) return;

      const antares = id === "antares";

      const variation =
        typeof scorpiusStarVariations !== "undefined"
          ? scorpiusStarVariations[id]
          : null;

      const baseSize = antares
        ? 4.636
        : variation
          ? variation.size * 1.25
          : 2.75;

            let size = baseSize;
      let brightness = 1;

      const index = interactiveOrder.indexOf(id);

      const shouldBlink =
        (index !== -1 && !completed.has(id)) ||
        (antares && completed.size === 5);

      let blink = 0;

      if (shouldBlink) {
  // One soft shimmer every three seconds.
  const cycle = 3000;

  const phase =
    (timestamp % cycle) / cycle;

  blink =
    (1 - Math.cos(phase * Math.PI * 2)) / 2;

  size *= 1 + blink * 0.12;
  brightness = 1 + blink * 0.3;
}
       
      window.drawConstellationStar(
        context,
        point.x,
        point.y,
        size,
        antares ? "warm" : "cool",
        antares
          ? "antares"
          : variation
            ? variation.type
            : "Bellatrix",
        timestamp / 1000,
        brightness
      );

      // Soft, diffused rays on tappable stars only.
      if (shouldBlink && blink > 0.02) {
        context.save();

        context.globalCompositeOperation = "screen";

        const rayLength = 9 + blink * 7;
        const rayOpacity = blink * 0.45;

        const rayColour = antares
          ? "255, 203, 151"
          : "211, 231, 255";

        const drawRay = (dx, dy) => {
          const gradient = context.createLinearGradient(
            point.x,
            point.y,
            point.x + dx * rayLength,
            point.y + dy * rayLength
          );

          gradient.addColorStop(
            0,
            `rgba(${rayColour}, ${rayOpacity})`
          );

          gradient.addColorStop(
            1,
            `rgba(${rayColour}, 0)`
          );

          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(
            point.x + dx * rayLength,
            point.y + dy * rayLength
          );

          context.strokeStyle = gradient;
          context.lineWidth = 1.2 + blink * 0.8;
          context.shadowColor =
            `rgba(${rayColour}, ${blink * 0.7})`;
          context.shadowBlur = 4 + blink * 5;

          context.stroke();
        };

        drawRay(1, 0);
        drawRay(-1, 0);
        drawRay(0, 1);
        drawRay(0, -1);

        context.restore();
      }
    });
  }

  function initialise() {
    chapter = document.getElementById(
      "scorpiusChapter"
    );

    map = document.getElementById(
      "scorpiusMap"
    );

    if (!chapter || !map) return;

    document.body.appendChild(chapter);

    map.setAttribute(
      "viewBox",
      "70 20 450 510"
    );

    buildHitAreas();
    setupCanvas();

       message = document.createElement("div");
    message.className = "scorpius-selection";

    chapter.appendChild(message);

    const guidance = document.createElement("div");
    guidance.className = "scorpius-guidance";

        guidance.innerHTML = `
      <span>TOUCH A GLOWING STAR TO BEGIN</span>
      <div id="scorpiusProgress" class="scorpius-progress"></div>
    `;

    chapter.appendChild(guidance);

    updateScorpiusProgress();

    const exit = document.getElementById(
      "scorpiusExit"
    );

    if (exit) {
  exit.addEventListener("click", () => {
    window.clearTimeout(window.scorpiusIntroTimer);

    chapter.classList.remove(
      "active",
      "intro-complete"
    );

    chapter.setAttribute("aria-hidden", "true");

    message.classList.remove("visible");
  });
}
     if (location.hash === "#scorpius-preview") {
  chapter.classList.add("active", "intro-complete");
  chapter.setAttribute("aria-hidden", "false");
}

    requestAnimationFrame(drawChapter);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialise
    );
  } else {
    initialise();
  }
})();
