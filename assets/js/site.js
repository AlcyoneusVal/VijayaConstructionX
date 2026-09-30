(function () {
  const body = document.body;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");

  /* ---------------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  if (navToggle && nav) {
    const mobileNavigation = window.matchMedia("(max-width: 980px)");
    const pageSurfaces = [...document.querySelectorAll(".page-main, .site-footer, .mobile-cta, .agent-chat")];
    const navigationLinks = [...nav.querySelectorAll("a")];
    const setNavigationOpen = (isOpen) => {
      body.classList.toggle("menu-open", isOpen);
      if (isOpen) header?.classList.remove("is-hidden");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      nav.inert = mobileNavigation.matches && !isOpen;
      pageSurfaces.forEach((surface) => { surface.inert = isOpen; });
    };
    navToggle.addEventListener("click", () => {
      setNavigationOpen(!body.classList.contains("menu-open"));
    });

    navigationLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setNavigationOpen(false);
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("menu-open")) {
        setNavigationOpen(false);
        navToggle.focus();
      }
      if (event.key === "Tab" && body.classList.contains("menu-open")) {
        const current = document.activeElement;
        if (!event.shiftKey && current === navToggle) {
          event.preventDefault();
          navigationLinks[0].focus();
        } else if ((event.shiftKey && current === navigationLinks[0]) || (!event.shiftKey && current === navigationLinks.at(-1))) {
          event.preventDefault();
          navToggle.focus();
        } else if (event.shiftKey && current === navToggle) {
          event.preventDefault();
          navigationLinks.at(-1).focus();
        }
      }
    });
    document.addEventListener("click", (event) => {
      if (body.classList.contains("menu-open") && !event.target.closest(".site-header")) setNavigationOpen(false);
    });
    mobileNavigation.addEventListener("change", () => setNavigationOpen(false));
    setNavigationOpen(false);
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
     Footer name settles into place once, without changing its width.
  --------------------------------------------------------------- */
  const wordmark = document.querySelector(".footer-wordmark");
  if (wordmark) {
    if (!reduceMotion && "IntersectionObserver" in window) {
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

  // Keep the outgoing shot moving through the crossfade; pause offscreen media.
  const heroMotions = new Map();
  const visibleHeroes = new Set(document.querySelectorAll(".hero"));
  const syncHeroMotion = () => {
    heroMotions.forEach((animation, image) => {
      if (animation.playState === "finished") return;
      if (document.hidden || !visibleHeroes.has(image.closest(".hero"))) animation.pause();
      else animation.play();
    });
  };
  const animateHeroImage = (image, zoomOut = false, loop = false) => {
    heroMotions.get(image)?.cancel();
    if (reduceMotion || navigator.connection?.saveData || !image.animate) return;
    const animation = image.animate([
      { transform: `scale(${zoomOut ? 1.035 : 1})` },
      { transform: `scale(${zoomOut ? 1 : 1.035})` },
    ], { duration: loop ? 22000 : 14000, easing: "linear", fill: "forwards", iterations: loop ? Infinity : 1, direction: loop ? "alternate" : "normal" });
    heroMotions.set(image, animation);
    syncHeroMotion();
  };
  document.querySelectorAll("[data-hero-motion]").forEach((image) => animateHeroImage(image, false, true));
  if (heroMotions.size || document.querySelector("[data-hero-carousel]")) {
    if ("IntersectionObserver" in window) {
      const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) visibleHeroes.add(target);
          else visibleHeroes.delete(target);
        });
        syncHeroMotion();
      });
      visibleHeroes.forEach((hero) => motionObserver.observe(hero));
    }
    document.addEventListener("visibilitychange", syncHeroMotion);
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  const projectData = document.querySelector("[data-hero-projects]");
  if (carousel && projectData) {
    const hero = carousel.closest(".hero");
    const projects = JSON.parse(projectData.textContent);
    const projectLinks = [...hero.querySelectorAll("[data-hero-project]")];
    const desktop = window.matchMedia("(min-width: 981px)");
    const controls = carousel.querySelector("[data-hero-controls]");
    const announcement = hero.querySelector("[data-hero-announcement]");
    const frames = [carousel.querySelector("[data-hero-frame]"), document.createElement("img")];
    frames[1].className = "hero-slide";
    frames[1].dataset.heroFrame = "";
    frames[1].alt = "";
    frames[1].setAttribute("aria-hidden", "true");
    carousel.insertBefore(frames[1], carousel.querySelector(".hero-carousel-controls"));
    let activeFrame = 0;
    let activeProject = projects[0];
    let activeIndex = 0;
    let carouselTimer = null;
    let autoplayDisabled = Boolean(navigator.connection?.saveData);
    let inView = true;
    let requestId = 0;
    let swipe = null;

    const updateSelection = () => {
      hero.classList.toggle("is-project-selector", desktop.matches);
      projectLinks.forEach((link) => {
        if (desktop.matches) {
          link.setAttribute("role", "button");
          link.setAttribute("aria-pressed", String(link.dataset.heroProject === activeProject.slug));
          link.setAttribute("aria-controls", "hero-project-title");
        } else {
          link.removeAttribute("role");
          link.removeAttribute("aria-pressed");
          link.removeAttribute("aria-controls");
        }
      });
    };

    const updateProject = (project) => {
      hero.dataset.heroCurrent = project.slug;
      hero.querySelector("[data-hero-name]").textContent = project.displayName;
      hero.querySelector("[data-hero-location]").textContent = project.location;
      hero.querySelector("[data-hero-sales-status]").textContent = project.status;
      hero.querySelector("[data-hero-copy]").textContent = project.summary;
      const explore = hero.querySelector("[data-hero-explore]");
      explore.href = project.url;
      explore.querySelector("span").textContent = project.exploreLabel;
      hero.querySelector("[data-hero-whatsapp]").href = project.whatsapp;
      carousel.setAttribute("aria-label", `Views of planned ${project.name}`);
      const buttons = project.scenes.map((scene, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.heroControl = String(index);
        button.setAttribute("aria-label", `Show ${scene.label.toLowerCase()}`);
        button.title = scene.label;
        return button;
      });
      controls.replaceChildren(...buttons);
      updateSelection();
    };

    const updateControls = () => {
      controls.querySelectorAll("button").forEach((control, i) => {
        control.classList.toggle("is-active", i === activeIndex);
        if (i === activeIndex) control.setAttribute("aria-current", "true");
        else control.removeAttribute("aria-current");
      });
      hero.querySelector("[data-hero-view-label]").textContent = activeProject.scenes[activeIndex].label;
    };

    const stopCarousel = () => {
      clearTimeout(carouselTimer);
      carouselTimer = null;
    };
    const startCarousel = () => {
      if (reduceMotion || autoplayDisabled || document.hidden || !inView || carouselTimer || swipe || activeProject.scenes.length < 2) return;
      const keyboardFocus = hero.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
      if (keyboardFocus || hero.querySelector(".hero-panel").matches(":hover") ||
          carousel.querySelector(".hero-carousel-controls").matches(":hover")) return;
      carouselTimer = setTimeout(() => {
        carouselTimer = null;
        showScene(activeProject, (activeIndex + 1) % activeProject.scenes.length);
      }, 6800);
    };

    // Decode before swapping; a late image request must not override a newer selection.
    const showScene = async (project, index, announce = false) => {
      const id = ++requestId;
      const scene = project.scenes[index];
      stopCarousel();
      hero.setAttribute("aria-busy", "true");
      const image = new Image();
      image.sizes = scene.sizes;
      image.srcset = scene.srcset;
      image.src = scene.src;
      try {
        await image.decode();
        if (id !== requestId) return;
        const nextFrame = 1 - activeFrame;
        const frame = frames[nextFrame];
        frame.sizes = scene.sizes;
        frame.srcset = scene.srcset;
        frame.src = scene.src;
        frame.alt = scene.alt;
        frame.style.objectPosition = scene.position;
        frame.setAttribute("aria-hidden", "false");
        animateHeroImage(frame, index % 2 === 1);
        frame.classList.add("is-active");
        frames[activeFrame].classList.remove("is-active");
        frames[activeFrame].setAttribute("aria-hidden", "true");
        activeFrame = nextFrame;
        const changedProject = activeProject.slug !== project.slug;
        activeProject = project;
        activeIndex = index;
        if (changedProject) updateProject(project);
        updateControls();
        if (announce) announcement.textContent = `${project.name} selected. ${project.status}. ${scene.label}.`;
      } catch {
        if (id !== requestId) return;
        autoplayDisabled = true;
        announcement.textContent = "This view could not load. The previous project view is still available.";
      }
      if (id === requestId) {
        hero.removeAttribute("aria-busy");
        startCarousel();
      }
    };

    controls.addEventListener("click", (event) => {
      const button = event.target.closest("[data-hero-control]");
      if (button) showScene(activeProject, Number(button.dataset.heroControl));
    });
    hero.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || desktop.matches) return;
      if (!event.isPrimary) {
        swipe = null;
        startCarousel();
        return;
      }
      if (event.target.closest("a, button, input, select, textarea, .hero-panel")) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      stopCarousel();
    }, { passive: true });
    const finishSwipe = (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      const dx = event.clientX - swipe.x;
      const dy = event.clientY - swipe.y;
      const elapsed = performance.now() - swipe.time;
      swipe = null;
      if (event.type === "pointerup" && elapsed < 1500 && Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const next = (activeIndex + (dx < 0 ? 1 : -1) + activeProject.scenes.length) % activeProject.scenes.length;
        showScene(activeProject, next);
      } else startCarousel();
    };
    hero.addEventListener("pointerup", finishSwipe, { passive: true });
    hero.addEventListener("pointercancel", finishSwipe, { passive: true });
    projectLinks.forEach((link) => {
      const select = () => showScene(projects.find((project) => project.slug === link.dataset.heroProject), 0, true);
      link.addEventListener("click", (event) => {
        if (!desktop.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select();
      });
      link.addEventListener("keydown", (event) => {
        if (desktop.matches && event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });
    hero.querySelectorAll(".hero-panel, .hero-carousel-controls").forEach((surface) => {
      surface.addEventListener("mouseenter", stopCarousel);
      surface.addEventListener("mouseleave", () => startCarousel());
    });
    hero.addEventListener("focusin", stopCarousel);
    hero.addEventListener("focusout", () => requestAnimationFrame(() => startCarousel()));
    desktop.addEventListener("change", () => {
      requestId++;
      swipe = null;
      hero.removeAttribute("aria-busy");
      updateSelection();
      if (!desktop.matches && activeProject.slug !== projects[0].slug) showScene(projects[0], 0);
      else startCarousel();
    });
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) startCarousel();
        else stopCarousel();
      }, { threshold: 0.05 });
      heroObserver.observe(hero);
    }
    document.addEventListener("visibilitychange", () => document.hidden ? stopCarousel() : startCarousel());
    updateProject(activeProject);
    updateControls();
    animateHeroImage(frames[0]);
    startCarousel();
  }

  /* ---------------------------------------------------------------
     Scroll-driven effects: header state, parallax, progress bar.
     All batched into a single rAF tick.
  --------------------------------------------------------------- */
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

  // Exclude the header's own height change from scroll-direction detection.
  const headerScrollPosition = () => Math.max(0, window.scrollY) - (header?.offsetHeight || 0);
  let headerScrollAnchor = headerScrollPosition();
  let headerViewportWidth = window.innerWidth;
  header?.addEventListener("focusin", () => {
    header.classList.remove("is-hidden");
    headerScrollAnchor = headerScrollPosition();
  });
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
      const y = Math.max(0, Math.min(window.scrollY, maxScroll));

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

      if (header) {
        header.classList.toggle("is-scrolled", y > 24);
        const position = y - header.offsetHeight;
        const keyboardFocus = header.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
        if (y <= header.offsetHeight + 24 || body.classList.contains("menu-open") || keyboardFocus) {
          header.classList.remove("is-hidden");
          headerScrollAnchor = position;
        } else if (Math.abs(position - headerScrollAnchor) >= 12) {
          header.classList.toggle("is-hidden", position > headerScrollAnchor);
          headerScrollAnchor = position;
        }
      }

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
  window.addEventListener("resize", () => {
    // Mobile browser chrome can resize the height during an ordinary scroll.
    if (window.innerWidth !== headerViewportWidth) {
      headerViewportWidth = window.innerWidth;
      headerScrollAnchor = headerScrollPosition();
      header?.classList.remove("is-hidden");
    }
    onScroll();
  }, { passive: true });
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
