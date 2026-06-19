(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero-slider");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }
    }

    var searchInput = document.querySelector("[data-search-input]");
    var typeInput = document.querySelector("[data-type-filter]");
    var regionInput = document.querySelector("[data-region-filter]");
    var yearInput = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var noResults = document.querySelector(".no-results");

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = normalize(searchInput ? searchInput.value : "");
      var type = normalize(typeInput ? typeInput.value : "");
      var region = normalize(regionInput ? regionInput.value : "");
      var year = normalize(yearInput ? yearInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-keywords")
        ].join(" "));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || normalize(card.getAttribute("data-type")) === type;
        var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
        var matchYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
        var show = matchQuery && matchType && matchRegion && matchYear;

        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("visible", visible === 0);
      }
    }

    [searchInput, typeInput, regionInput, yearInput].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
