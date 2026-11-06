document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  burger?.addEventListener("click", () => {
    burger.classList.toggle("is-open");
    nav.classList.toggle("is-open");
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burger.classList.remove("is-open");
      nav.classList.remove("is-open");
    });
  });

  /* ---------- Плавное появление секций ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Анимированный счётчик ---------- */
  const counters = document.querySelectorAll("[data-count]");
  let countersStarted = false;

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      const duration = 1600;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    });
  };

  const statsSection = document.querySelector(".about__stats");
  if (statsSection && "IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    statsObserver.observe(statsSection);
  }

  /* ---------- Слайдер отзывов ---------- */
  const track = document.getElementById("reviewsTrack");
  const prevBtn = document.getElementById("reviewPrev");
  const nextBtn = document.getElementById("reviewNext");
  const dotsContainer = document.getElementById("reviewDots");

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const cards = Array.from(track.children);
  let currentIndex = 0;
  let autoplayTimer = null;

  // Создаём точки-индикаторы
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "reviews__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Перейти к отзыву ${i + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function updateUI() {
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });

    // Блокировка кнопок на краях
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
  }

  function goToSlide(index) {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;

    const card = cards[currentIndex];
    const scrollLeft =
      card.offsetLeft - track.offsetLeft - (track.clientWidth - card.clientWidth) / 2;

    track.scrollTo({ left: scrollLeft, behavior: "smooth" });
    updateUI();
  }

  function nextSlide() {
    if (currentIndex < cards.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(0); // зацикливание при автопрокрутке
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAutoplay();
  });

  // Обновляем точки при ручной прокрутке (свайп/скролл)
  track.addEventListener("scroll", () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft - track.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateUI();
    }
  });

  // Пауза при наведении
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);

  // Старт
  updateUI();
  startAutoplay();
});
