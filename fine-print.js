/* ==========================================
   EPSILON — THE FINE PRINT
   OUR LITTLE UNIVERSE
========================================== */

(() => {
  "use strict";

  let root;
  let canvas;
  let ctx;
  let frame;

  let stage = "agreement";
  let arrangement = ["silver", "blue", "gold"];
  let moves = 0;
  let selected = null;
  let dragging = null;
  let completed = false;

  const rules = [
    {
      first: "silver",
      second: "blue",
      text: "Silver must be above Blue."
    },
    {
      first: "blue",
      second: "gold",
      text: "Blue must be above Gold."
    },
    {
      first: "gold",
      second: "silver",
      text: "Gold must be above Silver."
    }
  ];

  const colours = {
    silver: "#edf4ff",
    blue: "#a9cbff",
    gold: "#f4d4a0"
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text) element.textContent = text;

    return element;
  }

  function createButton(text, className, action) {
    const button = createElement(
      "button",
      className,
      text
    );

    button.type = "button";
    button.addEventListener("click", action);

    return button;
  }

  function clear() {
    root.innerHTML = "";
    root.appendChild(canvas);
  }

  function close() {
    root.classList.remove("visible");
    root.setAttribute("aria-hidden", "true");

    document.body.classList.remove(
      "fine-print-open"
    );

    selected = null;
    dragging = null;

    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  function makeHeader() {
    const header = createElement(
      "div",
      "fine-print-header"
    );

    const back = createButton(
      "← scorpius",
      "fine-print-back",
      close
    );

    const label = createElement(
      "span",
      "fine-print-eyebrow",
      "EPSILON · THE LITTLE MENACE"
    );

    header.append(back, label);

    return header;
  }

  function makeIntro(title, subtitle) {
    const intro = createElement(
      "div",
      "fine-print-intro"
    );

    const heading = createElement(
      "h2",
      "",
      title
    );

    const description = createElement(
      "p",
      "",
      subtitle
    );

    intro.append(heading, description);

    return intro;
  }

  function makeClause(number, text, extraClass = "") {
    const clause = createElement(
      "div",
      `fine-print-clause ${extraClass}`
    );

    const index = createElement(
      "span",
      "fine-print-clause-number",
      number
    );

    const wording = createElement(
      "span",
      "fine-print-clause-text",
      text
    );

    clause.append(index, wording);

    return clause;
  }

  function showAgreement() {
    stage = "agreement";
    clear();

    const content = createElement(
      "section",
      "fine-print-content agreement-stage"
    );

    content.appendChild(
      makeIntro(
        "THE OFFICIAL AGREEMENT",
        "An agreement between two parties. Written entirely by one."
      )
    );

    const clauses = createElement(
      "div",
      "fine-print-clauses"
    );

    clauses.append(
      makeClause(
        "01",
        "Nadhira is always right."
      ),
      makeClause(
        "02",
        "Faris may challenge Nadhira's decisions."
      ),
      makeClause(
        "03",
        "All challenges must follow the instructions provided."
      )
    );

    const note = createElement(
      "p",
      "fine-print-note",
      "Please read carefully, bb. I made this very simple for you."
    );

    const begin = createButton(
      "accept the challenge  →",
      "fine-print-action",
      showPuzzle
    );

    const footnote = createElement(
      "button",
      "fine-print-footnote",
      "✧  supplementary terms"
    );

    footnote.type = "button";

    footnote.addEventListener(
      "click",
      showSupplementaryTerms
    );

    clauses.appendChild(footnote);

    content.append(
      clauses,
      note,
      begin
    );

    root.append(
      makeHeader(),
      content
    );
  }

  function showSupplementaryTerms() {
    const existing = root.querySelector(
      ".fine-print-terms"
    );

    if (existing) {
      existing.remove();
      return;
    }

    const terms = createElement(
      "div",
      "fine-print-terms"
    );

    const title = createElement(
      "span",
      "fine-print-terms-title",
      "SUPPLEMENTARY TERMS · §04"
    );

    const description = createElement(
      "p",
      "",
      "Any set of instructions that cannot all be satisfied is void. The challenger may identify the contradiction to invalidate it."
    );

    const closeTerms = createButton(
      "close",
      "fine-print-terms-close",
      () => terms.remove()
    );

    terms.append(
      title,
      description,
      closeTerms
    );

    root.appendChild(terms);
  }

  function ruleSatisfied(rule) {
    return arrangement.indexOf(rule.first) <
      arrangement.indexOf(rule.second);
  }

  function createStar(name) {
    const button = createElement(
      "button",
      "fine-print-star",
      ""
    );

    button.type = "button";
    button.dataset.star = name;

    button.setAttribute(
      "aria-label",
      `${name} star`
    );

    button.style.setProperty(
      "--star-colour",
      colours[name]
    );

    const core = createElement(
      "span",
      "fine-print-star-core"
    );

    const label = createElement(
      "span",
      "fine-print-star-label",
      name.toUpperCase()
    );

    button.append(core, label);

    button.addEventListener(
      "pointerdown",
      event => startDrag(event, name)
    );

    button.addEventListener(
      "click",
      () => selectStar(name)
    );

    return button;
  }

  function selectStar(name) {
    if (dragging) return;

    if (selected === null) {
      selected = name;
      updateStars();
      return;
    }

    if (selected === name) {
      selected = null;
      updateStars();
      return;
    }

    swapStars(selected, name);
    selected = null;
  }

  function swapStars(first, second) {
    const a = arrangement.indexOf(first);
    const b = arrangement.indexOf(second);

    if (a < 0 || b < 0 || a === b) return;

    [arrangement[a], arrangement[b]] =
      [arrangement[b], arrangement[a]];

    moves++;

    updatePuzzle();
  }

  function startDrag(event, name) {
    if (event.button !== undefined &&
        event.button !== 0) return;

    dragging = {
      name,
      startY: event.clientY,
      moved: false
    };

    const button = event.currentTarget;

    button.setPointerCapture(event.pointerId);

    button.addEventListener(
      "pointermove",
      dragMove
    );

    button.addEventListener(
      "pointerup",
      endDrag,
      { once: true }
    );

    button.addEventListener(
      "pointercancel",
      cancelDrag,
      { once: true }
    );
  }

  function dragMove(event) {
    if (!dragging) return;

    if (
      Math.abs(event.clientY - dragging.startY) > 8
    ) {
      dragging.moved = true;
    }

    event.currentTarget.classList.toggle(
      "dragging",
      dragging.moved
    );
  }

  function endDrag(event) {
    const button = event.currentTarget;

    button.removeEventListener(
      "pointermove",
      dragMove
    );

    button.classList.remove("dragging");

    if (!dragging) return;

    const drag = dragging;
    dragging = null;

    if (!drag.moved) return;

    const target = document.elementFromPoint(
      event.clientX,
      event.clientY
    )?.closest(".fine-print-slot");

    if (!target) return;

    const other = arrangement[
      Number(target.dataset.index)
    ];

    if (other && other !== drag.name) {
      swapStars(drag.name, other);
    }
  }

  function cancelDrag(event) {
    event.currentTarget.removeEventListener(
      "pointermove",
      dragMove
    );

    event.currentTarget.classList.remove(
      "dragging"
    );

    dragging = null;
  }

  function updateStars() {
    root.querySelectorAll(
      ".fine-print-star"
    ).forEach(button => {
      button.classList.toggle(
        "selected",
        button.dataset.star === selected
      );
    });
  }

  function createSlots() {
    const container = createElement(
      "div",
      "fine-print-slots"
    );

    arrangement.forEach((name, index) => {
      const slot = createElement(
        "div",
        "fine-print-slot"
      );

      slot.dataset.index = index;

      const position = createElement(
        "span",
        "fine-print-position",
        String(index + 1).padStart(2, "0")
      );

      slot.append(
        position,
        createStar(name)
      );

      container.appendChild(slot);
    });

    return container;
  }

  function createRules() {
    const container = createElement(
      "div",
      "fine-print-rules"
    );

    rules.forEach((rule, index) => {
      const satisfied = ruleSatisfied(rule);

      const row = createElement(
        "div",
        `fine-print-rule ${
          satisfied ? "satisfied" : "unsatisfied"
        }`
      );

      const indicator = createElement(
        "span",
        "fine-print-rule-indicator",
        satisfied ? "✧" : "◇"
      );

      const text = createElement(
        "span",
        "",
        rule.text
      );

      row.append(
        indicator,
        text
      );

      container.appendChild(row);
    });

    return container;
  }

  function showPuzzle() {
    stage = "puzzle";
    clear();

    const content = createElement(
      "section",
      "fine-print-content puzzle-stage"
    );

    content.appendChild(
      makeIntro(
        "THREE LITTLE STARS",
        "Arrange them so every instruction is true."
      )
    );

    const layout = createElement(
      "div",
      "fine-print-puzzle-layout"
    );

    const slots = createSlots();
    const ruleList = createRules();

    layout.append(
      slots,
      ruleList
    );

    const instruction = createElement(
      "p",
      "fine-print-hint",
      "Drag the stars to swap them, or tap two stars."
    );

    const dialogue = createElement(
      "p",
      "fine-print-dialogue",
      moves === 0
        ? "Bb, it's literally three stars."
        : "You can do it. I believe in you. Mostly."
    );

    const actions = createElement(
      "div",
      "fine-print-puzzle-actions"
    );

    const terms = createButton(
      "✧  supplementary terms",
      "fine-print-secondary",
      showSupplementaryTerms
    );

    actions.appendChild(terms);

    if (moves >= 2) {
      const challenge = createButton(
        "challenge the instructions  →",
        "fine-print-action",
        showChallenge
      );

      actions.appendChild(challenge);
    }

    content.append(
      layout,
      instruction,
      dialogue,
      actions
    );

    root.append(
      makeHeader(),
      content
    );
  }

  function updatePuzzle() {
    showPuzzle();
  }

  function showChallenge() {
    stage = "challenge";
    clear();

    const content = createElement(
      "section",
      "fine-print-content challenge-stage"
    );

    content.appendChild(
      makeIntro(
        "A SMALL PROBLEM",
        "Something about these instructions doesn't add up."
      )
    );

    const explanation = createElement(
      "p",
      "fine-print-challenge-copy",
      "Silver must be above Blue. Blue must be above Gold. Gold must be above Silver."
    );

    const question = createElement(
      "p",
      "fine-print-challenge-question",
      "Which part of the agreement lets you challenge this?"
    );

    const options = createElement(
      "div",
      "fine-print-options"
    );

    const first = createButton(
      "§01 · Nadhira is always right",
      "fine-print-option",
      () => wrongAnswer(
        "Nice try, bb. That's not the loophole."
      )
    );

    const second = createButton(
      "§02 · Faris may challenge",
      "fine-print-option",
      () => wrongAnswer(
        "You can challenge me... but what makes these instructions invalid?"
      )
    );

    const third = createButton(
      "§04 · Impossible instructions are void",
      "fine-print-option",
      showVictory
    );

    options.append(
      first,
      second,
      third
    );

    const response = createElement(
      "p",
      "fine-print-answer-response"
    );

    response.id = "finePrintAnswerResponse";

    content.append(
      explanation,
      question,
      options,
      response
    );

    root.append(
      makeHeader(),
      content
    );
  }

  function wrongAnswer(text) {
    const response = document.getElementById(
      "finePrintAnswerResponse"
    );

    if (response) response.textContent = text;
  }

  function showVictory() {
    stage = "victory";
    clear();

    if (!completed) {
      completed = true;

      window.dispatchEvent(
        new CustomEvent("finePrintComplete")
      );
    }

    const content = createElement(
      "section",
      "fine-print-content victory-stage"
    );

    const symbol = createElement(
      "div",
      "fine-print-victory-symbol",
      "✧"
    );

    const eyebrow = createElement(
      "span",
      "fine-print-victory-eyebrow",
      "AGREEMENT INVALIDATED"
    );

    const title = createElement(
      "h2",
      "fine-print-victory-title",
      "FARIS WAS RIGHT."
    );

    const first = createElement(
      "p",
      "fine-print-victory-line",
      "...this time."
    );

    const second = createElement(
      "p",
      "fine-print-victory-line",
      "Don't let it get to your head, bb."
    );

    const third = createElement(
      "p",
      "fine-print-victory-love",
      "Love you."
    );

    const returnButton = createButton(
      "return to scorpius  →",
      "fine-print-action",
      close
    );

    content.append(
      symbol,
      eyebrow,
      title,
      first,
      second,
      third,
      returnButton
    );

    root.append(
      makeHeader(),
      content
    );
  }

  function draw(timestamp) {
    if (!root.classList.contains("visible")) {
      frame = null;
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (
      typeof window.drawConstellationStar ===
      "function"
    ) {
      for (let i = 0; i < 38; i++) {
        const x =
          ((i * 173.7 + 47) % 1000) / 1000 * width;

        const y =
          ((i * 317.3 + 83) % 1000) / 1000 * height;

        const shimmer =
          0.72 +
          Math.sin(timestamp / 2300 + i * 1.7) *
          0.12;

        window.drawConstellationStar(
          ctx,
          x,
          y,
          i % 7 === 0 ? 1.8 : 1.05,
          "cool",
          "Bellatrix",
          timestamp / 1000,
          shimmer
        );
      }
    }

    frame = requestAnimationFrame(draw);
  }

  function open() {
    arrangement = ["silver", "blue", "gold"];
    moves = 0;
    selected = null;
    dragging = null;

    root.classList.add("visible");
    root.setAttribute("aria-hidden", "false");

    document.body.classList.add(
      "fine-print-open"
    );

    showAgreement();

    if (!frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  function initialise() {
    root = createElement(
      "div",
      "fine-print-experience"
    );

    root.id = "finePrintExperience";

    root.setAttribute("aria-hidden", "true");

    canvas = createElement(
      "canvas",
      "fine-print-canvas"
    );

    ctx = canvas.getContext("2d");

    root.appendChild(canvas);

    document.body.appendChild(root);

    window.openFinePrint = open;
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
