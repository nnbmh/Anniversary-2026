/* EPSILON — THE LAST WORD */

(() => {
  "use strict";

  let panel;
  let completed = false;
  let step = "start";

  function create() {
    panel = document.createElement("div");
    panel.id = "epsilonExperience";
    panel.hidden = true;

    panel.innerHTML = `
      <div class="epsilon-backdrop"></div>

      <section class="epsilon-content"
        role="dialog"
        aria-modal="true"
        aria-label="The Last Word">

        <button class="epsilon-close"
          type="button"
          aria-label="Close">
          ×
        </button>

        <div class="epsilon-heading">
          <span>EPSILON · THE LITTLE MENACE</span>
          <h2>The Last Word</h2>
        </div>

        <div class="epsilon-scene">
          <div class="epsilon-star">
            <span class="epsilon-star-core"></span>
          </div>

          <p class="epsilon-speaker" id="epsilonSpeaker">
            NADHIRA
          </p>

          <p class="epsilon-dialogue"
            id="epsilonDialogue"></p>
        </div>

        <div class="epsilon-choices"
          id="epsilonChoices"></div>

        <p class="epsilon-progress"
          id="epsilonProgress"></p>
      </section>
    `;

    document.body.appendChild(panel);

    panel.querySelector(".epsilon-close")
      .addEventListener("click", close);

    panel.querySelector(".epsilon-backdrop")
      .addEventListener("click", close);

    window.openFinePrint = open;
    window.openImpostorStar = open;
  }

  function say(speaker, dialogue, choices, progress = "") {
    const speakerElement =
      panel.querySelector("#epsilonSpeaker");

    const dialogueElement =
      panel.querySelector("#epsilonDialogue");

    const choicesElement =
      panel.querySelector("#epsilonChoices");

    speakerElement.textContent = speaker;
    dialogueElement.textContent = dialogue;

    dialogueElement.classList.remove("epsilon-appear");
    void dialogueElement.offsetWidth;
    dialogueElement.classList.add("epsilon-appear");

    choicesElement.replaceChildren();

    choices.forEach(choice => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "epsilon-choice";
      button.textContent = choice.text;

      button.addEventListener("click", choice.action);

      choicesElement.appendChild(button);
    });

    panel.querySelector("#epsilonProgress").textContent =
      progress;
  }

  function opening() {
    step = "opening";

    say(
      "NADHIRA",
      "Bb, can we agree on something?",
      [
        {
          text: "Okay, what?",
          action: argument
        },
        {
          text: "That sounds suspicious...",
          action: argument
        }
      ],
      "01 / 04"
    );
  }

  function argument() {
    step = "argument";

    say(
      "NADHIRA",
      "I'm always right. And before you say anything... no, this isn't up for discussion.",
      [
        {
          text: "Fine, you're always right.",
          action: agreed
        },
        {
          text: "No you're not.",
          action: disagreed
        },
        {
          text: "What if we're both right?",
          action: compromise
        }
      ],
      "02 / 04"
    );
  }

  function agreed() {
    step = "agreed";

    say(
      "NADHIRA",
      "See? That wasn't so hard. But why did you agree so quickly? You didn't even think about it.",
      [
        {
          text: "You literally told me to agree.",
          action: contradiction
        },
        {
          text: "I can disagree instead?",
          action: disagreed
        }
      ],
      "03 / 04"
    );
  }

  function disagreed() {
    step = "disagreed";

    say(
      "NADHIRA",
      "Wow bb. So you're saying I'm wrong? Even though I just told you I'm always right?",
      [
        {
          text: "You said this wasn't up for discussion.",
          action: contradiction
        },
        {
          text: "Okay fine, you're right.",
          action: agreed
        }
      ],
      "03 / 04"
    );
  }

  function compromise() {
    step = "compromise";

    say(
      "NADHIRA",
      "Both right? Hmm. Okay, maybe sometimes we can both be right. But I'm still more right.",
      [
        {
          text: "So you're not ALWAYS right?",
          action: contradiction
        },
        {
          text: "How can someone be more right?",
          action: compromiseReply
        }
      ],
      "03 / 04"
    );
  }

  function compromiseReply() {
    say(
      "NADHIRA",
      "I don't know bb. I just am.",
      [
        {
          text: "You literally said we can both be right.",
          action: contradiction
        }
      ],
      "03 / 04"
    );
  }

  function contradiction() {
    step = "caught";

    say(
      "NADHIRA",
      "...",
      [
        {
          text: "So I was right?",
          action: reluctantAdmission
        }
      ],
      "04 / 04"
    );
  }

  function reluctantAdmission() {
    say(
      "NADHIRA",
      "Okay FINE. You were right.",
      [
        {
          text: "HAHAHA I WIN",
          action: lastWord
        },
        {
          text: "Thank you for admitting that.",
          action: lastWord
        }
      ],
      "04 / 04"
    );
  }

  function lastWord() {
    say(
      "NADHIRA",
      "Don't get too excited bb. I still get the last word.",
      [
        {
          text: "No, I do.",
          action: finalTease
        },
        {
          text: "Okay, you can have it.",
          action: finalTease
        }
      ],
      "04 / 04"
    );
  }

  function finalTease() {
    say(
      "NADHIRA",
      "Hehehe. Love you bb.",
      [
        {
          text: "Love you too ❤️",
          action: finish
        }
      ],
      "✧"
    );
  }

  function finish() {
    if (!completed) {
      completed = true;

      window.dispatchEvent(
        new Event("finePrintComplete")
      );

      window.dispatchEvent(
        new Event("impostorStarComplete")
      );
    }

    say(
      "EPSILON · DISCOVERED",
      "The Little Menace. Apparently, being annoying is one of my love languages.",
      [
        {
          text: "Return to Scorpius ↗",
          action: close
        }
      ],
      "✧ COMPLETE"
    );
  }

  function open() {
    if (!panel) return;

    panel.hidden = false;
    document.body.classList.add("epsilon-open");

    opening();
  }

  function close() {
    if (!panel) return;

    panel.hidden = true;
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
