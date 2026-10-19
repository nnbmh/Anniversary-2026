/* ==========================================
   SHAULA — THE SOFT SIDE
   The Things I Used to Hold Back
========================================== */

(() => {
  "use strict";

  const moments = [
    {
      text: "I think I've always been a little careful with my heart.",
      note: "THE FIRST LAYER"
    },
    {
      text: "Even when I knew I loved you, there was still a part of me that held back.",
      note: "THE THINGS I DIDN'T REALISE"
    },
    {
      text: "Not because I wasn't sure about you, bb. I think I was just so used to protecting myself.",
      note: "THE WAY I USED TO LOVE"
    },
    {
      text: "But lately... something feels different.",
      note: "SOMETHING CHANGED"
    }
  ];

  let root;
  let star;
  let rings;
  let words;
  let caption;
  let instruction;
  let ending;
  let step = 0;
  let busy = false;
  let finished = false;
  let timers = [];

  function later(callback, delay) {
    const timer = setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function create() {
    root = document.createElement("div");
    root.id = "shaulaExperience";
    root.hidden = true;

    root.innerHTML = `
      <div class="shaula-veil"></div>

      <button
        class="shaula-close"
        type="button"
        aria-label="Close Shaula"
      >×</button>

      <div class="shaula-content">

        <header class="shaula-heading">
          <span>SCORPIUS · SHAULA</span>
          <h1>The Soft Side</h1>
          <p>THE THINGS I USED TO HOLD BACK</p>
        </header>

        <div class="shaula-universe">

          <div class="shaula-orbit shaula-orbit-one"></div>
          <div class="shaula-orbit shaula-orbit-two"></div>
          <div class="shaula-orbit shaula-orbit-three"></div>
          <div class="shaula-orbit shaula-orbit-four"></div>

          <div class="shaula-hidden-stars"></div>

          <button
            class="shaula-star"
            type="button"
            aria-label="Touch the star"
          >
            <span class="shaula-star-light"></span>
          </button>

        </div>

        <div class="shaula-writing">
          <span class="shaula-caption"></span>
          <p class="shaula-words"></p>
        </div>

        <p class="shaula-instruction">
          TOUCH THE STAR
        </p>

        <div class="shaula-ending" hidden>
          <div class="shaula-ending-copy"></div>

          <button
            class="shaula-return"
            type="button"
          >
            return to Scorpius ↗
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(root);

    star = root.querySelector(".shaula-star");
    rings = [...root.querySelectorAll(".shaula-orbit")];
    words = root.querySelector(".shaula-words");
    caption = root.querySelector(".shaula-caption");
    instruction = root.querySelector(".shaula-instruction");
    ending = root.querySelector(".shaula-ending");

    star.addEventListener("click", advance);

    root.querySelector(".shaula-close")
      .addEventListener("click", close);

    root.querySelector(".shaula-return")
      .addEventListener("click", close);

    createStars();

    window.openShaula = open;
  }

  function createStars() {
    const container =
      root.querySelector(".shaula-hidden-stars");

    const positions = [
      [49, 13],
      [76, 26],
      [88, 49],
      [73, 77],
      [48, 87],
      [22, 72],
      [12, 46],
      [26, 22],
      [61, 36],
      [36, 61],
      [64, 65],
      [34, 34]
    ];

    positions.forEach(([x, y], index) => {
      const point = document.createElement("span");

      point.className = "shaula-distant-star";
      point.style.left = `${x}%`;
      point.style.top = `${y}%`;
      point.style.animationDelay = `${index * 0.18}s`;

      container.appendChild(point);
    });
  }

  function changeWords(text, note) {
    words.classList.remove("shaula-visible");
    caption.classList.remove("shaula-visible");

    later(() => {
      words.textContent = text;
      caption.textContent = note;

      words.classList.add("shaula-visible");
      caption.classList.add("shaula-visible");
    }, 320);
  }

  function advance() {
    if (busy || step >= moments.length) return;

    busy = true;

    const moment = moments[step];

    changeWords(moment.text, moment.note);

    if (rings[step]) {
      rings[step].classList.add("shaula-dissolve");
    }

    root.style.setProperty(
      "--shaula-warmth",
      `${0.2 + step * 0.2}`
    );

    step++;

    if (step === moments.length) {
      instruction.textContent = "";

      later(() => {
        beginRelease();
      }, 2600);

      return;
    }

    later(() => {
      busy = false;
    }, 1250);
  }

  function beginRelease() {
    star.disabled = true;

    changeWords(
      "You don't have to break down these walls for me.",
      "SOMETHING I WANT YOU TO KNOW"
    );

    later(() => {
      changeWords(
        "I've been learning how to lower them myself.",
        "LITTLE BY LITTLE"
      );
    }, 3200);

    later(() => {
      root.classList.add("shaula-opened");

      changeWords(
        "And the more I let myself feel... the deeper I find myself falling in love with you.",
        "WHAT WAS WAITING UNDERNEATH"
      );
    }, 6500);

    later(showConfession, 11000);
  }

  function showConfession() {
    root.classList.add("shaula-confession");

    const copy = root.querySelector(".shaula-ending-copy");

    copy.innerHTML = `
      <span class="shaula-final-label">
        FOR FARIS
      </span>

      <p>
        I think I've spent so long being careful
        with my heart that I didn't realise
        how much I was holding back.
      </p>

      <p>
        But lately, as I've started understanding
        myself a little better, it's like
        something inside me has finally opened up.
      </p>

      <p>
        And bb... my feelings for you
        have genuinely grown deeper.
      </p>

      <p>
        I find myself wanting to love you
        more openly. To be more affectionate,
        more thoughtful, and more present.
        To let you see the parts of me
        I've always kept to myself.
      </p>

      <p>
        I want to take care of you.
        I want to understand you better.
        I want to be someone you can lean on,
        and someone who makes you feel loved
        without you having to ask.
      </p>

      <p>
        I know I'm still learning.
        There will probably be days when
        I struggle to find the right words,
        or when I fall back into old habits.
      </p>

      <p>
        But I don't want to keep loving you
        from behind a wall anymore.
      </p>

      <p class="shaula-emphasis">
        I want to let you in, bb.
        Properly.
      </p>

      <p>
        And I want you to know that
        the love I have for you isn't standing still.
      </p>

      <p>
        It's growing.
      </p>

      <p class="shaula-last-line">
        And so am I.
      </p>

      <span class="shaula-signature">
        I love you, Faris. ♡
      </span>
    `;

    ending.hidden = false;

    if (!finished) {
      finished = true;

      window.dispatchEvent(
        new Event("shaulaComplete")
      );
    }
  }

  function open() {
    if (!root) return;

    clearTimers();

    step = 0;
    busy = false;

    root.hidden = false;

    root.classList.remove(
      "shaula-opened",
      "shaula-confession"
    );

    root.style.setProperty("--shaula-warmth", "0");

    rings.forEach(ring => {
      ring.classList.remove("shaula-dissolve");
    });

    words.textContent = "";
    caption.textContent = "";

    ending.hidden = true;
    star.disabled = false;

    instruction.textContent = "TOUCH THE STAR";

    document.body.classList.add("shaula-active");
  }

  function close() {
    clearTimers();

    root.hidden = true;

    document.body.classList.remove("shaula-active");
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
