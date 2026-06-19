(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = qs('.mobile-toggle');
        var nav = qs('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
            toggle.textContent = opened ? '×' : '☰';
        });
    }

    function setupHero() {
        var slides = qsa('.hero-slide');
        if (slides.length < 2) {
            return;
        }
        var dots = qsa('.hero-dot');
        var prev = qs('.hero-prev');
        var next = qs('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            slides[index].classList.remove('is-active');
            if (dots[index]) {
                dots[index].classList.remove('is-active');
            }
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            if (dots[index]) {
                dots[index].classList.add('is-active');
            }
        }

        function start() {
            stop();
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
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        var hero = qs('.hero-carousel');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        start();
    }

    function setupFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            var input = qs('[data-filter-input]', scope);
            var list = qs('.searchable-list', scope.parentElement) || qs('.searchable-list', scope) || scope.parentElement;
            var items = qsa('.movie-card, .rank-row', list);
            var empty = qs('.no-results', scope);
            if (!input || !items.length) {
                return;
            }

            function applyFilter() {
                var value = normalize(input.value);
                var visible = 0;
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute('data-title'),
                        item.getAttribute('data-meta'),
                        item.textContent
                    ].join(' '));
                    var matched = !value || haystack.indexOf(value) !== -1;
                    item.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            input.addEventListener('input', applyFilter);
            qsa('[data-filter-value]', scope).forEach(function (button) {
                button.addEventListener('click', function () {
                    input.value = button.getAttribute('data-filter-value') || '';
                    applyFilter();
                    input.focus();
                });
            });

            var params = new URLSearchParams(window.location.search);
            if (params.has('q')) {
                input.value = params.get('q');
                applyFilter();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
}());
