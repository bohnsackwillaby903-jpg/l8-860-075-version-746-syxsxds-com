(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    var toggle = select(".menu-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
    selectAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
      });
    });
  }

  function bindHero() {
    var root = select("[data-hero]");
    if (!root) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        stop();
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindGlobalSearch() {
    selectAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = select("input[name='q']", form) || select("input", form);
        var query = input ? input.value.trim() : "";
        var target = "./movies.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function bindFiltering() {
    var list = select("[data-filter-list]");
    var search = select("[data-page-search]");
    var chips = selectAll("[data-filter]");
    if (!list) {
      return;
    }
    var cards = selectAll(".movie-card", list);
    var activeFilter = "";
    function applyFilter() {
      var query = normalize(search ? search.value : "");
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search") || card.textContent);
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
      });
    }
    if (search) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        search.value = initial;
      }
      search.addEventListener("input", applyFilter);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "";
        applyFilter();
      });
    });
    applyFilter();
  }

  window.initMoviePlayer = function (videoSelector, buttonSelector, source) {
    var video = select(videoSelector);
    var button = select(buttonSelector);
    if (!video || !button || !source) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;
    function attachSource() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }
    function playMovie() {
      attachSource();
      button.classList.add("is-hidden");
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    button.addEventListener("click", playMovie);
    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindHero();
    bindGlobalSearch();
    bindFiltering();
  });
})();
