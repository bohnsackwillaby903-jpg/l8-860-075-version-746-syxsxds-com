function initNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    const search = document.querySelector('.header-search');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        if (search) {
            search.classList.toggle('is-open');
        }
    });
}

function initImageFallbacks() {
    document.querySelectorAll('[data-cover-image]').forEach((image) => {
        image.addEventListener('error', () => {
            const holder = image.closest('.movie-cover, .hero-backdrop, .hero-poster, .category-tile, .category-panel-media, .ranking-cover, .poster-panel, .detail-backdrop');
            if (holder) {
                holder.classList.add('image-missing');
            }
            image.remove();
        }, { once: true });
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const next = carousel.querySelector('[data-hero-next]');
    const prev = carousel.querySelector('[data-hero-prev]');
    let activeIndex = 0;
    let timer = null;

    function setActive(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => setActive(activeIndex + 1), 6200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActive(index);
            start();
        });
    });

    if (next) {
        next.addEventListener('click', () => {
            setActive(activeIndex + 1);
            start();
        });
    }

    if (prev) {
        prev.addEventListener('click', () => {
            setActive(activeIndex - 1);
            start();
        });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    setActive(0);
    start();
}

function initLocalFilters() {
    const grid = document.querySelector('[data-filter-grid]');
    const input = document.querySelector('[data-filter-input]');
    const genre = document.querySelector('[data-filter-genre]');
    const year = document.querySelector('[data-filter-year]');

    if (!grid || (!input && !genre && !year)) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        const keyword = normalize(input ? input.value : '');
        const genreValue = normalize(genre ? genre.value : '');
        const yearValue = normalize(year ? year.value : '');

        cards.forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.region,
                card.textContent,
            ].join(' '));
            const matchesKeyword = !keyword || text.includes(keyword);
            const matchesGenre = !genreValue || normalize(card.dataset.genre).includes(genreValue) || text.includes(genreValue);
            const matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
            card.hidden = !(matchesKeyword && matchesGenre && matchesYear);
        });
    }

    [input, genre, year].filter(Boolean).forEach((control) => {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
    });

    applyFilter();
}

function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    const categoryName = categoryNameMap[movie.primaryCategory] || '更多片库';

    return `
<a class="movie-card" href="${movie.detailUrl}" data-movie-card data-title="${escapeHtml(movie.title)}" data-tags="${escapeHtml((movie.tags || []).join(' '))}" data-genre="${escapeHtml(movie.genre)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}">
    <div class="movie-cover">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" data-cover-image>
        <span class="cover-badge">${escapeHtml(movie.year || '热播')}</span>
        <span class="cover-type">${escapeHtml(movie.type || categoryName)}</span>
    </div>
    <div class="movie-info">
        <div class="movie-meta-line">
            <span>${escapeHtml(categoryName)}</span>
            <span>${escapeHtml(movie.region || '精选')}</span>
        </div>
        <h3>${escapeHtml(movie.title)}</h3>
        <p>${escapeHtml(movie.oneLine || '')}</p>
        <div class="tag-row">${tags}</div>
    </div>
</a>`;
}

const categoryNameMap = {
    guochan: '国剧热播',
    rihan: '日韩精选',
    oumei: '欧美剧库',
    xuanyi: '悬疑犯罪',
    aiqing: '爱情奇幻',
    xiju: '喜剧家庭',
    dongzuo: '动作冒险',
    juqing: '剧情口碑',
    donghua: '动画专区',
    xinpian: '年度新片',
    jingdian: '经典回看',
    qita: '更多片库',
};

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function initSearchPage() {
    const root = document.querySelector('[data-search-page]');
    const results = document.querySelector('[data-search-results]');
    const hint = document.querySelector('[data-search-hint]');
    const input = document.querySelector('[data-search-input]');
    const category = document.querySelector('[data-search-category]');
    const year = document.querySelector('[data-search-year]');

    if (!root || !results || !window.MOVIES) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (input) {
        input.value = initialQuery;
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applySearch() {
        const keyword = normalize(input ? input.value : '');
        const categoryValue = normalize(category ? category.value : '');
        const yearValue = normalize(year ? year.value : '');

        const filtered = window.MOVIES.filter((movie) => {
            const text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine,
            ].join(' '));
            const matchesKeyword = !keyword || text.includes(keyword);
            const matchesCategory = !categoryValue || (movie.categories || []).includes(categoryValue);
            const matchesYear = !yearValue || normalize(movie.year) === yearValue;
            return matchesKeyword && matchesCategory && matchesYear;
        }).slice(0, 240);

        if (!keyword && !categoryValue && !yearValue) {
            results.innerHTML = window.MOVIES.slice(0, 48).map(movieCardTemplate).join('');
            if (hint) {
                hint.textContent = '展示片库精选内容，可输入关键词继续缩小范围。';
            }
        } else if (filtered.length) {
            results.innerHTML = filtered.map(movieCardTemplate).join('');
            if (hint) {
                hint.textContent = '已根据当前条件展示匹配内容。';
            }
        } else {
            results.innerHTML = '';
            if (hint) {
                hint.textContent = '当前条件暂无匹配内容，可以尝试更换关键词或清空筛选。';
            }
        }

        initImageFallbacks();
    }

    [input, category, year].filter(Boolean).forEach((control) => {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
    });

    applySearch();
}

let hlsModulePromise = null;

function loadHlsModule() {
    if (!hlsModulePromise) {
        hlsModulePromise = import('./hls-vendor-dru42stk.js');
    }
    return hlsModulePromise;
}

function initPlayers() {
    document.querySelectorAll('[data-player]').forEach((shell) => {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.player-start');
        const status = shell.querySelector('[data-player-status]');
        const source = shell.dataset.source;

        if (!video || !button || !source) {
            return;
        }

        async function startPlayback() {
            button.disabled = true;
            button.querySelector('span:last-child').textContent = '正在加载';
            if (status) {
                status.textContent = '';
            }

            try {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    const module = await loadHlsModule();
                    const Hls = module.H;
                    if (Hls && Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        shell.hlsInstance = hls;
                    } else {
                        video.src = source;
                    }
                }

                await video.play();
                shell.classList.add('is-playing');
            } catch (error) {
                button.disabled = false;
                button.querySelector('span:last-child').textContent = '点击重试';
                shell.classList.remove('is-playing');
                if (status) {
                    status.textContent = '播放器加载失败，请检查网络后重试。';
                }
                console.error(error);
            }
        }

        button.addEventListener('click', startPlayback);
    });
}

initNavigation();
initImageFallbacks();
initHeroCarousel();
initLocalFilters();
initSearchPage();
initPlayers();
