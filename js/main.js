(function initializePortfolio() {
  "use strict";

  const navbar = document.getElementById("site-navbar");
  const navbarMenu = document.getElementById("navbar-menu");
  const navigationLinks = Array.from(document.querySelectorAll("#navbar-menu .nav-link"));
  const sections = navigationLinks
    .map(function getLinkedSection(link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  let scrollUpdatePending = false;

  function setActiveNavigation(sectionId) {
    navigationLinks.forEach(function updateLink(link) {
      const isActive = link.getAttribute("href") === "#" + sectionId;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updatePageState() {
    const scrollPosition = window.scrollY;
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const sectionMarker = scrollPosition + navbarHeight + window.innerHeight * 0.24;
    let activeSection = sections.length ? sections[0].id : "home";

    if (navbar) {
      navbar.classList.toggle("is-scrolled", scrollPosition > 12);
    }

    sections.forEach(function findCurrentSection(section) {
      if (section.offsetTop <= sectionMarker) {
        activeSection = section.id;
      }
    });

    const pageBottom = Math.ceil(window.innerHeight + scrollPosition) >= document.documentElement.scrollHeight - 4;
    if (pageBottom && sections.length) {
      activeSection = sections[sections.length - 1].id;
    }

    setActiveNavigation(activeSection);
    scrollUpdatePending = false;
  }

  function requestPageStateUpdate() {
    if (!scrollUpdatePending) {
      window.requestAnimationFrame(updatePageState);
      scrollUpdatePending = true;
    }
  }

  navigationLinks.forEach(function bindMobileMenuClose(link) {
    link.addEventListener("click", function closeMobileMenu() {
      if (!navbarMenu || !navbarMenu.classList.contains("show") || !window.bootstrap) {
        return;
      }

      const menuController = window.bootstrap.Collapse.getOrCreateInstance(navbarMenu, { toggle: false });
      menuController.hide();
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function showItem(item) {
      item.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function revealVisibleItems(entries, observer) {
        entries.forEach(function revealEntry(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    revealItems.forEach(function observeItem(item) {
      revealObserver.observe(item);
    });
  }

  window.addEventListener("scroll", requestPageStateUpdate, { passive: true });
  window.addEventListener("resize", requestPageStateUpdate);
  updatePageState();
})();
