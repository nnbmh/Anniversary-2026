/* =========================================================
   OUR LITTLE UNIVERSE
   Cinematic Astrophotography Sky
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const app =
  document.getElementById("app");

const universe =
  document.getElementById("universe");

const farStars =
  document.getElementById("starsFar");

const midStars =
  document.getElementById("starsMid");

const nearStars =
  document.getElementById("starsNear");

const homeButton =
  document.getElementById("homeButton");

const navigationHint =
  document.getElementById("navigationHint");

const zoomFill =
  document.getElementById("zoomFill");


/* =========================================================
   CAMERA
========================================================= */

let cameraX = 0;
let cameraY = 0;

let targetX = 0;
let targetY = 0;

let zoom = 1;
let targetZoom = 1;

const MIN_ZOOM = 0.58;
const MAX_ZOOM = 2.15;

const CAMERA_EASING = 0.11;
const ZOOM_EASING = 0.09;


/* =========================================================
   INPUT STATE
========================================================= */

let dragging = false;

let previousX = 0;
let previousY = 0;

let previousPinchDistance = null;

let hasInteracted = false;


/* =========================================================
   SEEDED RANDOM
========================================================= */

function seededRandom(seed) {

  const x =
    Math.sin(seed * 12.9898) *
    43758.5453;

  return x - Math.floor(x);
}


/* =========================================================
   ORDINARY STAR CREATION
========================================================= */

function createSpaceStar(
  container,
  index,
  seed,
  layer
) {

  const star =
    document.createElement("span");

  star.className =
    "space-star";


  /* Position */

  const x =
    seededRandom(
      index * 1.71 + seed
    ) * 100;

  const y =
    seededRandom(
      index * 3.17 + seed
    ) * 100;


  star.style.left =
    `${x}%`;

  star.style.top =
    `${y}%`;


  /* Appearance */

  const appearance =
    seededRandom(
      index * 5.93 + seed
    );


  if (appearance < .22) {

    star.classList.add(
      "tiny"
    );

  }


  else if (
    appearance > .82 &&
    appearance < .93
  ) {

    star.classList.add(
      "medium"
    );

  }


  else if (
    appearance >= .93
  ) {

    star.classList.add(
      "large"
    );

  }


  /*
    Very few stars are given
    stronger highlights.
  */

  if (
    appearance > .965
  ) {

    star.classList.add(
      "bright"
    );

  }


  if (
    appearance > .987
  ) {

    star.classList.add(
      "anchor"
    );

  }


  /*
    Small temperature variation.
  */

  const temperature =
    seededRandom(
      index * 8.21 + seed
    );


  if (
    temperature > .94
  ) {

    star.classList.add(
      "warm"
    );

  }

  else if (
    temperature < .08
  ) {

    star.classList.add(
      "cool"
    );

  }


  /* Opacity by depth */

  let opacity;


  if (layer === "far") {

    opacity =
      .15 +
      seededRandom(
        index * 10.1 + seed
      ) * .42;

  }


  else if (
    layer === "mid"
  ) {

    opacity =
      .28 +
      seededRandom(
        index * 11.4 + seed
      ) * .5;

  }


  else {

    opacity =
      .42 +
      seededRandom(
        index * 12.7 + seed
      ) * .48;

  }


  star.style.opacity =
    opacity;


  /* Restrained twinkling */

  const twinkle =
    seededRandom(
      index * 14.3 + seed
    );


  if (
    twinkle > .92
  ) {

    star.classList.add(
      "twinkle"
    );


    const speed =
      5 +
      seededRandom(
        index * 16.7 + seed
      ) * 6;


    star.style.setProperty(
      "--twinkle-speed",
      `${speed}s`
    );


    star.style.setProperty(
      "--base-opacity",
      Math.max(
        .18,
        opacity - .16
      )
    );


    star.style.setProperty(
      "--peak-opacity",
      Math.min(
        1,
        opacity + .2
      )
    );

  }


  container.appendChild(star);

}


/* =========================================================
   BUILD ORDINARY SKY
========================================================= */

