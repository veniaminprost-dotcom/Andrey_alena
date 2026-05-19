(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  document.body.classList.add("is-loading");

  const hideLoader = () => {
    const loader = document.querySelector("[data-loader]");
    loader?.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideLoader, { once: true });
  } else {
    hideLoader();
  }

  window.addEventListener("load", hideLoader, { once: true });
  window.setTimeout(hideLoader, 1600);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const phoneInput = document.querySelector('input[name="phone"]');
  phoneInput?.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
    const normalized = digits.startsWith("7") ? digits : `7${digits}`;
    const parts = [
      "+7",
      normalized.length > 1 ? ` (${normalized.slice(1, 4)}` : "",
      normalized.length >= 4 ? ")" : "",
      normalized.length > 4 ? ` ${normalized.slice(4, 7)}` : "",
      normalized.length > 7 ? `-${normalized.slice(7, 9)}` : "",
      normalized.length > 9 ? `-${normalized.slice(9, 11)}` : ""
    ];
    phoneInput.value = parts.join("");
  });

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".slider__track");
    const slides = [...track.children];
    const dots = slider.querySelector(".slider__dots");
    const prev = slider.querySelector(".slider__button--prev");
    const next = slider.querySelector(".slider__button--next");
    let active = 0;

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Показать слайд ${index + 1}`);
      dot.addEventListener("click", () => scrollToSlide(index));
      dots.append(dot);
    });

    const setActive = (index) => {
      active = Math.max(0, Math.min(slides.length - 1, index));
      dots.querySelectorAll("button").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };

    const scrollToSlide = (index) => {
      const slide = slides[index];
      if (!slide) return;
      const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
      track.scrollTo({ left, behavior: "smooth" });
      setActive(index);
    };

    prev?.addEventListener("click", () => scrollToSlide(active - 1));
    next?.addEventListener("click", () => scrollToSlide(active + 1));

    track.addEventListener("scroll", () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const index = slides.reduce((closest, slide, idx) => {
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const currentDistance = Math.abs(slideCenter - center);
        const closestCenter = slides[closest].offsetLeft + slides[closest].clientWidth / 2;
        return currentDistance < Math.abs(closestCenter - center) ? idx : closest;
      }, 0);
      setActive(index);
    }, { passive: true });

    setActive(0);
    window.setInterval(() => scrollToSlide((active + 1) % slides.length), 5200);
  });

  const form = document.querySelector("[data-rsvp]");
  const status = document.querySelector("[data-form-status]");

  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", error);
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const guestCount = String(data.get("guestCount") || "").trim();
    const guests = guestCount ? `${guestCount} гост.` : "Количество не указано";

    if (name.length < 3) {
      setStatus("Пожалуйста, укажите ФИО.", true);
      form.querySelector('[name="name"]').focus();
      return;
    }

    if (phoneDigits.length !== 11) {
      setStatus("Пожалуйста, укажите телефон в формате +7.", true);
      form.querySelector('[name="phone"]').focus();
      return;
    }

    const payload = {
      name,
      phone,
      guests,
      guestCount,
      comment: String(data.get("comment") || "").trim(),
      page: location.href,
      userAgent: navigator.userAgent
    };

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    setStatus("Отправляем...");

    try {
      await window.RsvpApi.send(payload);
      setStatus("Спасибо! Мы ждём вас!");
      form.reset();
      launchConfetti();
    } catch (error) {
      setStatus("Заявка сохранена на устройстве, но Telegram сейчас недоступен. Попробуйте отправить еще раз чуть позже.", true);
    } finally {
      button.disabled = false;
    }
  });

  const soundButton = document.querySelector("[data-sound]");
  const weddingAudio = document.querySelector("[data-audio]");

  soundButton?.addEventListener("click", async () => {
    if (!weddingAudio) return;

    if (!weddingAudio.paused) {
      weddingAudio.pause();
      soundButton.classList.remove("is-on");
      return;
    }

    try {
      weddingAudio.volume = 0.58;
      await weddingAudio.play();
      soundButton.classList.add("is-on");
    } catch (error) {
      soundButton.classList.remove("is-on");
    }
  });

  function launchConfetti() {
    const canvas = document.querySelector("[data-confetti]");
    const ctx = canvas.getContext("2d");
    const colors = ["#6B7B5E", "#C9B1B1", "#9CAF9E", "#B8C5D0", "#8B7355"];
    const pieces = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 140,
      size: 4 + Math.random() * 7,
      speed: 1.6 + Math.random() * 3,
      drift: -1 + Math.random() * 2,
      rotation: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    resize();

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach((piece) => {
        piece.y += piece.speed;
        piece.x += piece.drift;
        piece.rotation += 0.06;
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.64);
        ctx.restore();
      });
      frame += 1;
      if (frame < 180) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    draw();
  }
})();
