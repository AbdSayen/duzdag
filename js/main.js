let currentLanguage = 'ru';
let currentTheme = 'light';
let currentTestimonial = 1;
const totalTestimonials = 3;
let isFirstVisit = true;

document.addEventListener('DOMContentLoaded', function () {
    initLanguageSelection();
    initTheme();
    initTestimonials();
    initReviews();
    initMobileMenu();
    initForm();
    checkFirstVisit();
});

function checkFirstVisit() {
    const hasVisited = localStorage.getItem('duzdag_visited');

    if (!hasVisited) {
        isFirstVisit = true;
        const languageModal = document.getElementById('languageModal');
        languageModal.classList.add('active');

        localStorage.setItem('duzdag_visited', 'true');
    } else {
        const savedLanguage = localStorage.getItem('duzdag_language') || 'ru';
        changeLanguage(savedLanguage);
        document.getElementById('languageSelect').value = savedLanguage;
    }
}

function initLanguageSelection() {
    const languageOptions = document.getElementById('languageOptions');
    const languageSelect = document.getElementById('languageSelect');
    const languageSelectMobile = document.getElementById('languageSelectMobile');

    for (const langCode in translations) {
        const lang = translations[langCode];

        const optionElement = document.createElement('div');
        optionElement.className = 'language-option';
        optionElement.setAttribute('data-lang', langCode);
        optionElement.innerHTML = `
                    <div class="language-flag">${lang.flag}</div>
                    <div>${lang.languageName}</div>
                `;

        optionElement.addEventListener('click', function () {
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.remove('active');
            });

            this.classList.add('active');

            currentLanguage = langCode;

            languageSelect.value = langCode;
        });

        languageOptions.appendChild(optionElement);

        const selectOption = document.createElement('option');
        selectOption.value = langCode;
        selectOption.textContent = `${lang.flag} ${lang.languageName}`;
        languageSelect.appendChild(selectOption);
        if (languageSelectMobile) {
            const mobileOpt = selectOption.cloneNode(true);
            languageSelectMobile.appendChild(mobileOpt);
        }
    }

    document.querySelector('.language-option[data-lang="ru"]').classList.add('active');

    document.getElementById('confirmLanguage').addEventListener('click', function () {
        if (isFirstVisit) {
            changeLanguage(currentLanguage);
            document.getElementById('languageModal').classList.remove('active');
            isFirstVisit = false;
        }
    });

    languageSelect.addEventListener('change', function () {
        changeLanguage(this.value);
    });
    if (languageSelectMobile) {
        languageSelectMobile.addEventListener('change', function () {
            changeLanguage(this.value);
            // keep desktop select in sync
            if (languageSelect) languageSelect.value = this.value;
        });
    }
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    const lang = translations[langCode];

    for (const key in lang) {
        const element = document.getElementById(key);
        if (element) {
            if (key.includes('Text') && lang[key].includes('<strong>')) {
                element.innerHTML = lang[key];
            } else {
                element.textContent = lang[key];
            }
        }
    }

    document.getElementById('languageSelect').value = langCode;

    localStorage.setItem('duzdag_language', langCode);

    document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.remove('active');
    });

    const activeOption = document.querySelector(`.language-option[data-lang="${langCode}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('duzdag_theme') || 'light';
    currentTheme = savedTheme;

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    }

    document.getElementById('themeToggle').addEventListener('click', function () {
        if (currentTheme === 'light') {
            document.body.setAttribute('data-theme', 'dark');
            this.innerHTML = '<i class="fas fa-sun"></i>';
            currentTheme = 'dark';
        } else {
            document.body.setAttribute('data-theme', 'light');
            this.innerHTML = '<i class="fas fa-moon"></i>';
            currentTheme = 'light';
        }

        localStorage.setItem('duzdag_theme', currentTheme);
    });
}

function initTestimonials() {
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const indicators = document.querySelectorAll('.testimonial-indicator');

    const testimonialElements = document.querySelectorAll('.testimonial');
    if (!testimonialElements || testimonialElements.length === 0) return;

    function showTestimonial(index) {
        document.querySelectorAll('.testimonial').forEach(testimonial => {
            testimonial.classList.remove('active');
        });

        document.getElementById(`testimonial${index}`).classList.add('active');

        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (parseInt(indicator.getAttribute('data-testimonial')) === index) {
                indicator.classList.add('active');
            }
        });

        prevBtn.disabled = index === 1;
        nextBtn.disabled = index === totalTestimonials;

        currentTestimonial = index;
    }

    prevBtn.addEventListener('click', function () {
        if (currentTestimonial > 1) {
            showTestimonial(currentTestimonial - 1);
        }
    });

    nextBtn.addEventListener('click', function () {
        if (currentTestimonial < totalTestimonials) {
            showTestimonial(currentTestimonial + 1);
        }
    });

    indicators.forEach(indicator => {
        indicator.addEventListener('click', function () {
            const testimonialIndex = parseInt(this.getAttribute('data-testimonial'));
            showTestimonial(testimonialIndex);
        });
    });

    setInterval(() => {
        let nextIndex = currentTestimonial + 1;
        if (nextIndex > totalTestimonials) nextIndex = 1;
        showTestimonial(nextIndex);
    }, 8000);

    showTestimonial(1);
}

const REVIEWS_KEY = 'duzdag_reviews';

function initReviews() {
    renderReviews();
    initReviewModal();
    initReviewForm();
}

function getStoredReviews() {
    try {
        const raw = localStorage.getItem(REVIEWS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function storeReviews(list) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
}

function defaultReviews() {
    return [
        { name: 'Сергей Иванов', rating: 5, text: 'После 10 дней лечения в Дуздаге моя астма отступила. Дышу легко, почти забыл про ингалятор. Удивительное место с невероятной энергетикой!', date: '15 марта 2023' },
        { name: 'Елена Петрова', rating: 4, text: 'Приезжаю сюда уже третий год подряд. После курса лечение эффект держится почти год. Чистейший воздух, тишина и покой - лучшее лекарство от городского стресса.', date: '2 февраля 2023' },
        { name: 'Елена Петрова', rating: 4, text: 'Приезжаю сюда уже третий год подряд. После курса лечение эффект держится почти год. Чистейший воздух, тишина и покой - лучшее лекарство от городского стресса.', date: '2 февраля 2023' },
        { name: 'Елена Петрова', rating: 4, text: 'Приезжаю сюда уже третий год подряд. После курса лечение эффект держится почти год. Чистейший воздух, тишина и покой - лучшее лекарство от городского стресса.', date: '2 февраля 2023' },
        { name: 'Елена Петрова', rating: 4, text: 'Приезжаю сюда уже третий год подряд. После курса лечение эффект держится почти год. Чистейший воздух, тишина и покой - лучшее лекарство от городского стресса.', date: '2 февраля 2023' },
        { name: 'Елена Петрова', rating: 4, text: 'Приезжаю сюда уже третий год подряд. После курса лечение эффект держится почти год. Чистейший воздух, тишина и покой - лучшее лекарство от городского стресса.', date: '2 февраля 2023' },
        { name: 'Алиева Марина', rating: 5, text: 'У моего сына был хронический бронхит, постоянные простуды. После лечения в Дуздаге он стал гораздо меньше болеть, укрепился иммунитет. Очень благодарны врачам центра!', date: '10 января 2023' }
    ];
}

function renderReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    const reviews = defaultReviews();

    container.innerHTML = '';
    reviews.slice().reverse().forEach(review => {
        const card = document.createElement('article');
        card.className = 'review-card slide';

        const ratingStars = Array.from({ length: 5 }, (_, i) => i < review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>').join('');

        const photoHtml = review.photo ? `<img class="review-photo" src="${review.photo}" alt="photo" />` : '';

        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">${(review.name && review.name[0]) || 'U'}</div>
                <div class="review-meta">
                    <strong class="review-name">${escapeHtml(review.name)}</strong>
                    <div class="review-rating">${ratingStars}</div>
                </div>
            </div>
            <div class="review-body">
                <p class="review-text">${escapeHtml(review.text)}</p>
                ${photoHtml}
                <div class="review-date">${escapeHtml(review.date || '')}</div>
            </div>
        `;

        container.appendChild(card);
    });

    setupReviewsSlider();
}

