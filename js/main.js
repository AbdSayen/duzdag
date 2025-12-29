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
    initPlacePhotos();
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

        const flagDiv = document.createElement('div');
        flagDiv.className = 'language-flag';
        flagDiv.textContent = lang.flag || '';

        const nameDiv = document.createElement('div');
        nameDiv.textContent = lang.languageName || langCode;

        optionElement.appendChild(flagDiv);
        optionElement.appendChild(nameDiv);

        optionElement.addEventListener('click', function () {
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.remove('active');
            });

            this.classList.add('active');

            currentLanguage = langCode;

            if (languageSelect) languageSelect.value = langCode;
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

function sanitizeAllowStrong(str) {
    if (!str) return '';
    const escaped = escapeHtml(str);
    return escaped.replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '</strong>');
}

function stripTags(input) {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, '').trim();
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    const lang = translations[langCode];

    for (const key in lang) {
        const element = document.getElementById(key);
        if (element) {
            if (key.includes('Text') && /<\s*strong\b/i.test(lang[key] || '')) {
                element.innerHTML = sanitizeAllowStrong(lang[key]);
            } else {
                element.textContent = lang[key] || '';
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
        { name: 'Али Мамедов', rating: 5, text: 'После курса в Дуздаге дыхание стало значительно легче: сократилось число приступов, снизилась потребность в ингаляторе при нагрузках. Врачи дали понятный план реабилитации и объяснили, какие домашние упражнения поддержат эффект.', date: '2025-06-12' },
        { name: 'Нармин Гасымова', rating: 5, text: 'Чистый минеральный воздух и индивидуальные процедуры помогли улучшить сон и восстановить энергию. Особенно понравился внимательный персонал и постепенный план лечения.', date: '2024-11-03' },
        { name: 'Эльчин Ахмедов', rating: 4, text: 'Исчезла постоянная усталость и улучшилась переносимость физической нагрузки. После консультации с врачом я получил набор процедур и рекомендации по домашней поддержке здоровья.', date: '2023-09-21' },
        { name: 'Фарид Рзаев', rating: 5, text: 'Внимательное обследование, подбор процедур по состоянию и постоянный контроль результатов — это то, что выделяет центр. Результат заметен: дыхание ровнее, стало проще заниматься спортом.', date: '2022-07-18' },
        { name: 'Кямран Гусейнзаде', rating: 4, text: 'Климат и программа процедур реально помогают закрепить результат на месяцы — уехал с инструкциями по поддержке и чувством, что получил инструменты для долгосрочного улучшения.', date: '2021-05-30' },
        { name: 'Севиндж Алиева', rating: 5, text: 'Приехала с хроническим кашлем, через несколько процедур кашель значительно уменьшился, а общее состояние стало спокойнее. Для семьи это выгодное сочетание лечения и отдыха.', date: '2020-12-02' },
        { name: 'Мехмет Османов', rating: 4, text: 'Спокойное место, качественная медицинская база и грамотные специалисты — заметил прогресс в дыхательной функции и снизил частоту обострений.', date: '2019-08-14' },
        { name: 'Гиви Кавтарадзе', rating: 5, text: 'Курс помог восстановиться после длительной болезни: улучшилась выносливость, вернулось нормальное дыхание при прогулках и подъёмах по лестнице.', date: '2025-01-06' },
        { name: 'Зураб Чхеидзе', rating: 4, text: 'Душевная атмосфера и комплексные процедуры — ингаляции, дыхательная гимнастика и климатотерапия дали устойчивый эффект.', date: '2024-03-27' },
        { name: 'Арсен Бараташвили', rating: 5, text: 'Через месяц стал реже ощущать одышку при нагрузках. Отдельно отмечу консультации диетолога и физиотерапевта — это помогло закрепить результат.', date: '2023-10-10' },
        { name: 'Аслан Хаджиев', rating: 5, text: 'Приехали с ребёнком — после курса количество простуд значительно уменьшилось, повысился аппетит и общая активность.', date: '2022-02-11' },
        { name: 'Лейла Гаджиева', rating: 5, text: 'Эффект превзошёл ожидания: нормализовался сон, исчезла постоянная усталость, а самочувствие стало заметно лучше в повседневной жизни.', date: '2021-11-05' },
        { name: 'Ибрагим Мирзоев', rating: 4, text: 'Удобное расположение, продуманная программа процедур и регулярный контроль со стороны врачей — результат на лицо: реже простужаюсь и легче переношу физические нагрузки.', date: '2020-06-22' },
        { name: 'Рамазан Ахмедов', rating: 5, text: 'Понравился комплексный подход: диагностика, физиотерапия и климатотерапия. После курса улучшилась выносливость и снизилась потребность в постоянных лекарствах.', date: '2019-09-01' },
        { name: 'Диана Погосян', rating: 4, text: 'После процедур улучшился сон и снизился уровень тревожности, организм стал восстанавливаться быстрее. Замечательная команда и внимательное отношение.', date: '2025-04-19' },
        { name: 'Мадина Курбанова', rating: 5, text: 'Проходили лечение всей семьёй — детям особенно помогли дыхательные упражнения и климат. Уехали с практическими рекомендациями для поддержания результата.', date: '2024-08-08' },
        { name: 'Рашид Гулиев', rating: 5, text: 'Хорошо организованное наблюдение и последовательная программа процедур — снизил приём симптоматических препаратов и стал реже обращаться к врачу.', date: '2023-12-30' },
        { name: 'Соса Чантурия', rating: 4, text: 'Сбалансированная программа восстановления, понятные рекомендации и комфортные условия проживания — рекомендую тем, кто ищет длительный эффект.', date: '2022-04-15' },
        { name: 'Эльза Набиева', rating: 5, text: 'Дети перестали часто болеть, улучшился иммунитет и сон. Особенно полезными оказались индивидуальные сеансы и групповые упражнения.', date: '2021-03-09' },
        { name: 'Теймур Мамедов', rating: 4, text: 'Уже через неделю почувствовал разницу: дыхание ровнее, стал быстрее восстанавливаться после прогулок. Программа сбалансированная и разумно дозирована.', date: '2020-10-26' },
        { name: 'Инна Петрикова', rating: 5, text: 'Отношение персонала и эффективность процедур превзошли ожидания. Возьмёте домой не только здоровье, но и знания, как его поддерживать.', date: '2019-05-17' }
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

        // Build review card with safe DOM operations
        const header = document.createElement('div');
        header.className = 'review-header';

        const avatar = document.createElement('div');
        avatar.className = 'review-avatar';
        avatar.textContent = (review.name && review.name[0]) || 'U';

        const meta = document.createElement('div');
        meta.className = 'review-meta';

        const nameEl = document.createElement('strong');
        nameEl.className = 'review-name';
        nameEl.textContent = escapeHtml(review.name);

        const ratingEl = document.createElement('div');
        ratingEl.className = 'review-rating';
        ratingEl.innerHTML = ratingStars;

        meta.appendChild(nameEl);
        meta.appendChild(ratingEl);

        header.appendChild(avatar);
        header.appendChild(meta);

        const body = document.createElement('div');
        body.className = 'review-body';

        const textP = document.createElement('p');
        textP.className = 'review-text';
        textP.textContent = escapeHtml(review.text);

        body.appendChild(textP);

        if (review.photo) {
            const img = document.createElement('img');
            img.className = 'review-photo';
            img.src = review.photo;
            img.alt = 'photo';
            body.appendChild(img);
        }

        const dateDiv = document.createElement('div');
        dateDiv.className = 'review-date';
        dateDiv.textContent = escapeHtml(review.date || '');

        body.appendChild(dateDiv);

        card.appendChild(header);
        card.appendChild(body);

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

    if (!contactForm) return;

    // Initialize EmailJS with provided project id (public key)
    try {
        if (window.emailjs && typeof window.emailjs.init === 'function') {
            window.emailjs.init('7dhI9DXu-K4Q0gwQ6');
        }
    } catch (err) {
        console.warn('EmailJS init failed', err);
    }

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Use built-in HTML5 validation so browser shows correct field messages
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const message = document.getElementById('message').value.trim();

        const serviceId = contactForm.dataset.service || 'duzdag';
        const templateId = contactForm.dataset.template || 'template_f0d7j1i';

        if (serviceId === 'service_xxx') {
            alert('Пожалуйста, замените атрибут data-service в форме на ваш EmailJS Service ID в index.html.');
            return;
        }

        const templateParams = {
            from_name: stripTags(name),
            from_email: stripTags(email),
            from_phone: stripTags(phone),
            message: stripTags(message)
        };

        try {
            if (!window.emailjs || typeof window.emailjs.send !== 'function') {
                alert('EmailJS SDK не загружен. Убедитесь, что подключили CDN email.min.js в index.html.');
                console.error('EmailJS SDK not found (window.emailjs is undefined)');
                return;
            }

            await window.emailjs.send(serviceId, templateId, templateParams);
            alert(getTranslation('formSuccess'));
            contactForm.reset();
        } catch (err) {
            console.error('EmailJS send error', err);
            const details = (err && (err.text || err.message || err.status)) ? (err.text || err.message || JSON.stringify(err)) : null;
            alert(details ? `Ошибка отправки: ${details}` : getTranslation('formError'));
        }
    });
}

