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
      id: "dschubba",
      title: "The Little Menace",
      game: "Impostor Star"
    },
    {
      id: "acrab",
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
          class: "scorpius-map-star interactive",
          role: "button",
          tabindex: "0"
        });

        const hitArea = svgElement("circle", {
          cx: position[0],
          cy: position[1],
          r: 24,
          fill: "transparent",
          "pointer-events": "all"
        });

        group.appendChild(hitArea);

        const activate = event => {
          event.preventDefault();
          event.stopPropagation();

          if (isAntares) {
            selectAntares();
          } else {
            selectStar(personality);
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

    context.save();

    context.strokeStyle = "rgba(195,220,255,.7)";
    context.lineWidth = 1.6;
    context.shadowColor = "rgba(155,195,255,.45)";
    context.shadowBlur = 5;

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

    Object.entries(positions).forEach(
      ([id]) => {
        const point = points.get(id);

        if (!point) return;

        const antares = id === "antares";

        const variation =
          typeof scorpiusStarVariations !==
            "undefined"
            ? scorpiusStarVariations[id]
            : null;

        const size = antares
          ? 4.5
          : variation
            ? variation.size
            : 2.2;

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
          1
        );
      }
    );
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

    const exit = document.getElementById(
      "scorpiusExit"
    );

    if (exit) {
      exit.addEventListener("click", () => {
        chapter.classList.remove("active");
        message.classList.remove("visible");
      });
    }

    if (location.hash === "#scorpius-preview") {
      chapter.classList.add("active");
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
