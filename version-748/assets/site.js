document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", () => {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = 0;
        let timer = null;

        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        const restart = () => {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(() => show(active + 1), 5200);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(active + 1);
                restart();
            });
        }

        hero.addEventListener("mouseenter", () => timer && clearInterval(timer));
        hero.addEventListener("mouseleave", restart);
        restart();
    }

    const wireSearch = (input) => {
        const scope = input.closest("main") || document;
        const cards = Array.from(scope.querySelectorAll("[data-card]"));

        input.addEventListener("input", () => {
            const value = input.value.trim().toLowerCase();
            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.category,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.region,
                    card.textContent
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", value && !haystack.includes(value));
            });
        });
    };

    document.querySelectorAll("[data-page-search], [data-global-search]").forEach(wireSearch);
});
