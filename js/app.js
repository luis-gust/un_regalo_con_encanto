(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var yearEl = document.getElementById("year");

  function onScroll() {
    if (window.scrollY > 30) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function toggleNav() {
    var open = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-locked", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }

  function closeNav() {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  toggle.addEventListener("click", toggleNav);
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var carousel = document.getElementById("carousel");
  if (carousel) {
    var carouselItems = carousel.querySelectorAll(".carousel__item");
    var prevBtn = document.getElementById("carousel-prev");
    var nextBtn = document.getElementById("carousel-next");

    function updateCarousel() {
      var rect = carousel.getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      carouselItems.forEach(function (item) {
        var itemRect = item.getBoundingClientRect();
        var itemCenter = itemRect.left + itemRect.width / 2;
        var dist = Math.abs(itemCenter - center) / (itemRect.width / 2 + 60);
        var scale = Math.max(1 - dist * 0.22, 0.82);
        var opacity = Math.max(1 - dist * 0.7, 0.4);
        item.style.transform = "scale(" + scale.toFixed(3) + ")";
        item.style.opacity = opacity.toFixed(3);
      });
    }

    function carouselStep(dir) {
      if (carouselItems.length < 2) return;
      var step = carouselItems[1].offsetLeft - carouselItems[0].offsetLeft;
      carousel.scrollBy({ left: step * dir, behavior: "smooth" });
    }

    var autoplayTimer = null;
    var resumeTimer = null;
    var autoplayPaused = false;
    var hovered = false;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(function () {
        if (autoplayPaused || document.hidden || hovered) return;
        var maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft >= maxScroll - 4) {
          carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselStep(1);
        }
      }, 3500);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function pauseAutoplay() {
      autoplayPaused = true;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        if (!hovered && !document.hidden) {
          autoplayPaused = false;
        }
      }, 6500);
    }

    function resumeAutoplay() {
      autoplayPaused = false;
    }

    if (!reducedMotion) {
      startAutoplay();
    }

    carousel.addEventListener("mouseenter", function () {
      hovered = true;
      autoplayPaused = true;
    });

    carousel.addEventListener("mouseleave", function () {
      hovered = false;
      autoplayPaused = false;
    });

    ["wheel", "pointerdown", "touchstart", "keydown"].forEach(function (eventName) {
      carousel.addEventListener(eventName, pauseAutoplay, { passive: true });
    });

    window.addEventListener("blur", pauseAutoplay);
    window.addEventListener("focus", function () {
      if (!hovered) {
        autoplayPaused = false;
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        autoplayPaused = true;
      } else {
        autoplayPaused = false;
      }
    });

    carousel.addEventListener("scroll", updateCarousel, { passive: true });
    window.addEventListener("resize", updateCarousel);

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        pauseAutoplay();
        carouselStep(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        pauseAutoplay();
        carouselStep(1);
      });
    }

    if (reducedMotion) {
      carouselItems.forEach(function (item) {
        item.style.transition = "none";
      });
    }

    updateCarousel();
  }
})();