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
})();