function setupReviewsSlider() {
    const track = document.getElementById('reviewsContainer');
    if (!track) return;

    const prev = document.getElementById('prevReview');
    const next = document.getElementById('nextReview');

    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    let currentIndex = 0;

    function slidesPerView() {
        const w = window.innerWidth;
        if (w >= 1000) return 3;
        if (w >= 700) return 2;
        return 1;
    }

    function goTo(index) {
        const spv = slidesPerView();
        const maxIndex = Math.max(0, slides.length - spv);
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        currentIndex = index;

        const rect = slides[0].getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const slideWidth = rect.width + gap;
        const offset = currentIndex * slideWidth;
        track.style.transform = `translateX(-${offset}px)`;

        if (prev) prev.disabled = currentIndex === 0;
        if (next) next.disabled = (currentIndex + spv) >= slides.length;
    }

    if (prev) prev.addEventListener('click', () => goTo(currentIndex - 1));
    if (next) next.addEventListener('click', () => goTo(currentIndex + 1));
    // mobile controls (under widget on small screens)
    const prevMobile = document.getElementById('prevReviewMobile');
    const nextMobile = document.getElementById('nextReviewMobile');
    if (prevMobile) prevMobile.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextMobile) nextMobile.addEventListener('click', () => goTo(currentIndex + 1));

    let startX = 0, isDown = false;
    const viewport = track.closest('.slides-viewport') || track.parentElement;
    let baseOffset = 0;

    function computeSlideWidth() {
        const rect = slides[0].getBoundingClientRect();
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return rect.width + gap;
    }

    function setTrackOffsetPx(px) {
        track.style.transform = `translateX(-${px}px)`;
    }

    function onStart(clientX, pointerId) {
        isDown = true;
        startX = clientX;
        baseOffset = currentIndex * computeSlideWidth();
        try { if (pointerId != null && viewport.setPointerCapture) viewport.setPointerCapture(pointerId); } catch (err) {}
        if (viewport) viewport.style.cursor = 'grabbing';
    }

    function onMove(clientX) {
        if (!isDown) return;
        const dx = clientX - startX;
        setTrackOffsetPx(baseOffset - dx);
    }

    function onEnd(clientX) {
        if (!isDown) return;
        isDown = false;
        if (viewport) viewport.style.cursor = 'grab';
        const dx = clientX - startX;
        const slideW = computeSlideWidth();
        const threshold = Math.min(60, slideW * 0.2);
        if (Math.abs(dx) > threshold) {
            dx < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
        } else {
            // snap back
            setTrackOffsetPx(currentIndex * slideW);
        }
    }

    // Pointer events
    viewport.addEventListener('pointerdown', (e) => { onStart(e.clientX, e.pointerId); });
    viewport.addEventListener('pointermove', (e) => { if (!isDown) return; e.preventDefault(); onMove(e.clientX); });
    viewport.addEventListener('pointerup', (e) => { onEnd(e.clientX); });
    viewport.addEventListener('pointercancel', () => { isDown = false; if (viewport) viewport.style.cursor = 'grab'; });

    // Touch fallback (ensure passive:false to allow preventDefault)
    viewport.addEventListener('touchstart', (e) => { if (!e.touches || e.touches.length === 0) return; onStart(e.touches[0].clientX); }, { passive: false });
    viewport.addEventListener('touchmove', (e) => { if (!isDown) return; e.preventDefault(); onMove(e.touches[0].clientX); }, { passive: false });
    viewport.addEventListener('touchend', (e) => { const t = (e.changedTouches && e.changedTouches[0]) || null; onEnd(t ? t.clientX : 0); }, { passive: false });

    window.addEventListener('resize', () => { setTimeout(() => goTo(currentIndex), 80); });

    goTo(0);
}

