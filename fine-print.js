/* EPSILON — THE LAST WORD */

(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  const rounds = [
    {
      intro: "Bb, I'm always right. You can disagree with me if you want... but that doesn't mean you're right.",
      instruction: "Find the two things that don't quite add up.",
      statements: [
        "I'm always right.",
        "Everyone is wrong sometimes.",
        "You can disagree with me.",
        "If you disagree, you're wrong."
      ],
      answer: [0, 1],
      success: "...okay, maybe everyone except me.",
      wrong: [
        "Nice try bb.",
        "That's not a contradiction.",
        "You're reaching HAHAHA."
      ]
    },
    {
      intro: "Anyway, I never change the rules halfway through an argument. I just think of better ones.",
      instruction: "Catch me changing the rules.",
      statements: [
        "I never change the rules.",
        "I just think of better rules.",
        "You started this argument.",
        "I wasn't even arguing."
      ],
      answer: [0, 1],
      success: "...that's different. Somehow.",
      wrong: [
        "Nope. Try again.",
        "Bb, focus.",
        "You're supposed to catch me, remember?"
      ]
    }
  ];

  let root;
  let svg;
  let statementLayer;
  let dialogue;
  let instruction;
  let continueButton;
  let closeButton;
  let roundIndex = 0;
  let selected = [];
  let locked = false;
  let completed = false;
  let wrongCount = 0;

  const positions = [
    [23, 27],
    [77, 30],
    [26, 76],
    [75, 73]
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
  }

  function svgElement(tag, attributes = {}) {
    const node = document.createElementNS(NS, tag);

    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });

    return node;
  }

  function create() {
    root = element("div", "epsilon-experience");
    root.id = "epsilonExperience";
    root.hidden = true;

    root.innerHTML = `
      <div class="epsilon-atmosphere"></div>

      <button class="epsilon-exit" type="button"
        aria-label="Close Epsilon">×</button>

      <header class="epsilon-header">
        <span>SCORPIUS · EPSILON</span>
        <h2>The Last Word</h2>
        <p>THE LITTLE MENACE</p>
      </header>

      <div class="epsilon-story">
        <p class="epsilon-dialogue"></p>
      </div>

      <div class="epsilon-puzzle">
        <svg class="epsilon-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"></svg>

        <div class="epsilon-statements"></div>
      </div>

      <footer class="epsilon-footer">
        <p class="epsilon-instruction"></p>
        <button class="epsilon-continue"
          type="button" hidden>continue →</button>
        <span class="epsilon-round"></span>
      </footer>
    `;

    document.body.appendChild(root);

    svg = root.querySelector(".epsilon-lines");
    statementLayer = root.querySelector(".epsilon-statements");
    dialogue = root.querySelector(".epsilon-dialogue");
    instruction = root.querySelector(".epsilon-instruction");
    continueButton = root.querySelector(".epsilon-continue");
    closeButton = root.querySelector(".epsilon-exit");

    closeButton.addEventListener("click", close);

    continueButton.addEventListener("click", () => {
      if (roundIndex < rounds.length - 1) {
        roundIndex++;
        renderRound();
      } else {
        showEnding();
      }
    });

    window.openFinePrint = open;
    window.openImpostorStar = open;
  }

  function setDialogue(text) {
    dialogue.classList.remove("epsilon-text-enter");
    void dialogue.offsetWidth;

    dialogue.textContent = text;
    dialogue.classList.add("epsilon-text-enter");
  }

  function drawLine(a, b, permanent = false) {
    const from = positions[a];
    const to = positions[b];

    const line = svgElement("line", {
      x1: from[0],
      y1: from[1],
      x2: to[0],
      y2: to[1],
      class: permanent
        ? "epsilon-connection epsilon-permanent"
        : "epsilon-connection epsilon-temporary"
    });

    svg.appendChild(line);

    requestAnimationFrame(() => {
      line.classList.add("drawn");
    });

    return line;
  }

  function clearSelection() {
    selected = [];

    statementLayer
      .querySelectorAll(".epsilon-statement")
      .forEach(node => node.classList.remove("selected"));
  }

  function choose(index) {
    if (locked || selected.includes(index)) return;

    const node = statementLayer.querySelector(
      `[data-index="${index}"]`
    );

    if (!node) return;

    node.classList.add("selected");
    selected.push(index);

    if (selected.length !== 2) return;

    locked = true;

    const [a, b] = selected;
    const round = rounds[roundIndex];

    const correct =
      round.answer.includes(a) &&
      round.answer.includes(b);

    const line = drawLine(a, b, correct);

    if (correct) {
      statementLayer
        .querySelectorAll(".epsilon-statement")
        .forEach(node => {
          node.disabled = true;
        });

      setTimeout(() => {
        selected.forEach(i => {
          statementLayer
            .querySelector(`[data-index="${i}"]`)
            ?.classList.add("solved");
        });

        setDialogue(round.success);
        instruction.textContent = "YOU CAUGHT ME ✦";
        continueButton.hidden = false;
        clearSelection();
      }, 850);

      return;
    }

    wrongCount++;

    const tease =
      round.wrong[(wrongCount - 1) % round.wrong.length];

    setDialogue(tease);

    line.classList.add("incorrect");

    setTimeout(() => {
      line.remove();
      clearSelection();
      locked = false;
    }, 900);
  }

  function makeStatement(text, index) {
    const button = element(
      "button",
      "epsilon-statement",
      ""
    );

    button.type = "button";
    button.dataset.index = index;

    button.style.left = `${positions[index][0]}%`;
    button.style.top = `${positions[index][1]}%`;

    const star = element("span", "epsilon-node");
    const label = element("span", "epsilon-label", text);

    button.append(star, label);

    button.addEventListener("click", () => choose(index));

    return button;
  }

  function renderRound() {
    const round = rounds[roundIndex];

    locked = false;
    selected = [];
    wrongCount = 0;

    root.classList.remove("epsilon-finished");

    svg.replaceChildren();
    statementLayer.replaceChildren();

    round.statements.forEach((text, index) => {
      statementLayer.appendChild(
        makeStatement(text, index)
      );
    });

    setDialogue(round.intro);

    instruction.textContent = round.instruction;
    continueButton.hidden = true;

    root.querySelector(".epsilon-round").textContent =
      `0${roundIndex + 1} / 0${rounds.length}`;

    statementLayer.classList.remove("epsilon-appear");
    void statementLayer.offsetWidth;
    statementLayer.classList.add("epsilon-appear");
  }

  function showEnding() {
    root.classList.add("epsilon-finished");

    svg.replaceChildren();
    statementLayer.replaceChildren();

    setDialogue(
      "Okay FINE bb. You win this one."
    );

    instruction.textContent = "";

    const ending = element("div", "epsilon-ending");

    ending.innerHTML = `
      <span class="epsilon-ending-star">✧</span>
      <p>But I'm still your favourite person
      to argue with, right?</p>
      <button type="button" class="epsilon-ending-reply">
        obviously
      </button>
    `;

    statementLayer.appendChild(ending);

    continueButton.hidden = true;

    ending.querySelector("button").addEventListener(
      "click",
      () => {
        setDialogue("Hehehe. Love you bb.");

        ending.innerHTML = `
          <span class="epsilon-ending-star">✦</span>
          <p>THE LITTLE MENACE</p>
          <small>
            Some arguments are just another
            excuse to talk to you a little longer.
          </small>
          <button type="button"
            class="epsilon-ending-reply">
            return to Scorpius ↗
          </button>
        `;

        ending.querySelector("button")
          .addEventListener("click", close);

        if (!completed) {
          completed = true;

          window.dispatchEvent(
            new Event("finePrintComplete")
          );
        }
      },
      { once: true }
    );
  }

  function open() {
    if (!root) return;

    roundIndex = 0;
    root.hidden = false;

    document.body.classList.add("epsilon-open");

    renderRound();
  }

  function close() {
    if (!root) return;

    root.hidden = true;
    document.body.classList.remove("epsilon-open");
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      create,
      { once: true }
    );
  } else {
    create();
  }
})();
