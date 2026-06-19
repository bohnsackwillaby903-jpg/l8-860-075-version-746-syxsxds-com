(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    if (!inputs.length || !cards.length) {
      return;
    }
    function apply(value) {
      var q = normalize(value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        card.classList.toggle("is-filtered-out", q && haystack.indexOf(q) === -1);
      });
    }
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        apply(input.value);
      });
    });
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial) {
      inputs.forEach(function (input) {
        input.value = initial;
      });
      apply(initial);
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-filter-key") || "";
        inputs.forEach(function (input) {
          input.value = key;
        });
        apply(key);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
}());
