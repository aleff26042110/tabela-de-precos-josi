// Josi Maria · Nail Designer — interações leves (mobile-first)
(function () {
  "use strict";

  // Ano dinâmico no rodapé
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Brilho que acompanha o cursor nos botões e chamadas para ação.
  var glareTargets = document.querySelectorAll(".btn, .mini-cta, .sticky-cta, .site-intro-skip");
  glareTargets.forEach(function (target) {
    target.classList.add("glare-target");
    target.addEventListener("pointerenter", function (event) {
      if (reduceMotion || event.pointerType === "touch") return;
      target.classList.add("glare-active");
    });
    target.addEventListener("pointermove", function (event) {
      if (reduceMotion || event.pointerType === "touch") return;
      var rect = target.getBoundingClientRect();
      target.style.setProperty("--glare-x", (event.clientX - rect.left) + "px");
      target.style.setProperty("--glare-y", (event.clientY - rect.top) + "px");
    });
    target.addEventListener("pointerleave", function () {
      target.classList.remove("glare-active");
    });
  });

  // A abertura em tela cheia é controlada por intro.js (30 frames em canvas).
  // Aqui ficam só as interações do site principal.

  // Onda curta no ponto do toque, com escala de pressão como feedback imediato.
  var rippleTargets = document.querySelectorAll(".btn, .mini-cta, .sticky-cta, .site-intro-skip, .chips a, .info-card.link, .footer a");
  rippleTargets.forEach(function (target) {
    target.classList.add("ripple-target");
    target.addEventListener("pointerdown", function (event) {
      if (reduceMotion || !event.isPrimary) return;
      var rect = target.getBoundingClientRect();
      target.style.setProperty("--ripple-x", (event.clientX - rect.left) + "px");
      target.style.setProperty("--ripple-y", (event.clientY - rect.top) + "px");
      target.classList.remove("is-rippling");
      void target.offsetWidth;
      target.classList.add("is-rippling");
      window.clearTimeout(target._rippleTimer);
      target._rippleTimer = window.setTimeout(function () {
        target.classList.remove("is-rippling");
      }, 500);
    });
  });

  // Revela os cards ao rolar (respeita reduced-motion)
  var cards = document.querySelectorAll(".price-card");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    cards.forEach(function (c) { c.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(function (c) { io.observe(c); });
  }

  // Destaca o chip da seção visível
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chips a"));
  var sections = chips
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navIo.observe(s); });
  }
})();
