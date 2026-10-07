// Intro / splash cinematográfica — Josi Maria · Nail Designer
// Reproduz 1x os 30 frames de assets/intro/ em canvas e revela o site.
// - Ordem numérica garantida via padStart (nunca alfabética)
// - Canvas mantém o último pixel desenhado: sem tela branca entre frames
// - Autoplay sem clique, sem controles visíveis, 1x por carregamento
// - prefers-reduced-motion: remove a abertura imediatamente
// - Fallbacks com timeout: a página NUNCA fica presa na abertura
(function () {
  "use strict";

  var TOTAL_FRAMES = 30;
  var FPS = 24; // 30 frames ≈ 1,25 s → aparência de vídeo, não slideshow
  var HOLD_LAST_MS = 900; // último frame parado + brilho antes do fade
  var LEAVE_MS = 250; // acompanha a transição .site-intro.is-leaving (240 ms)
  var START_TIMEOUT_MS = 5000; // espera o preload no máximo isso
  var ABSOLUTE_TIMEOUT_MS = 15000; // trava de segurança
  var BASE = "assets/intro/ezgif-frame-";

  function pad(n) {
    return String(n).padStart(3, "0");
  }

  var section = document.querySelector(".site-intro");
  var page = document.querySelector(".page");
  if (!section || !page) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    section.remove();
    return;
  }

  var canvas = document.getElementById("introCanvas");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var skipButton = section.querySelector(".site-intro-skip");

  var closed = false;
  var frames = [];

  function closeIntro() {
    if (closed) return;
    closed = true;
    section.classList.add("is-leaving");
    page.removeAttribute("inert");
    window.setTimeout(function () {
      if (section.parentNode) section.parentNode.removeChild(section);
      var hero = page.querySelector(".hero");
      if (hero) {
        hero.classList.add("is-entering");
        window.setTimeout(function () { hero.classList.remove("is-entering"); }, 380);
      }
      frames = []; // libera os frames da memória
    }, LEAVE_MS);
  }
  window.setTimeout(closeIntro, ABSOLUTE_TIMEOUT_MS);
  if (skipButton) skipButton.addEventListener("click", closeIntro);

  if (!canvas || !ctx) {
    closeIntro();
    return;
  }

  section.hidden = false;
  page.setAttribute("inert", "");

  var loaded = 0;
  var resolved = 0;
  var started = false;
  var maxLoaded = 0;

  function draw(i) {
    var img = frames[i];
    if (!img) return false;
    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return true;
    } catch (e) {
      return false;
    }
  }

  function play() {
    if (started) return;
    started = true;

    if (loaded === 0) {
      closeIntro(); // nada carregou: fundo rosé + libera o site
      return;
    }

    var frameInterval = 1000 / FPS;
    var startTime = null;

    function tick(now) {
      if (closed) return;
      if (startTime === null) startTime = now;
      var idx = Math.floor((now - startTime) / frameInterval) + 1;

      if (idx > TOTAL_FRAMES) {
        if (!draw(TOTAL_FRAMES)) draw(maxLoaded); // frame 30 ou o último disponível
        section.classList.add("intro-shine");
        window.setTimeout(closeIntro, HOLD_LAST_MS);
        return;
      }
      // Frame ainda não carregou? Mantém o anterior (canvas não limpa → sem flash)
      if (!draw(idx) && idx > 1) draw(idx - 1);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function maybeStart() {
    if (started) return;
    // Começa cedo (frame 1 + buffer) para a abertura aparecer imediatamente
    if (frames[1] && loaded >= 6) play();
    else if (resolved >= TOTAL_FRAMES) play();
  }

  for (var i = 1; i <= TOTAL_FRAMES; i++) {
    (function (n) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () {
        frames[n] = img;
        loaded++;
        resolved++;
        if (n > maxLoaded) maxLoaded = n;
        if (n === 1) draw(1); // primeira tinta o quanto antes (fundo já é rosé)
        maybeStart();
      };
      img.onerror = function () {
        resolved++;
        maybeStart(); // frame com falha: pula, nunca trava
      };
      img.src = BASE + pad(n) + ".jpg";
    })(i);
  }

  window.setTimeout(function () {
    if (!started) play();
  }, START_TIMEOUT_MS);
})();