function buildOrdinarySky() {

  /*
    More distant stars than before.

    Because most are extremely small,
    this increases richness without
    turning the sky into glitter.
  */

  for (
    let i = 0;
    i < 850;
    i++
  ) {

    createSpaceStar(
      farStars,
      i,
      17,
      "far"
    );

  }


  for (
    let i = 0;
    i < 390;
    i++
  ) {

    createSpaceStar(
      midStars,
      i,
      53,
      "mid"
    );

  }


  for (
    let i = 0;
    i < 125;
    i++
  ) {

    createSpaceStar(
      nearStars,
      i,
      97,
      "near"
    );

  }

}


/* =========================================================
   MILKY WAY MICRO STARS
========================================================= */

/*
  Instead of a rectangular strip of dots,
  these stars follow a diagonal curved band.

  The centre is denser than the edges.
*/

function buildMilkyWay() {

  const amount = 300;


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const star =
      document.createElement(
        "span"
      );


    star.className =
      "milky-star";


    /*
      Travel horizontally across
      most of the universe.
    */

    const progress =
      seededRandom(
        i * 2.17 + 400
      );


    const x =
      4 +
      progress * 92;


    /*
      Diagonal centre line.

      At x=0 the band is lower.
      At x=100 it is higher.
    */

    const centreY =
      70 -
      x * .38;


    /*
      Several random values are averaged.

      This naturally clusters most stars
      close to the centre line while still
      allowing some to sit farther away.
    */

    const r1 =
      seededRandom(
        i * 3.11 + 700
      );

    const r2 =
      seededRandom(
        i * 5.37 + 900
      );

    const r3 =
      seededRandom(
        i * 7.23 + 1200
      );


    const spread =
      (
        r1 +
        r2 +
        r3
      ) / 3;


    const offset =
      (
        spread - .5
      ) * 27;


    /*
      Gentle waviness prevents the band
      from looking mechanically straight.
    */

    const wave =
      Math.sin(
        progress *
        Math.PI *
        3
      ) * 2.8;


    const y =
      centreY +
      offset +
      wave;


    star.style.left =
      `${x}%`;

    star.style.top =
      `${y}%`;


    /*
      Most are extremely tiny.
    */

    const sizeValue =
      seededRandom(
        i * 9.13 + 1500
      );


    let size;


    if (
      sizeValue > .985
    ) {

      size = 2.1;

    }

    else if (
      sizeValue > .91
    ) {

      size = 1.4;

    }

    else {

      size =
        .45 +
        sizeValue * .55;

    }


    star.style.width =
      `${size}px`;

    star.style.height =
      `${size}px`;


    /*
      Centre of the Milky Way is
      slightly brighter.
    */

    const centreDistance =
      Math.abs(
        spread - .5
      );


    let opacity =
      .08 +
      (
        1 - centreDistance * 2
      ) * .25;


    opacity +=
      seededRandom(
        i * 12.7 + 1700
      ) * .15;


    opacity =
      Math.max(
        .05,
        Math.min(
          .46,
          opacity
        )
      );


    star.style.opacity =
      opacity;


    /*
      Slight temperature differences.
    */

    const tone =
      seededRandom(
        i * 13.91 + 1900
      );


    if (
      tone > .93
    ) {

      star.style.background =
        "#fff0d6";

    }

    else if (
      tone < .1
    ) {

      star.style.background =
        "#dbe8ff";

    }


    /*
      The Milky Way lives in the
      far star layer.
    */

    farStars.appendChild(
      star
    );

  }

}


/* =========================================================
   BUILD SKY
========================================================= */

buildOrdinarySky();

buildMilkyWay();


/* =========================================================
   CAMERA BOUNDARIES
========================================================= */

function clampCamera() {

  const maxX =
    window.innerWidth *
    1.25;


  const maxY =
    window.innerHeight *
    1.35;


  targetX =
    Math.max(
      -maxX,
      Math.min(
        maxX,
        targetX
      )
    );


  targetY =
    Math.max(
      -maxY,
      Math.min(
        maxY,
        targetY
      )
    );

}


/* =========================================================
   PARALLAX
========================================================= */

