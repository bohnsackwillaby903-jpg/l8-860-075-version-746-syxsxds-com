(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-search]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var searchableItems = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function itemText(item) {
    return normalize([
      item.getAttribute('data-title'),
      item.getAttribute('data-region'),
      item.getAttribute('data-year'),
      item.getAttribute('data-tags')
    ].join(' '));
  }

  function applyFilters() {
    var keyword = searchInput ? normalize(searchInput.value) : '';

    searchableItems.forEach(function (item) {
      var matchKeyword = !keyword || itemText(item).indexOf(keyword) !== -1;
      var matchGroup = activeFilter === 'all' || item.getAttribute('data-group') === activeFilter;
      item.classList.toggle('is-hidden', !(matchKeyword && matchGroup));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (other) {
        other.classList.toggle('is-active', other === button);
      });
      applyFilters();
    });
  });

  applyFilters();
})();
