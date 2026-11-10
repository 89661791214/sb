document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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

  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = Array.from(track.children);
    let currentIndex = 0;
    let autoplayTimer = null;

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

    const updateUI = () => {
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === cards.length - 1;
    };

    const goToSlide = (index) => {
      if (index < 0 || index >= cards.length) return;
      currentIndex = index;

      const card = cards[currentIndex];
      const scrollLeft =
        card.offsetLeft -
        track.offsetLeft -
        (track.clientWidth - card.clientWidth) / 2;

      track.scrollTo({ left: scrollLeft, behavior: "smooth" });
      updateUI();
    };

    const nextSlide = () => {
      if (currentIndex < cards.length - 1) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0);
      }
    };

    const prevSlide = () => {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, 6000);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    prevBtn.addEventListener("click", () => {
      prevSlide();
      resetAutoplay();
    });

    nextBtn.addEventListener("click", () => {
      nextSlide();
      resetAutoplay();
    });

    track.addEventListener("scroll", () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, i) => {
        const cardCenter =
          card.offsetLeft - track.offsetLeft + card.clientWidth / 2;
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

    track.addEventListener("mouseenter", stopAutoplay);
    track.addEventListener("mouseleave", startAutoplay);

    updateUI();
    startAutoplay();
  }

  /* ---------- Свечения следуют за курсором (только desktop) ---------- */
  const isPointerFine = window.matchMedia("(pointer: fine)").matches;

  if (isPointerFine && !prefersReducedMotion) {
    const glowDefs = [
      { selector: ".bg-glow--1", lag: 0.20, phase: 0 },
      { selector: ".bg-glow--2", lag: 0.14, phase: 2 },
      { selector: ".bg-glow--3", lag: 0.28, phase: 4 },
    ]
      .map((g) => ({ ...g, el: document.querySelector(g.selector) }))
      .filter((g) => g.el);

    if (glowDefs.length) {
      // Кэшируем базовые центры свечений (без transform)
      let baseCenters = [];
      const recalcBaseCenters = () => {
        baseCenters = glowDefs.map((g) => {
          const prev = g.el.style.transform;
          g.el.style.transform = "none";
          const rect = g.el.getBoundingClientRect();
          g.el.style.transform = prev;
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        });
      };
      recalcBaseCenters();
      window.addEventListener("resize", recalcBaseCenters);

      // Целевая позиция курсора
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;

      window.addEventListener(
        "mousemove",
        (e) => {
          targetX = e.clientX;
          targetY = e.clientY;
        },
        { passive: true }
      );

      // Текущие сглаженные позиции — своя для каждого свечения
      const currents = glowDefs.map(() => ({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }));

      const animateGlows = (time) => {
        const t = time * 0.001;

        glowDefs.forEach((g, i) => {
          const c = currents[i];

          // Плавное «догоняние» курсора — разные скорости для слоёв
          c.x += (targetX - c.x) * g.lag;
          c.y += (targetY - c.y) * g.lag;

          // Смещение от базовой позиции до текущей точки
          const base = baseCenters[i];
          const dx = c.x - base.x;
          const dy = c.y - base.y;

          // Лёгкое «дыхание» — фон живёт даже когда курсор стоит
          const breatheX = Math.sin(t * 0.8 + g.phase) * 12;
          const breatheY = Math.cos(t * 0.6 + g.phase) * 14;
          const breatheScale = 1 + Math.sin(t * 0.5 + g.phase) * 0.05;

          g.el.style.transform =
            `translate3d(${(dx + breatheX).toFixed(2)}px, ${(dy + breatheY).toFixed(2)}px, 0) scale(${breatheScale.toFixed(3)})`;
        });

        requestAnimationFrame(animateGlows);
      };

      requestAnimationFrame(animateGlows);
    }
  }
});