function initReviewForm() {
    const form = document.getElementById('reviewForm');
    const msg = document.getElementById('reviewMessage');
    if (!form) return;

    const photoInput = document.getElementById('reviewPhoto');
    const photoPreviewWrapper = document.getElementById('reviewPhotoPreviewWrapper');
    const photoPreview = document.getElementById('reviewPhotoPreview');

    if (photoInput) {
        photoInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) {
                if (photoPreviewWrapper) photoPreviewWrapper.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                if (photoPreview) photoPreview.src = e.target.result;
                if (photoPreviewWrapper) photoPreviewWrapper.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('reviewerName').value.trim();
        const rating = parseInt(document.getElementById('reviewRating').value) || 5;
        const text = document.getElementById('reviewText').value.trim();

        if (!name || !text) {
            showReviewMessage(getTranslation('reviewError'), true);
            return;
        }

        let photoData = null;
        if (photoInput && photoInput.files && photoInput.files[0]) {
            photoData = await fileToDataUrl(photoInput.files[0]);
        }

        const date = new Date();
        const dateStr = date.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const review = { name, rating, text, date: dateStr, photo: photoData };

        try {
            await saveReviewToDB(review);
            renderReviews();
            form.reset();
            if (photoPreviewWrapper) photoPreviewWrapper.style.display = 'none';
            showReviewMessage(getTranslation('reviewSuccess'));
            const modal = document.getElementById('reviewModal');
            if (modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); }
        } catch (err) {
            showReviewMessage('Ошибка сохранения', true);
        }
    });

    function showReviewMessage(text, isError = false) {
        if (!msg) return;
        msg.style.display = 'block';
        msg.textContent = text;
        msg.style.color = isError ? 'crimson' : 'green';
        setTimeout(() => { msg.style.display = 'none'; }, 3500);
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function initReviewModal() {
    const openBtn = document.getElementById('addReviewButton');
    const modal = document.getElementById('reviewModal');
    const closeBtn = document.getElementById('closeReviewModal');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
}

function saveReviewToDB(review) {
    return new Promise((resolve) => {
        const list = getStoredReviews() || defaultReviews();
        list.push(review);
        storeReviews(list);
        setTimeout(() => resolve(true), 150);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>\"']/g, function (tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return charsToReplace[tag] || tag;
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    mobileMenuBtn.addEventListener('click', () => {
        const opened = navLinks.classList.toggle('active');
        mobileMenuBtn.innerHTML = opened
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // close menu when a nav link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // wire mobile panel controls (if present)
    const mobileThemeBtn = document.getElementById('themeToggleMobile');
    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', () => {
            const orig = document.getElementById('themeToggle');
            if (orig) orig.click();
        });
    }

    const mobileLang = document.getElementById('languageSelectMobile');
    if (mobileLang) {
        mobileLang.addEventListener('change', function () {
            changeLanguage(this.value);
            const orig = document.getElementById('languageSelect');
            if (orig) orig.value = this.value;
        });
    }
}

function initForm() {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            alert(getTranslation('formError'));
            return;
        }

        alert(getTranslation('formSuccess'));
        contactForm.reset();
    });
}

function getTranslation(key) {
    const lang = translations[currentLanguage];
    const defaultLang = translations['ru'];
    return lang[key] || defaultLang[key] || '';
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});