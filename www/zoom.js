/* ============================================================
   zoom.js — تكبير/تصغير الصفحة (وضع المصحف فقط)
   ============================================================ */

(function () {
  var currentScale = 1;
  var minScale = 1;
  var maxScale = 4;
  var startDistance = 0;
  var startScale = 1;
  var isPinching = false;
  var translateX = 0;
  var translateY = 0;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartY = 0;

  // ✅ تحقق أننا في وضع المصحف
  function isMushafMode() {
    return typeof MUSHAF_MODE !== "undefined" && MUSHAF_MODE;
  }

  function getTarget() {
    var img = document.querySelector(".mushaf-page-img img");
    if (img) return img;
    var page = document.querySelector(".page");
    return page;
  }

  function clampTranslation() {
    var target = getTarget();
    if (!target) return;

    var container = document.getElementById("flipbookContainer");
    if (!container) return;

    var containerRect = container.getBoundingClientRect();
    var imgRect = target.getBoundingClientRect();

    var originalW = imgRect.width / currentScale;
    var originalH = imgRect.height / currentScale;

    var scaledW = originalW * currentScale;
    var scaledH = originalH * currentScale;

    var maxX = Math.max(0, (scaledW - containerRect.width) / 2);
    var maxY = Math.max(0, (scaledH - containerRect.height) / 2);

    translateX = Math.max(-maxX, Math.min(maxX, translateX));
    translateY = Math.max(-maxY, Math.min(maxY, translateY));
  }

  function applyTransform() {
    var target = getTarget();
    if (!target) return;

    clampTranslation();

    target.style.transform = "scale(" + currentScale + ") translate(" + translateX + "px, " + translateY + "px)";
    target.style.transition = isPinching || isDragging ? "none" : "transform 0.2s ease";
    target.style.transformOrigin = "center center";
  }

  function resetTransform() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    var target = getTarget();
    if (target) {
      target.style.transform = "";
      target.style.transition = "";
    }
  }

  document.addEventListener("touchstart", function (e) {
    // ✅ فقط في وضع المصحف
    if (!isMushafMode()) return;

    if (e.touches.length === 2) {
      isPinching = true;
      startDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startScale = currentScale;
    } else if (e.touches.length === 1 && currentScale > 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - translateX;
      dragStartY = e.touches[0].clientY - translateY;
    }
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    // ✅ فقط في وضع المصحف
    if (!isMushafMode()) return;

    if (e.touches.length === 2 && isPinching) {
      if (e.cancelable) e.preventDefault();
      var distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      var scale = (distance / startDistance) * startScale;
      currentScale = Math.max(minScale, Math.min(maxScale, scale));
      applyTransform();
    } else if (e.touches.length === 1 && isDragging && currentScale > 1) {
      if (e.cancelable) e.preventDefault();
      translateX = e.touches[0].clientX - dragStartX;
      translateY = e.touches[0].clientY - dragStartY;
      applyTransform();
    }
  }, { passive: false });

  document.addEventListener("touchend", function (e) {
    // ✅ فقط في وضع المصحف
    if (!isMushafMode()) return;

    if (e.touches.length < 2) isPinching = false;
    if (e.touches.length === 0) {
      isDragging = false;
      if (currentScale < 1.1) resetTransform();
    }
  }, { passive: true });

  // ✅ نقر مزدوج (في وضع المصحف فقط)
  var lastTap = 0;
  document.addEventListener("touchend", function (e) {
    if (!isMushafMode()) return;

    var now = Date.now();
    if (now - lastTap < 300) {
      if (currentScale > 1.1) {
        resetTransform();
      } else {
        currentScale = 2;
        applyTransform();
      }
    }
    lastTap = now;
  });

  window.resetZoom = resetTransform;
})();
