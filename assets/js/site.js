(function () {
  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
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
  swapClass(".media-mosaic", "reveal", "tilt-in");

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
     Animated outro wordmark — split into per-letter spans.
  --------------------------------------------------------------- */
  const wordmark = document.querySelector(".footer-wordmark");
  if (wordmark && !wordmark.dataset.split) {
    const text = wordmark.textContent.trim();
    wordmark.textContent = "";
    wordmark.dataset.split = "1";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "wm-letter";
      span.textContent = ch === " " ? " " : ch;
      span.style.transitionDelay = i * 70 + "ms";
      wordmark.appendChild(span);
    });
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
    ".reveal, .reveal-blur, .tilt-in, .media-reveal, .proof-item, .footer-wordmark"
  );

  const parentCount = new Map();
  animated.forEach((el) => {
    const parent = el.parentElement;
    const n = parentCount.get(parent) || 0;
    parentCount.set(parent, n + 1);
    const delay = Math.min(n * 90, 360);
    if (delay && !el.classList.contains("footer-wordmark")) {
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

  /* ---------------------------------------------------------------
     Scroll-driven effects: header state, parallax, progress bar.
     All batched into a single rAF tick.
  --------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
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
  const scrollHideTargets = [mobileCta, agentChat].filter(Boolean);
  let scrollHideTimer = null;

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
  onScroll();

  /* ---------------------------------------------------------------
     Pointer glow on project cards.
  --------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });

  }

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
  const contactPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+|(\+91[\-\s]?)?[6-9]\d{9})$/;
  let lastSubmit = 0;

  document.querySelectorAll("form.lead-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const botcheck = form.querySelector('[name="botcheck"]');
      if (botcheck && botcheck.value) return;

      const contact = (form.querySelector('[name="contact"]')?.value || "").trim();
      if (!contactPattern.test(contact)) {
        alert("Please enter a valid phone number or email.");
        return;
      }

      const name = (form.querySelector('[name="name"]')?.value || "").trim();
      const message = (form.querySelector('[name="message"]')?.value || "").trim();
      if (name.length > 90 || contact.length > 120 || message.length > 1200) {
        alert("Please shorten your enquiry before submitting.");
        return;
      }

      const now = Date.now();
      if (now - lastSubmit < 30000) {
        alert("Please wait a moment before submitting again.");
        return;
      }

      const button = form.querySelector('[type="submit"]');
      const originalText = button ? button.textContent : "";
      if (button) {
        button.textContent = "Sending...";
        button.disabled = true;
      }

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
        setTimeout(() => {
          if (button) {
            button.textContent = originalText;
            button.disabled = false;
          }
        }, 3200);
      } catch (error) {
        if (button) {
          button.textContent = "Try again";
          button.disabled = false;
        }
      }
    });
  });
})();
