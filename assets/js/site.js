(function () {
  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  if (navToggle && nav) {
    const setNavigationOpen = (isOpen) => {
      body.classList.toggle("menu-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    };
    navToggle.addEventListener("click", () => {
      setNavigationOpen(!body.classList.contains("menu-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setNavigationOpen(false);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("menu-open")) {
        setNavigationOpen(false);
        navToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------
     Progressive enhancement of markup into richer reveal variants.
     Done in JS so the static build stays simple and no-JS visitors
     always see fully visible content.
  --------------------------------------------------------------- */
  const swapClass = (selector, from, to) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (from) el.classList.remove(from);
      el.classList.add(to);
    });
  };

  // Big content blocks settle onto a tilting 3D plane.
  swapClass(".feature-project", "reveal", "tilt-in");

  // Framed media wipes open as it enters the viewport.
  swapClass(".proof-photo", "reveal", "media-reveal");
  swapClass(".gallery-item.large", "reveal", "media-reveal");

  // Standalone display headings resolve from blur to focus.
  document
    .querySelectorAll(".cta-card h2, .footer-grid h2")
    .forEach((el) => el.classList.add("reveal-blur"));

  // Proof counters lift in (already styled, just needs observing).
  // (.proof-item rule lives in CSS; we collect it below.)

  /* ---------------------------------------------------------------
     Footer monogram expands on hover, focus, or touch.
  --------------------------------------------------------------- */
  const wordmark = document.querySelector(".footer-wordmark");
  if (wordmark) {
    const syncWordmarkState = () => {
      const hovered = window.matchMedia("(hover: hover) and (pointer: fine)").matches && wordmark.matches(":hover");
      wordmark.setAttribute("aria-expanded", String(hovered || wordmark.matches(":focus-visible") || wordmark.classList.contains("is-expanded")));
    };
    wordmark.addEventListener("click", () => {
      if (!window.matchMedia("(hover: none)").matches) return;
      wordmark.classList.toggle("is-expanded");
      syncWordmarkState();
    });
    ["mouseenter", "mouseleave", "focus", "blur"].forEach(event => wordmark.addEventListener(event, syncWordmarkState));
    if ("IntersectionObserver" in window) {
      const wordmarkObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          wordmark.classList.add("is-visible");
          wordmarkObserver.disconnect();
        }
      }, { threshold: 0.2 });
      wordmarkObserver.observe(wordmark);
    } else {
      wordmark.classList.add("is-visible");
    }
  }

  /* ---------------------------------------------------------------
     Proof counters count from 0 when the stat row enters view.
  --------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length && !reduceMotion) {
    counters.forEach((counter) => {
      counter.textContent = "0" + (counter.dataset.countSuffix || "");
    });
  }

  const animateCounter = (counter) => {
    if (!counter || counter.dataset.counted === "1") return;

    const target = Number(counter.dataset.countTo || 0);
    const suffix = counter.dataset.countSuffix || "";
    if (!Number.isFinite(target)) return;

    counter.dataset.counted = "1";

    if (reduceMotion) {
      counter.textContent = String(target) + suffix;
      return;
    }

    const duration = Math.min(1450, Math.max(800, target * 0.8));
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = Math.round(target * eased);
      counter.textContent = String(value) + suffix;

      if (elapsed < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = String(target) + suffix;
      }
    };

    requestAnimationFrame(tick);
  };

  const animateCountersIn = (container) => {
    if (!container) return;
    const scoped = container.matches("[data-count-to]")
      ? [container]
      : container.querySelectorAll("[data-count-to]");
    scoped.forEach(animateCounter);
  };

  /* ---------------------------------------------------------------
     Scroll reveal — one observer drives every animated variant,
     with a gentle stagger between siblings sharing a parent.
  --------------------------------------------------------------- */
  const animated = document.querySelectorAll(
    ".reveal, .reveal-blur, .tilt-in, .media-reveal, .proof-item"
  );

  const parentCount = new Map();
  animated.forEach((el) => {
    const parent = el.parentElement;
    const n = parentCount.get(parent) || 0;
    parentCount.set(parent, n + 1);
    const delay = Math.min(n * 90, 360);
    if (delay) {
      el.style.setProperty("--reveal-delay", delay + "ms");
    }
  });

  if ("IntersectionObserver" in window && animated.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            animateCountersIn(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    animated.forEach((el) => observer.observe(el));
  } else {
    animated.forEach((el) => {
      el.classList.add("is-visible");
      animateCountersIn(el);
    });
  }

  /* ---------------------------------------------------------------
     Hero cinematic intro (after first paint).
  --------------------------------------------------------------- */
  requestAnimationFrame(() =>
    requestAnimationFrame(() => body.classList.add("is-loaded"))
  );

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
    const controls = [...carousel.querySelectorAll("[data-hero-control]")];
    const playback = carousel.querySelector("[data-hero-playback]");
    let activeIndex = 0;
    let carouselTimer = null;
    let userPaused = false;

    const showSlide = (index) => {
      activeIndex = index;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
      });
      controls.forEach((control, i) => {
        control.classList.toggle("is-active", i === index);
        if (i === index) control.setAttribute("aria-current", "true");
        else control.removeAttribute("aria-current");
      });
    };

    const stopCarousel = () => {
      clearInterval(carouselTimer);
      carouselTimer = null;
    };
    const startCarousel = (requestedPlayback = false) => {
      if (reduceMotion || userPaused || document.hidden || carouselTimer || slides.length < 2) return;
      if (!requestedPlayback && (carousel.matches(":hover") || carousel.contains(document.activeElement))) return;
      carouselTimer = setInterval(() => showSlide((activeIndex + 1) % slides.length), 6200);
    };

    if (playback) {
      if (reduceMotion) playback.remove();
      else playback.addEventListener("click", () => {
        userPaused = !userPaused;
        playback.textContent = userPaused ? "Play" : "Pause";
        const label = userPaused ? "Play slideshow" : "Pause slideshow";
        playback.setAttribute("aria-label", label);
        playback.title = label;
        stopCarousel();
        startCarousel(!userPaused);
      });
    }
    controls.forEach((control, index) => {
      control.addEventListener("click", () => {
        showSlide(index);
        stopCarousel();
        startCarousel();
      });
    });
    carousel.addEventListener("mouseenter", stopCarousel);
    carousel.addEventListener("mouseleave", () => startCarousel());
    carousel.addEventListener("focusin", stopCarousel);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) startCarousel();
    });
    document.addEventListener("visibilitychange", () => document.hidden ? stopCarousel() : startCarousel());
    showSlide(0);
    startCarousel();
  }

  /* ---------------------------------------------------------------
     Scroll-driven effects: header state, parallax, progress bar.
     All batched into a single rAF tick.
  --------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const homeHero = document.querySelector(".page-main > .hero:not(.project-hero)");
  const homeHeroMedia = homeHero?.querySelector(".hero-media");
  let progressBar = null;
  if (!reduceMotion) {
    progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    body.appendChild(progressBar);
  }

  /* Scroll-hide targets: mobile CTA bar + agent chat widget */
  const agentChat = document.querySelector(".agent-chat");
  const mobileCta = document.querySelector(".mobile-cta");
  const pageHero = document.querySelector(".page-main > .hero");
  const scrollHideTargets = [mobileCta, agentChat].filter(Boolean);
  let scrollHideTimer = null;

  if ("IntersectionObserver" in window && scrollHideTargets.length) {
    const visibleForms = new Set();
    const formObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleForms.add(entry.target);
        else visibleForms.delete(entry.target);
      });
      scrollHideTargets.forEach((target) => target.classList.toggle("form-in-view", visibleForms.size > 0));
    });
    document.querySelectorAll("form.lead-form").forEach((form) => formObserver.observe(form));
  }

  const setScrollHidden = (hidden) => {
    scrollHideTargets.forEach((el) => {
      el.classList.toggle("scroll-hidden", hidden);
    });
    /* Close the agent chat panel when hiding */
    if (hidden && agentChat && agentChat.open) {
      agentChat.removeAttribute("open");
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;

      if (homeHeroMedia && window.innerWidth > 680 && !reduceMotion) {
        const progress = Math.min(y / Math.max(homeHero.offsetHeight * 0.7, 1), 1);
        homeHeroMedia.style.inset = `${Math.round(progress * 24)}px ${Math.round(progress * 28)}px ${Math.round(progress * 32)}px`;
        homeHeroMedia.style.borderRadius = `${Math.round(progress * 8)}px`;
        homeHeroMedia.style.boxShadow = progress > 0.25 ? "0 20px 44px rgba(15, 25, 38, 0.17)" : "none";
      } else if (homeHeroMedia) {
        homeHeroMedia.style.removeProperty("inset");
        homeHeroMedia.style.removeProperty("border-radius");
        homeHeroMedia.style.removeProperty("box-shadow");
      }

      if (mobileCta && pageHero) {
        const heroEnd = pageHero.offsetTop + pageHero.offsetHeight;
        mobileCta.classList.toggle("before-hero", y < heroEnd - window.innerHeight * 0.5);
      }

      if (header) header.classList.toggle("is-scrolled", y > 24);

      if (!reduceMotion) {
        if (progressBar) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = max > 0 ? Math.min(y / max, 1) : 0;
          progressBar.style.transform = "scaleX(" + p + ")";
        }
      }

      /* Hide CTA / agent-chat when scrolling, show at top or after pause */
      if (y > 60) {
        setScrollHidden(true);
        clearTimeout(scrollHideTimer);
        scrollHideTimer = setTimeout(() => setScrollHidden(false), 1500);
      } else {
        clearTimeout(scrollHideTimer);
        setScrollHidden(false);
      }

      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     Floating agent contact panel.
  --------------------------------------------------------------- */
  if (agentChat) {
    document.addEventListener("click", (event) => {
      if (!agentChat.open || agentChat.contains(event.target)) return;
      agentChat.removeAttribute("open");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") agentChat.removeAttribute("open");
    });
  }

  /* ---------------------------------------------------------------
     Lead form submission (Web3Forms) with validation + throttle.
  --------------------------------------------------------------- */
  const contactPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+|(\+91)?[6-9]\d{9})$/;
  let lastSubmit = 0;

  const sourceField = document.querySelector("[data-enquiry-source]");
  if (sourceField) {
    const source = new URLSearchParams(location.search).get("source");
    if (source && /^[a-z0-9-]{1,30}$/i.test(source)) sourceField.value = source;
  }

  document.querySelectorAll("form.lead-form").forEach((form, index) => {
    const status = form.querySelector("[data-form-status]");
    const contactField = form.querySelector('[name="contact"]');
    const contactError = contactField ? document.createElement("span") : null;
    if (status && contactField) {
      contactError.id = `contact-error-${index}`;
      contactError.className = "field-error";
      contactError.hidden = true;
      contactField.after(contactError);
      contactField.setAttribute("aria-describedby", contactError.id);
      contactField.addEventListener("input", () => {
        if (contactField.getAttribute("aria-invalid") !== "true") return;
        contactField.removeAttribute("aria-invalid");
        contactError.hidden = true;
        contactError.textContent = "";
        status.textContent = "";
      });
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const botcheck = form.querySelector('[name="botcheck"]');
      if (botcheck && botcheck.value) return;

      const contact = (contactField?.value || "").trim();
      const normalizedContact = contact.includes("@") ? contact : contact.replace(/[\s-]/g, "");
      const requiresMobile = form.classList.contains("interest-form");
      const validContact = requiresMobile
        ? /^(\+91)?[6-9]\d{9}$/.test(normalizedContact)
        : contactPattern.test(normalizedContact);
      if (!validContact) {
        const errorMessage = requiresMobile
          ? "Please enter a valid Indian mobile number."
          : "Please enter a valid Indian mobile number or email address.";
        if (status) status.textContent = errorMessage;
        if (contactError) {
          contactError.textContent = errorMessage;
          contactError.hidden = false;
        }
        contactField?.setAttribute("aria-invalid", "true");
        contactField?.focus();
        return;
      }
      contactField?.removeAttribute("aria-invalid");
      if (contactError) contactError.hidden = true;

      const name = (form.querySelector('[name="name"]')?.value || "").trim();
      const message = (form.querySelector('[name="message"]')?.value || "").trim();
      if (name.length > 90 || contact.length > 120 || message.length > 1200) {
        if (status) status.textContent = "Please shorten your enquiry before submitting.";
        return;
      }

      const now = Date.now();
      if (now - lastSubmit < 30000) {
        if (status) status.textContent = "Please wait a moment before submitting again.";
        return;
      }

      const button = form.querySelector('[type="submit"]');
      const originalContent = button ? button.innerHTML : "";
      if (button) {
        button.textContent = "Sending...";
        button.disabled = true;
      }
      if (status) status.textContent = "Sending your enquiry...";

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: new FormData(form),
          credentials: "omit",
          cache: "no-store",
          referrerPolicy: "strict-origin-when-cross-origin",
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Submission failed");

        lastSubmit = Date.now();
        form.reset();
        if (button) button.textContent = "Request sent";
        if (status) status.textContent = requiresMobile
          ? "Thank you. Our sales team will contact you during your selected window."
          : "Thank you. Our sales team will be in touch soon.";
        setTimeout(() => {
          if (button) {
            button.innerHTML = originalContent;
            button.disabled = false;
          }
        }, 3200);
      } catch (error) {
        if (button) {
          button.textContent = "Try again";
          button.disabled = false;
        }
        if (status) status.textContent = "We could not send your request. Please try again, or call our sales desk.";
      }
    });
  });
})();