/* Преобразуем .place-photos: первая фотография — основная, остальные — миниатюры. */
function initPlacePhotos() {
    document.querySelectorAll('.place-photos').forEach(container => {
        try {
            const imgs = Array.from(container.querySelectorAll('img'));
            if (imgs.length === 0) return;

            // Создаём главный элемент
            const mainImg = document.createElement('img');
            mainImg.className = 'main-photo';
            mainImg.src = imgs[0].src || '';
            mainImg.alt = imgs[0].alt || '';

            // Создаём контейнер миниатюр
            const thumbs = document.createElement('div');
            thumbs.className = 'thumbs';

            imgs.slice(1).forEach((img, i) => {
                const t = document.createElement('img');
                t.className = 'thumb';
                t.src = img.src || '';
                t.alt = img.alt || '';
                // при клике меняем главный источник и отмечаем выбранную миниатюру
                t.addEventListener('click', () => {
                    const prev = mainImg.src;
                    mainImg.src = t.src;
                    // помимо замены, пометим выбранную
                    thumbs.querySelectorAll('img').forEach(x => x.classList.remove('selected'));
                    t.classList.add('selected');
                    // сохраним превью как миниатюру (если нужно сохранять порядок)
                    t.src = prev;
                });
                thumbs.appendChild(t);
            });

            // Очистим контейнер и вставим главный + миниатюры
            container.innerHTML = '';
            container.appendChild(mainImg);
            if (thumbs.children.length > 0) container.appendChild(thumbs);

            // выделим первую миниатюру, если она есть
            const firstThumb = thumbs.querySelector('img');
            if (firstThumb) firstThumb.classList.add('selected');
        } catch (e) {
            console.warn('initPlacePhotos error', e);
        }
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