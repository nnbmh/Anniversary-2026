/* ==========================================
   SCORPIUS TELESCOPE
   Our Little Universe
========================================== */

(() => {
  "use strict";

  const DRAW_DURATION = 4200;
  const FOCUS_RADIUS = 90;

  let focusStarted = null;
  let discovered = false;

  const chapter = document.getElementById("scorpiusChapter");

  if (!chapter) return;

  // Move the chapter outside the draggable universe.
  document.body.appendChild(chapter);

  function getPosition() {
    const element = document.getElementById("scorpius");

    if (!element) return null;

    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width * (355 / 560),
      y: rect.top + rect.height * (270 / 620)
    };
  }

  function getDistance() {
    const position = getPosition();

    if (!position) return Infinity;

    return Math.hypot(
      lensX - position.x,
      lensY - position.y
    );
  }

  function drawStars(width, height) {
    const position = getPosition();

    if (!position) return;

    const distance = getDistance();

    if (distance > 330) return;

    const intensity = Math.max(
      0.15,
      1 - distance / 330
    );

    const centreX =
      width / 2 + (position.x - lensX) * 0.55;

    const centreY =
      height / 2 + (position.y - lensY) * 0.55;

    const scale = 0.62;

    const points = new Map();

    scorpiusStars.forEach(star => {
      const x =
        centreX + (star.x - 355) * scale;

      const y =
        centreY + (star.y - 270) * scale;

      points.set(star.id, { x, y });

      ctx.save();

      ctx.globalAlpha = intensity;

      const antares = star.id === "antares";

      ctx.fillStyle = antares
        ? "#ffd1a0"
        : "#eef1ff";

      ctx.shadowColor = antares
        ? "#ff986b"
        : "#aac7ff";

      ctx.shadowBlur = antares ? 14 : 8;

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        Math.max(1.5, star.size * 0.55),
        0,
        Math.PI * 2
      );

      ctx.fill();
      ctx.restore();
    });

    if (focusStarted === null) return;

    const elapsed =
      performance.now() - focusStarted;

    const progress = Math.min(
      1,
      elapsed / DRAW_DURATION
    );

    const total = scorpiusConnections.length;

    ctx.save();

    ctx.strokeStyle = "rgba(205,220,255,0.9)";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "#a8c7ff";
    ctx.shadowBlur = 6;

    scorpiusConnections.forEach(
      ([from, to], index) => {
        const amount = Math.max(
          0,
          Math.min(1, progress * total - index)
        );

        if (amount <= 0) return;

        const a = points.get(from);
        const b = points.get(to);

        if (!a || !b) return;

        ctx.beginPath();

        ctx.moveTo(a.x, a.y);

        ctx.lineTo(
          a.x + (b.x - a.x) * amount,
          a.y + (b.y - a.y) * amount
        );

        ctx.stroke();
      }
    );

    ctx.restore();
  }

  function update(timestamp) {
    if (
      !discovered &&
      telescopeActive &&
      !chapter.classList.contains("active")
    ) {
      const distance = getDistance();

      if (
        distance <= FOCUS_RADIUS &&
        !telescopeDragging
      ) {
        if (focusStarted === null) {
          focusStarted = timestamp;
        }

        const elapsed = timestamp - focusStarted;

        if (elapsed >= DRAW_DURATION + 400) {
          discovered = true;

          setTelescope(false);

          chapter.classList.add("active");
          chapter.setAttribute(
            "aria-hidden",
            "false"
          );
        }
      } else {
        // Moving away resets the drawing.
        focusStarted = null;
      }

      if (telescopeActive) {
        const rect =
          eyepiece.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          drawStars(rect.width, rect.height);
        }
      }
    } else {
      focusStarted = null;
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);

})();
