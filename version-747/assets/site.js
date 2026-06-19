(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function restartHeroTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHeroSlide(index);
        restartHeroTimer();
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showHeroSlide(heroIndex - 1);
        restartHeroTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showHeroSlide(heroIndex + 1);
        restartHeroTimer();
      });
    }

    showHeroSlide(0);
    restartHeroTimer();
  }

  var toolbar = document.querySelector('[data-catalog-toolbar]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCatalogFilters() {
    if (!cards.length) {
      return;
    }

    var searchInput = document.querySelector('.catalog-search');
    var query = normalizeText(searchInput ? searchInput.value : '');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.catalog-filter'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalizeText(card.getAttribute('data-search'));
      var matched = !query || text.indexOf(query) !== -1;

      filters.forEach(function (filter) {
        var field = filter.getAttribute('data-filter-field');
        var value = filter.value;

        if (!value || !field) {
          return;
        }

        if ((card.getAttribute('data-' + field) || '') !== value) {
          matched = false;
        }
      });

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (toolbar && cards.length) {
    var searchInput = document.querySelector('.catalog-search');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyCatalogFilters);
    }

    Array.prototype.slice.call(document.querySelectorAll('.catalog-filter')).forEach(function (filter) {
      filter.addEventListener('change', applyCatalogFilters);
    });

    applyCatalogFilters();
  }

  function getHlsClass() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return Promise.resolve(null);
  }

  window.initMoviePlayer = function (config) {
    function bind() {
      var video = document.getElementById(config.videoId);
      var cover = document.getElementById(config.coverId);
      var triggers = (config.triggerIds || []).map(function (id) {
        return document.getElementById(id);
      }).filter(Boolean);
      var streamUrl = config.streamUrl;
      var prepared = false;
      var hlsInstance = null;

      if (!video || !streamUrl) {
        return;
      }

      function prepareStream() {
        if (prepared) {
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          prepared = true;
          return Promise.resolve();
        }

        return getHlsClass().then(function (HlsClass) {
          if (HlsClass && HlsClass.isSupported()) {
            hlsInstance = new HlsClass({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 60
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            prepared = true;
            return;
          }

          video.src = streamUrl;
          prepared = true;
        });
      }

      function startPlayback() {
        if (cover) {
          cover.classList.add('is-hidden');
        }

        prepareStream().then(function () {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        });
      }

      prepareStream();

      triggers.forEach(function (trigger) {
        trigger.addEventListener('click', startPlayback);
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bind);
    } else {
      bind();
    }
  };
})();
