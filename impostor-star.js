/* =========================================
   IMPOSTOR STAR — THE LITTLE MENACE
========================================= */

(() => {
  "use strict";

  let game;
  let playfield;
  let dialogue;
  let speaker;
  let nextButton;
  let nadhira;
  let faris;

  let round = 1;
  let solved = false;
  let betrayalDone = false;
  let correctIndex = 0;
  let timer = null;

  const NADHIRA =
    "assets/chibis/nadhira-sprites.PNG";

  const FARIS =
    "assets/chibis/faris-sprites.PNG";

  function makeCharacter(name, imagePath) {
    const container = document.createElement("div");

    container.className =
      `impostor-character ${name}`;

    const image = document.createElement("img");

    image.className = "impostor-sprite";
    image.src = imagePath;
    image.alt = name;

    container.appendChild(image);

    return container;
  }

  function expression(character, number) {
    const image =
      character.querySelector(".impostor-sprite");

    const index = number - 1;

    const column = index % 5;
    const row = Math.floor(index / 5);

    image.style.left = `${-column * 100}%`;
    image.style.top = `${-row * 100}%`;
  }

  function move(character, movement) {
    character.classList.remove(
      "bounce", "tilt", "lean", "kiss"
    );

    void character.offsetWidth;

    character.classList.add(movement);

    const duration = movement === "kiss" ? 1200 : 850;

   setTimeout(() => {
     character.classList.remove(movement);
   }, duration);
  }

  function say(who, text) {
    speaker.textContent = who;
    dialogue.textContent = text;
  }

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function makeStars() {
    playfield.innerHTML = "";

    for (let i = 0; i < 6; i++) {
      const star = document.createElement("button");

      star.className = "impostor-star";
      star.textContent = "✦";
      star.type = "button";

      star.style.animationDelay = `${i * -.35}s`;

      if (i === correctIndex) {
        if (round === 1 || round === 3) {
          star.classList.add("pink");
        }

        if (round === 2) {
          star.classList.add("flicker");
        }
      }

      star.addEventListener("click", () => {
        chooseStar(i, star);
      });

      playfield.appendChild(star);
    }
  }

  function startRound(number) {
    clearTimer();

    round = number;
    solved = false;
    betrayalDone = false;

    nextButton.hidden = true;

    correctIndex = Math.floor(Math.random() * 6);

    document.getElementById(
      "impostorRound"
    ).textContent = `ROUND ${round} OF 3`;

    expression(nadhira, 2);
    expression(faris, 1);

    if (round === 1) {
      say(
        "NADHIRA",
        "Okay bb... one of these stars doesn't belong. Find it!"
      );
    }

    if (round === 2) {
      expression(faris, 9);

      say(
        "NADHIRA",
        "Hehehe. This time you'll have to watch carefully."
      );
    }

    if (round === 3) {
      expression(nadhira, 4);

      say(
        "NADHIRA",
        "Last round bb. I promise I'll behave."
      );
    }

    makeStars();
  }

  function chooseStar(index, star) {
    if (solved) return;

    if (index !== correctIndex) {
      expression(nadhira, 2);
      expression(faris, 6);

      move(nadhira, "bounce");
      move(faris, "tilt");

      say(
        "NADHIRA",
        "HAHAHA bb... are you even looking?"
      );

      return;
    }

    if (round === 3 && !betrayalDone) {
      betrayalDone = true;

      const previous = correctIndex;

      const choices = [0, 1, 2, 3, 4, 5]
        .filter(i => i !== previous);

      correctIndex =
        choices[Math.floor(Math.random() * choices.length)];

      const stars = [...playfield.children];

      stars[previous].classList.remove("pink");
      stars[previous].classList.add("shifting");

      stars[correctIndex].classList.add("pink");

      expression(nadhira, 2);
      expression(faris, 5);

      move(nadhira, "bounce");
      move(faris, "tilt");

      say(
        "NADHIRA",
        "HAHAHAHA sorry bb... couldn't resist!"
      );

      return;
    }

    solved = true;

    star.style.transform = "scale(1.5)";
    star.style.color = "#fff0aa";

    expression(faris, 2);
    move(faris, "bounce");

    if (round === 1) {
      expression(nadhira, 4);

      say(
        "NADHIRA",
        "Okay fine... that was too easy."
      );

      nextButton.textContent = "next round →";
      nextButton.hidden = false;
    }

    if (round === 2) {
      expression(nadhira, 3);

      say(
        "NADHIRA",
        "Excuse me?? You're actually good at this?"
      );

      nextButton.textContent = "final round →";
      nextButton.hidden = false;
    }

    if (round === 3) {
      finishGame();
    }
  }

  function finishGame() {
    clearTimer();

    playfield.innerHTML = "";

    document.getElementById(
      "impostorRound"
    ).textContent = "ALL THREE ROUNDS COMPLETE";

    expression(nadhira, 7);
    expression(faris, 2);

    say(
      "NADHIRA",
      "Okay okay... I'll stop annoying you now."
    );

    timer = setTimeout(() => {
      expression(faris, 2);

      say("FARIS", "Finally...");
      move(faris, "bounce");

      timer = setTimeout(() => {
        expression(nadhira, 2);
        expression(faris, 5);

        say(
          "NADHIRA",
          "For approximately five minutes."
        );

        move(nadhira, "bounce");

        timer = setTimeout(() => {
          expression(nadhira, 7);
          expression(faris, 7);

          say("NADHIRA", "Hehehe. Love you bb.");

          move(nadhira, "kiss");
          move(faris, "lean");

          timer = setTimeout(() => {
            document.getElementById(
              "impostorRound"
            ).textContent =
              "✦ THE LITTLE MENACE — COMPLETE";

            nextButton.textContent =
              "return to Scorpius";

            nextButton.hidden = false;
          }, 1200);
        }, 1800);
      }, 1300);
    }, 1700);
  }

  function closeGame(completed = false) {
    clearTimer();

    game.classList.remove("active");
    game.setAttribute("aria-hidden", "true");

    if (completed) {
      window.dispatchEvent(
        new CustomEvent("impostorStarComplete")
      );
    }
  }

  function buildGame() {
    game = document.createElement("section");

    game.id = "impostorGame";
    game.setAttribute("aria-hidden", "true");

    game.innerHTML = `
      <button class="impostor-close" type="button">
        ← Scorpius
      </button>

      <div class="impostor-header">
        <div class="impostor-kicker">
          EPSILON · THE LITTLE MENACE
        </div>

        <h2 class="impostor-title">
          Impostor Star
        </h2>

        <div
          id="impostorRound"
          class="impostor-round"
        ></div>
      </div>

      <div
        id="impostorPlayfield"
        class="impostor-playfield"
      ></div>

      <div class="impostor-dialogue">
        <div
          id="impostorSpeaker"
          class="impostor-speaker"
        ></div>

        <div
          id="impostorDialogue"
          class="impostor-text"
        ></div>
      </div>

      <div
        id="impostorCouple"
        class="impostor-couple"
      ></div>

      <button
        id="impostorNext"
        class="impostor-next"
        type="button"
        hidden
      ></button>
    `;

    document.body.appendChild(game);

    playfield =
      document.getElementById("impostorPlayfield");

    dialogue =
      document.getElementById("impostorDialogue");

    speaker =
      document.getElementById("impostorSpeaker");

    nextButton =
      document.getElementById("impostorNext");

    nadhira = makeCharacter("nadhira", NADHIRA);
    faris = makeCharacter("faris", FARIS);

    document.getElementById(
      "impostorCouple"
    ).append(nadhira, faris);

    game.querySelector(
      ".impostor-close"
    ).addEventListener("click", () => {
      closeGame(false);
    });

    nextButton.addEventListener("click", () => {
      if (round < 3) {
        startRound(round + 1);
      } else {
        closeGame(true);
      }
    });
  }

  window.openImpostorStar = function () {
    if (!game) buildGame();

    game.classList.add("active");
    game.setAttribute("aria-hidden", "false");

    startRound(1);
  };
})();