function updateParallax() {

  /*
    The Milky Way is inside the far layer,
    so it moves the least.

    Foreground stars move the most.
  */

  farStars.style.transform =
    `
      translate3d(
        ${-cameraX * .016}px,
        ${-cameraY * .016}px,
        0
      )
    `;


  midStars.style.transform =
    `
      translate3d(
        ${-cameraX * .052}px,
        ${-cameraY * .052}px,
        0
      )
    `;


  nearStars.style.transform =
    `
      translate3d(
        ${-cameraX * .12}px,
        ${-cameraY * .12}px,
        0
      )
    `;

}


/* =========================================================
   RENDER CAMERA
========================================================= */

function renderCamera() {

  universe.style.transform =
    `
      translate3d(
        calc(-50% + ${cameraX}px),
        calc(-50% + ${cameraY}px),
        0
      )
      scale(${zoom})
    `;


  updateParallax();


  const progress =
    (
      (
        zoom -
        MIN_ZOOM
      )
      /
      (
        MAX_ZOOM -
        MIN_ZOOM
      )
    ) * 100;


  zoomFill.style.width =
    `${
      Math.max(
        5,
        Math.min(
          100,
          progress
        )
      )
    }%`;

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate() {

  cameraX +=
    (
      targetX -
      cameraX
    ) *
    CAMERA_EASING;


  cameraY +=
    (
      targetY -
      cameraY
    ) *
    CAMERA_EASING;


  zoom +=
    (
      targetZoom -
      zoom
    ) *
    ZOOM_EASING;


  renderCamera();


  requestAnimationFrame(
    animate
  );

}


animate();


/* =========================================================
   FIRST INTERACTION
========================================================= */

function registerInteraction() {

  if (
    hasInteracted
  ) {
    return;
  }


  hasInteracted =
    true;


  navigationHint.classList.add(
    "hidden"
  );

}


/* =========================================================
   DRAG
========================================================= */

document.addEventListener(
  "pointerdown",
  event => {

    if (
      event.target.closest(
        "#interface"
      )
    ) {
      return;
    }


    dragging = true;


    previousX =
      event.clientX;


    previousY =
      event.clientY;


    app.classList.add(
      "dragging"
    );


    registerInteraction();

  }
);


document.addEventListener(
  "pointermove",
  event => {

    if (
      !dragging
    ) {
      return;
    }


    const deltaX =
      event.clientX -
      previousX;


    const deltaY =
      event.clientY -
      previousY;


    targetX +=
      deltaX / zoom;


    targetY +=
      deltaY / zoom;


    previousX =
      event.clientX;


    previousY =
      event.clientY;


    clampCamera();

  }
);


function stopDragging() {

  dragging = false;


  app.classList.remove(
    "dragging"
  );

}


document.addEventListener(
  "pointerup",
  stopDragging
);


document.addEventListener(
  "pointercancel",
  stopDragging
);


/* =========================================================
   DESKTOP ZOOM
========================================================= */

document.addEventListener(
  "wheel",
  event => {

    event.preventDefault();


    registerInteraction();


    targetZoom +=
      -event.deltaY *
      .0012;


    targetZoom =
      Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          targetZoom
        )
      );

  },
  {
    passive: false
  }
);


/* =========================================================
   MOBILE PINCH ZOOM
========================================================= */

document.addEventListener(
  "touchmove",
  event => {

    if (
      event.touches.length !== 2
    ) {

      previousPinchDistance =
        null;

      return;

    }


    event.preventDefault();


    registerInteraction();


    const a =
      event.touches[0];


    const b =
      event.touches[1];


    const dx =
      a.clientX -
      b.clientX;


    const dy =
      a.clientY -
      b.clientY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      previousPinchDistance !== null
    ) {

      const difference =
        distance -
        previousPinchDistance;


      targetZoom +=
        difference *
        .0028;


      targetZoom =
        Math.max(
          MIN_ZOOM,
          Math.min(
            MAX_ZOOM,
            targetZoom
          )
        );

    }


    previousPinchDistance =
      distance;

  },
  {
    passive: false
  }
);


document.addEventListener(
  "touchend",
  () => {

    previousPinchDistance =
      null;

  }
);


/* =========================================================
   RETURN TO ORION
========================================================= */

function returnToOrion() {

  targetX = 0;
  targetY = 0;

  targetZoom = 1;

}


homeButton.addEventListener(
  "click",
  returnToOrion
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  clampCamera
);


/* =========================================================
   START
========================================================= */

returnToOrion();
