/* ==========================================
   SCORPIUS — INTERACTIVE CHAPTER
   Our Little Universe · Anniversary 2026

   Five personality stars + Antares
   Does not modify the universe renderer.
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

  const completed = new Set();

  let chapter;
  let map;
  let message;

  function svgElement(type, attributes = {}) {
    const element = document.createElementNS(NS, type);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  function showMessage(title, description) {
    if (!message) return;

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

    /*
      The actual mini-game will replace
      this placeholder in the next stage.

      Stars are NOT marked complete yet.
    */
  }

  function selectAntares() {
    if (completed.size < 5) {
      showMessage(
        "ANTARES",
        "There's something waiting at the heart of Scorpius... but not just yet."
      );
      return;
    }

    showMessage(
      "ANTARES",
      "The Tiny Argument"
    );
  }

  function drawConnections() {
    connections.forEach(([from, to]) => {
      const a = positions[from];
      const b = positions[to];

      const line = svgElement("line", {
        x1: a[0],
        y1: a[1],
        x2: b[0],
        y2: b[1],
        class: "scorpius-map-line"
      });

      map.appendChild(line);
    });
  }

  function drawStars() {
    Object.entries(positions).forEach(([id, position]) => {
      const personality = personalities.find(
        item => item.id === id
      );

      const isAntares = id === "antares";
      const interactive = personality || isAntares;

      const group = svgElement("g", {
        class: interactive
          ? "scorpius-map-star interactive"
          : "scorpius-map-star"
      });

      const glow = svgElement("circle", {
        cx: position[0],
        cy: position[1],
        r: isAntares ? 14 : 8,
        class: isAntares
          ? "scorpius-star-glow antares"
          : "scorpius-star-glow"
      });

      const star = svgElement("circle", {
        cx: position[0],
        cy: position[1],
        r: isAntares ? 5 : personality ? 3.8 : 2.2,
        class: isAntares
          ? "scorpius-star-core antares"
          : "scorpius-star-core"
      });

      group.append(glow, star);

      if (interactive) {
        const hitArea = svgElement("circle", {
          cx: position[0],
          cy: position[1],
          r: 24,
          fill: "transparent"
        });

        group.appendChild(hitArea);

        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "0");

        const activate = () => {
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
            event.preventDefault();
            activate();
          }
        });
      }

      map.appendChild(group);
    });
  }

  function initialise() {
    chapter = document.getElementById("scorpiusChapter");
    map = document.getElementById("scorpiusMap");

    if (!chapter || !map) return;

    map.innerHTML = "";

    // Match the existing constellation coordinates.
    map.setAttribute("viewBox", "70 20 450 510");

    drawConnections();
    drawStars();

    message = document.createElement("div");
    message.className = "scorpius-selection";

    chapter.appendChild(message);

    const exit = document.getElementById("scorpiusExit");

    if (exit) {
      exit.addEventListener("click", () => {
        chapter.classList.remove("active");
        message.classList.remove("visible");
      });
    }

    /*
      Temporary preview:
      Add #scorpius-preview to the website URL.

      This allows testing without interfering
      with Orion/Virgo telescope mechanics.
    */

    if (location.hash === "#scorpius-preview") {
      chapter.classList.add("active");
    }
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
