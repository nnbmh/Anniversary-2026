/* EPSILON — THE FINE PRINT | Our Little Universe */
(() => {
  "use strict";

  const RULES = [
    {
      id: "a",
      from: "silver",
      to: "blue",
      text: "The silver star must sit above the blue star."
    },
    {
      id: "b",
      from: "blue",
      to: "gold",
      text: "The blue star must sit above the gold star."
    },
    {
      id: "c",
      from: "gold",
      to: "rose",
      text: "The gold star must sit above the rose star."
    },
    {
      id: "d",
      from: "rose",
      to: "silver",
      text: "The rose star must sit above the silver star."
    },
    {
      id: "e",
      text: "Any two stars may trade places, but only one pair at a time."
    },
    {
      id: "f",
      text: "A challenge is valid only when every conflicting clause is identified."
    }
  ];

  const COLORS = {
    silver: "#e6f0ff",
    blue: "#8ebcff",
    gold: "#f4d5a4",
    rose: "#f3b9d0"
  };

  let root;
  let sky;
  let context;
  let raf = 0;

  let order = ["silver", "blue", "gold", "rose"];
  let active = null;
  let pointer = null;
  let moves = 0;
  let finished = false;

  const found = new Set();
  const marked = new Set();

  const $ = (selector, base = root) =>
    base.querySelector(selector);

  const $$ = (selector, base = root) =>
    [...base.querySelectorAll(selector)];

  function el(tag, className, content) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (content !== undefined) {
      element.textContent = content;
    }

    return element;
  }

  function button(className, content, action) {
    const element = el("button", className, content);

    element.type = "button";
    element.addEventListener("click", action);

    return element;
  }

  function setup() {
    root = el("div", "fp-world");
    root.id = "finePrintWorld";
    root.hidden = true;

    root.innerHTML = `
      <canvas class="fp-sky" aria-hidden="true"></canvas>
      <div class="fp-nebula" aria-hidden="true"></div>

      <div class="fp-shell">
        <header class="fp-header">
          <button class="fp-exit" type="button">
            ← SCORPIUS
          </button>

          <span>EPSILON · THE LITTLE MENACE</span>
          <span class="fp-count">00 / 06</span>
        </header>

        <div class="fp-scroll">
          <div class="fp-hero">
            <span class="fp-kicker">
              A VERY OFFICIAL ARRANGEMENT
            </span>

            <h1>The Fine Print</h1>

            <p>
              An agreement between two people.
              Written entirely by one.
            </p>
          </div>

          <div class="fp-opening">
            <p>“Bb, I am always right.”</p>
            <p>“You are, of course, allowed to disagree.”</p>

            <p class="fp-whisper">
              The terms of disagreement are written in the stars.
            </p>
          </div>

          <div class="fp-discovery">
            <p class="fp-section-title">
              I · THE AGREEMENT
            </p>

            <p class="fp-instruction">
              Touch each of the six stars to uncover its clause.
            </p>

            <div class="fp-map" id="fpMap">
              <svg
                class="fp-links"
                viewBox="0 0 1000 430"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="
                  M110 240
                  L285 82
                  L470 285
                  L650 80
                  L860 218
                  L735 370
                  L470 285
                  L110 240
                  M285 82
                  L650 80
                  M650 80
                  L735 370
                "/>
              </svg>
            </div>

            <div
              class="fp-reading"
              id="fpReading"
              aria-live="polite"
            >
              <span>✧</span>
              <p>Six clauses. Six stars. Read them all.</p>
            </div>
          </div>

          <div class="fp-trial" id="fpTrial" hidden>
            <p class="fp-section-title">
              II · THE TRIAL
            </p>

            <h2>Make every rule true.</h2>

            <p class="fp-instruction">
              Drag a star to another position.
              The light follows your finger.
              You can also tap two stars to swap them.
            </p>

            <div class="fp-trial-grid">
              <div class="fp-rail" id="fpRail"></div>
              <div class="fp-checks" id="fpChecks"></div>
            </div>

            <p
              class="fp-trial-note"
              id="fpTrialNote"
              aria-live="polite"
            >
              Four stars. Four instructions.
              Surely this is easy, bb.
            </p>
          </div>

          <div class="fp-objection" id="fpObjection" hidden>
            <p class="fp-section-title">
              III · THE OBJECTION
            </p>

            <h2>Something doesn't add up.</h2>

            <p class="fp-instruction">
              The agreement allows a challenge only when
              you identify <em>every</em> clause responsible
              for the contradiction.

              Tap the clause-stars you believe form
              an impossible loop.
            </p>

            <div
              class="fp-verdict"
              id="fpVerdict"
              aria-live="polite"
            ></div>

            <button
              class="fp-submit"
              id="fpSubmit"
              type="button"
            >
              SUBMIT YOUR OBJECTION
              <span>↗</span>
            </button>
          </div>

          <div class="fp-ending" id="fpEnding" hidden>
            <span class="fp-end-star">✧</span>

            <p class="fp-section-title">
              THE OFFICIAL RULING
            </p>

            <h2>FARIS WAS RIGHT.</h2>

            <p>...this time.</p>

            <p>Don't let it get to your head, bb.</p>

            <p class="fp-love">Love you.</p>

            <button class="fp-return" type="button">
              RETURN TO SCORPIUS ↗
            </button>
          </div>

          <div class="fp-bottom-space"></div>
        </div>
      </div>
    `;

    document.body.append(root);

    sky = $(".fp-sky");
    context = sky.getContext("2d");

    $(".fp-exit").addEventListener("click", close);
    $(".fp-return").addEventListener("click", close);
    $("#fpSubmit").addEventListener("click", submit);

    window.openFinePrint = open;

    // Compatibility with the previous Scorpius connection.
    window.openImpostorStar = open;
  }

  function makeMap() {
    const map = $("#fpMap");

    $$(".fp-node", map).forEach(node => node.remove());

    const positions = [
      [11, 56],
      [29, 18],
      [47, 67],
      [65, 18],
      [86, 50],
      [74, 85]
    ];

    RULES.forEach((rule, index) => {
      const node = button(
        "fp-node",
        "",
        () => reveal(rule.id)
      );

      node.dataset.id = rule.id;

      node.style.left = positions[index][0] + "%";
      node.style.top = positions[index][1] + "%";

      node.setAttribute(
        "aria-label",
        "Reveal clause " +
          String(index + 1).padStart(2, "0")
      );

      node.innerHTML = `
        <span class="fp-point"></span>
        <span class="fp-node-label">
          ${String(index + 1).padStart(2, "0")}
        </span>
      `;

      map.append(node);
    });
  }

  function reveal(id) {
    found.add(id);

    const rule = RULES.find(item => item.id === id);
    const box = $("#fpReading");

    box.classList.add("fp-reading-on");

    box.innerHTML = `
      <span>
        CLAUSE ${
          String(RULES.indexOf(rule) + 1).padStart(2, "0")
        }
      </span>
      <p>${rule.text}</p>
    `;

    if (found.size === 6) {
      box.append(
        button(
          "fp-mark-action",
          marked.has(id)
            ? "REMOVE FROM OBJECTION −"
            : "MARK THIS CLAUSE FOR OBJECTION +",
          () => {
            toggleMark(id);
            reveal(id);
          }
        )
      );
    }

    $$(".fp-node").forEach(node => {
      node.classList.toggle(
        "fp-found",
        found.has(node.dataset.id)
      );

      node.classList.toggle(
        "fp-active",
        node.dataset.id === id
      );
    });

    $(".fp-count").textContent =
      String(found.size).padStart(2, "0") + " / 06";

    if (found.size === 6) {
      $("#fpTrial").hidden = false;
      $("#fpObjection").hidden = false;

      if (!$("#fpRail").children.length) {
        renderRail();
        renderChecks();
      }
    }

    updateMarks();
  }

  function makeStar(name) {
    const star = el("button", "fp-movable");

    star.type = "button";
    star.dataset.name = name;

    star.style.setProperty("--glow", COLORS[name]);

    star.setAttribute(
      "aria-label",
      name + " star; tap then tap another star to swap"
    );

    star.innerHTML = `
      <span class="fp-movable-light"></span>
      <span class="fp-movable-name">${name}</span>
    `;

    star.addEventListener("pointerdown", down);
    star.addEventListener("pointermove", move);
    star.addEventListener("pointerup", up);
    star.addEventListener("pointercancel", cancel);

    star.addEventListener("click", () => {
      if (star.dataset.suppress === "1") {
        star.dataset.suppress = "0";
        return;
      }

      if (active === null) {
        active = name;
        updateSelected();
        return;
      }

      if (active === name) {
        active = null;
        updateSelected();
        return;
      }

      swap(active, name);
      active = null;
    });

    return star;
  }

  function renderRail() {
    const rail = $("#fpRail");
    rail.innerHTML = "";

    order.forEach((name, index) => {
      const slot = el("div", "fp-slot");

      slot.dataset.index = index;

      slot.innerHTML = `
        <span class="fp-slot-number">
          0${index + 1}
        </span>
      `;

      slot.append(makeStar(name));
      rail.append(slot);
    });

    updateSelected();
  }

  function updateSelected() {
    $$(".fp-movable").forEach(node => {
      node.classList.toggle(
        "fp-selected",
        node.dataset.name === active
      );
    });
  }

  function down(event) {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    pointer = {
      id: event.pointerId,
      name: event.currentTarget.dataset.name,
      startX: event.clientX,
      startY: event.clientY,
      drag: false,
      node: event.currentTarget
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function move(event) {
    if (
      !pointer ||
      pointer.id !== event.pointerId
    ) {
      return;
    }

    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;

    if (Math.hypot(dx, dy) > 6) {
      pointer.drag = true;
    }

    if (!pointer.drag) return;

    const node = pointer.node;

    node.classList.add("fp-dragging");

    node.style.transform = `
      translate3d(${dx}px, ${dy}px, 0)
      scale(1.16)
    `;

    $$(".fp-slot").forEach(slot => {
      const rect = slot.getBoundingClientRect();

      slot.classList.toggle(
        "fp-drop",
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });
  }

  function up(event) {
    if (
      !pointer ||
      pointer.id !== event.pointerId
    ) {
      return;
    }

    const previous = pointer;
    pointer = null;

    const node = previous.node;

    node.classList.remove("fp-dragging");
    node.style.transform = "";

    $$(".fp-slot").forEach(slot => {
      slot.classList.remove("fp-drop");
    });

    if (!previous.drag) return;

    node.dataset.suppress = "1";

    const slots = $$(".fp-slot");

    let target = slots.find(slot => {
      const rect = slot.getBoundingClientRect();

      return (
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });

    if (!target) {
      target = slots.reduce((best, slot) => {
        const currentDistance = Math.abs(
          slot.getBoundingClientRect().top -
          event.clientY
        );

        const bestDistance = Math.abs(
          best.getBoundingClientRect().top -
          event.clientY
        );

        return currentDistance < bestDistance
          ? slot
          : best;
      }, slots[0]);
    }

    const other = order[Number(target.dataset.index)];

    if (other && other !== previous.name) {
      swap(previous.name, other);
    }
  }

  function cancel(event) {
    if (
      !pointer ||
      pointer.id !== event.pointerId
    ) {
      return;
    }

    pointer.node.style.transform = "";
    pointer.node.classList.remove("fp-dragging");

    pointer = null;

    $$(".fp-slot").forEach(slot => {
      slot.classList.remove("fp-drop");
    });
  }

  function swap(first, second) {
    const a = order.indexOf(first);
    const b = order.indexOf(second);

    [order[a], order[b]] = [
      order[b],
      order[a]
    ];

    moves++;

    renderRail();
    renderChecks();
  }

  function renderChecks() {
    const checks = $("#fpChecks");

    checks.innerHTML = "";

    let passed = 0;

    RULES.slice(0, 4).forEach(rule => {
      const correct =
        order.indexOf(rule.from) <
        order.indexOf(rule.to);

      if (correct) passed++;

      const row = el(
        "div",
        "fp-check " +
          (correct ? "fp-yes" : "fp-no")
      );

      row.innerHTML = `
        <span class="fp-check-icon">
          ${correct ? "✧" : "◇"}
        </span>

        <span>
          ${rule.from}
          <small>above</small>
          ${rule.to}
        </span>
      `;

      checks.append(row);
    });

    const note = $("#fpTrialNote");

    if (moves === 0) {
      note.textContent =
        "Four stars. Four instructions. Surely this is easy, bb.";
    } else if (moves < 3) {
      note.textContent =
        `${passed} of 4 instructions satisfied. Keep trying.`;
    } else {
      note.textContent =
        `${passed} of 4. You can keep moving them... ` +
        "or question the rules themselves.";
    }
  }

  function updateMarks() {
    $$(".fp-node").forEach(node => {
      node.classList.toggle(
        "fp-marked",
        marked.has(node.dataset.id)
      );
    });

    const verdict = $("#fpVerdict");

    if (!verdict) return;

    verdict.textContent = marked.size
      ? `${marked.size} clause${
          marked.size === 1 ? "" : "s"
        } marked for objection.`
      : "No clauses marked yet.";
  }

  function toggleMark(id) {
    if (marked.has(id)) {
      marked.delete(id);
    } else {
      marked.add(id);
    }

    updateMarks();
  }

  function submit() {
    const verdict = $("#fpVerdict");

    if (moves < 2) {
      verdict.textContent =
        "Try the arrangement first. " +
        "A proper objection needs evidence.";
      return;
    }

    const correctClauses = [
      "a",
      "b",
      "c",
      "d"
    ];

    if (
      marked.size === 4 &&
      correctClauses.every(id => marked.has(id))
    ) {
      win();
      return;
    }

    verdict.textContent =
      marked.size === 0
        ? "Tap the clause-stars to mark your objection."
        : "Objection denied. Find the complete loop " +
          "of instructions; leave unrelated terms untouched.";
  }

  function win() {
    finished = true;

    $("#fpEnding").hidden = false;
    $("#fpObjection").hidden = true;
    $("#fpTrial").hidden = true;

    $(".fp-discovery").hidden = true;
    $(".fp-opening").hidden = true;
    $(".fp-hero").hidden = true;

    $("#fpEnding").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    window.dispatchEvent(
      new Event("finePrintComplete")
    );

    window.dispatchEvent(
      new Event("impostorStarComplete")
    );
  }

  function open() {
    if (!root) return;

    root.hidden = false;
    document.body.classList.add("fp-lock");

    if (finished) {
      $("#fpEnding").hidden = false;
      $("#fpObjection").hidden = true;
      $("#fpTrial").hidden = true;

      $(".fp-discovery").hidden = true;
      $(".fp-opening").hidden = true;
      $(".fp-hero").hidden = true;
    } else {
      order = [
        "silver",
        "blue",
        "gold",
        "rose"
      ];

      moves = 0;
      active = null;

      found.clear();
      marked.clear();

      $("#fpTrial").hidden = true;
      $("#fpObjection").hidden = true;
      $("#fpEnding").hidden = true;

      $(".fp-discovery").hidden = false;
      $(".fp-opening").hidden = false;
      $(".fp-hero").hidden = false;

      $("#fpReading").innerHTML = `
        <span>✧</span>
        <p>Six clauses. Six stars. Read them all.</p>
      `;

      $("#fpReading").classList.remove(
        "fp-reading-on"
      );

      $(".fp-count").textContent = "00 / 06";

      makeMap();

      $$(".fp-node").forEach(node => {
        node.addEventListener(
          "contextmenu",
          event => event.preventDefault()
        );
      });

      $$(".fp-node").forEach(node => {
        let timer = 0;

        node.addEventListener("pointerdown", () => {
          timer = setTimeout(() => {
            if (found.size === 6) {
              toggleMark(node.dataset.id);
            }
          }, 550);
        });

        node.addEventListener("pointerup", () => {
          clearTimeout(timer);
        });

        node.addEventListener("pointercancel", () => {
          clearTimeout(timer);
        });

        node.addEventListener("pointerleave", () => {
          clearTimeout(timer);
        });

        node.addEventListener("dblclick", event => {
          if (found.size === 6) {
            event.preventDefault();
            toggleMark(node.dataset.id);
          }
        });
      });

      const existing = $("#fpMarkGuide");

      if (existing) {
        existing.remove();
      }

      const guide = el(
        "p",
        "fp-mark-guide",
        "Tap a clause-star, then use MARK THIS CLAUSE " +
        "to add it to your objection. " +
        "Long-press a star to mark it directly."
      );

      guide.id = "fpMarkGuide";

      $("#fpObjection").insertBefore(
        guide,
        $("#fpVerdict")
      );
    }

    $(".fp-scroll").scrollTop = 0;

    if (!raf) {
      raf = requestAnimationFrame(draw);
    }
  }

  function close() {
    if (!root) return;

    root.hidden = true;
    document.body.classList.remove("fp-lock");

    cancelAnimationFrame(raf);
    raf = 0;
  }

  function fract(number) {
    return number - Math.floor(number);
  }

  const points = Array.from(
    { length: 135 },
    (_, index) => ({
      x: fract(
        Math.sin(index * 123.27) * 23454
      ),
      y: fract(
        Math.sin(index * 95.87) * 43521
      ),
      r: index % 17 === 0
        ? 1.5
        : 0.5 + (index % 4) * 0.18,
      phase: index * 2.1
    })
  );

  function draw(timestamp) {
    if (root.hidden) {
      raf = 0;
      return;
    }

    const dpr = Math.min(
      devicePixelRatio || 1,
      2
    );

    const width = innerWidth;
    const height = innerHeight;

    if (
      sky.width !== Math.floor(width * dpr) ||
      sky.height !== Math.floor(height * dpr)
    ) {
      sky.width = Math.floor(width * dpr);
      sky.height = Math.floor(height * dpr);
    }

    context.setTransform(
      dpr, 0, 0, dpr, 0, 0
    );

    context.clearRect(
      0, 0, width, height
    );

    points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;

      const alpha =
        0.15 +
        0.25 *
        (
          0.5 +
          0.5 *
          Math.sin(
            timestamp * 0.0005 +
            point.phase
          )
        );

      context.fillStyle =
        `rgba(225,237,255,${alpha})`;

      context.beginPath();

      context.arc(
        x,
        y,
        point.r,
        0,
        Math.PI * 2
      );

      context.fill();

      if (index % 19 === 0) {
        context.strokeStyle =
          `rgba(225,237,255,${alpha * 0.55})`;

        context.lineWidth = 0.55;

        context.beginPath();

        context.moveTo(x - 7, y);
        context.lineTo(x + 7, y);

        context.moveTo(x, y - 10);
        context.lineTo(x, y + 10);

        context.stroke();
      }
    });

    raf = requestAnimationFrame(draw);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      setup,
      { once: true }
    );
  } else {
    setup();
  }
})();
