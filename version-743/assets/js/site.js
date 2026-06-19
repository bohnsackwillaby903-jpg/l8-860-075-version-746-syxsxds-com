(() => {
  const root = document.body.dataset.root || ".";

  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const target = `${root}/search.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      window.location.href = target;
    });
  });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", () => {
      mobilePanel.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    const activate = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => activate(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => activate(current + 1), 5600);
    }
  }

  const filterInput = document.querySelector("[data-filter-input]");
  const filterList = document.querySelector("[data-filter-list]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (filterInput && filterList) {
    const cards = Array.from(filterList.querySelectorAll("[data-movie-card]"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    const applyFilter = () => {
      const query = filterInput.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const haystack = card.dataset.search || card.textContent.toLowerCase();
        const matched = !query || haystack.includes(query);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("visible", visible === 0);
      }
    };

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }
})();
