/* =========================================================
   Invitación 4° cumpleaños de Isaac — Cars
   Vanilla JS: cuenta regresiva + animación al hacer scroll
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Cuenta regresiva ---------- */
  // Fecha objetivo de la fiesta (hora local del dispositivo)
  var TARGET = new Date('2026-10-24T13:00:00');

  var el = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds')
  };
  var grid = document.getElementById('countdown');
  var doneEl = document.getElementById('countdown-done');

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function tick() {
    var diff = TARGET.getTime() - Date.now();

    if (diff <= 0) {
      clearInterval(timer);
      if (grid) grid.hidden = true;
      if (doneEl) doneEl.hidden = false;
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    el.days.textContent = pad(Math.floor(totalSeconds / 86400));
    el.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    el.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    el.seconds.textContent = pad(totalSeconds % 60);
  }

  var timer;
  if (el.days) {
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------- Escena de largada (hero) — en loop ---------- */
  var hero = document.querySelector('.hero');
  var car = document.getElementById('hero-car');
  var lights = Array.prototype.slice.call(document.querySelectorAll('.startlight__light'));

  if (hero && car && lights.length === 4) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      // Sin animación: verde encendido, auto y textos visibles
      car.classList.remove('is-hidden');
      lights[3].classList.add('is-on');
      hero.classList.add('is-reduced');
    } else {
      var later = function (fn, ms) { window.setTimeout(fn, ms); };

      var resetScene = function () {
        hero.classList.remove('is-launching');
        lights.forEach(function (light) { light.classList.remove('is-on'); });
        car.classList.add('is-hidden');
      };

      var cycle = function () {
        // 0s: parrilla lista (auto oculto, semáforo apagado)
        resetScene();

        // El auto aparece en la línea de largada
        later(function () { car.classList.remove('is-hidden'); }, 250);

        // Luces rojas de a una
        [900, 1500, 2100].forEach(function (delay, i) {
          later(function () { lights[i].classList.add('is-on'); }, delay);
        });

        // Se apagan las rojas
        later(function () {
          lights[0].classList.remove('is-on');
          lights[1].classList.remove('is-on');
          lights[2].classList.remove('is-on');
        }, 2750);

        // ¡Verde! y sale el auto
        later(function () {
          lights[3].classList.add('is-on');
          hero.classList.add('is-launching');
        }, 2900);

        // El auto termina su recorrido (2.4s) y sale de cuadro
        later(function () { car.classList.add('is-hidden'); }, 5400);
        later(function () { lights[3].classList.remove('is-on'); }, 5500);

        // Desde la 2ª vuelta: sin flash ni pop repetidos
        later(function () { hero.classList.add('is-looped'); }, 5800);

        // Siguiente vuelta
        later(cycle, 7600);
      };

      cycle();
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    // Fallback: mostrar todo si el navegador no soporta IntersectionObserver
    reveals.forEach(function (node) {
      node.classList.add('is-visible');
    });
  }

  /* ---------- Música de fondo (con botón de silencio) ---------- */
  var music = document.getElementById('bg-music');
  var musicBtn = document.getElementById('music-toggle');

  if (music && musicBtn) {
    var VOLUME = 0.5;
    var fadeId = null;

    var savePref = function (muted) {
      try { window.localStorage.setItem('isaac-music-muted', muted ? '1' : '0'); } catch (e) { /* modo privado */ }
    };

    var setPlaying = function (playing) {
      musicBtn.classList.toggle('is-playing', playing);
      musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      musicBtn.setAttribute('aria-label', playing ? 'Silenciar música' : 'Reproducir música');
    };

    // Sube/baja el volumen de a poco (evita el arranque brusco)
    var fadeTo = function (target, ms) {
      if (fadeId) { window.clearInterval(fadeId); fadeId = null; }
      var steps = Math.max(1, Math.round(ms / 50));
      var from = music.volume;
      var delta = (target - from) / steps;
      var i = 0;
      fadeId = window.setInterval(function () {
        i++;
        music.volume = Math.min(1, Math.max(0, from + delta * i));
        if (i >= steps) { window.clearInterval(fadeId); fadeId = null; }
      }, 50);
    };

    var play = function () {
      music.volume = 0;
      var promise = music.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () { fadeTo(VOLUME, 1200); setPlaying(true); })
          .catch(function () { setPlaying(false); });
      } else {
        fadeTo(VOLUME, 1200);
        setPlaying(true);
      }
    };

    var pause = function () {
      fadeTo(0, 350);
      window.setTimeout(function () { music.pause(); }, 370);
      setPlaying(false);
    };

    // Los navegadores bloquean el autoplay con sonido: arrancamos con el primer gesto.
    var kick = function () {
      detachKick();
      play();
    };
    var detachKick = function () {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
      window.removeEventListener('touchstart', kick);
      window.removeEventListener('scroll', kick);
    };
    var attachKick = function () {
      window.addEventListener('pointerdown', kick);
      window.addEventListener('keydown', kick);
      window.addEventListener('touchstart', kick);
      window.addEventListener('scroll', kick, { passive: true });
    };

    musicBtn.addEventListener('click', function () {
      detachKick(); // si ya toca el botón, no hacen falta los atajos de gesto
      if (music.paused) {
        savePref(false);
        play();
      } else {
        savePref(true);
        pause();
      }
    });

    // ¿La dejó silenciada en la visita anterior?
    var muted = null;
    try { muted = window.localStorage.getItem('isaac-music-muted'); } catch (e) { /* modo privado */ }

    if (muted === '1') {
      setPlaying(false);
    } else {
      music.volume = 0;
      var attempt = music.play();
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () { fadeTo(VOLUME, 1200); setPlaying(true); })
          .catch(function () { setPlaying(false); attachKick(); });
      } else {
        fadeTo(VOLUME, 1200);
        setPlaying(true);
      }
    }
  }
})();
