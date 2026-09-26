(function initializeTheme() {
  "use strict";

  const root = document.documentElement;
  const storageKey = "portfolio-theme";
  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function readSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // The selected theme still applies when storage is unavailable.
    }
  }

  function updateThemeControl(theme) {
    const toggleButton = document.getElementById("theme-toggle");
    const toggleIcon = document.getElementById("theme-icon");

    if (!toggleButton || !toggleIcon) {
      return;
    }

    const isDark = theme === "dark";
    const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

    toggleButton.setAttribute("aria-label", actionLabel);
    toggleButton.setAttribute("title", actionLabel);
    toggleButton.setAttribute("aria-pressed", String(isDark));
    toggleIcon.className = isDark ? "bi bi-moon-stars" : "bi bi-sun";
  }

  function applyTheme(theme, shouldSave) {
    root.dataset.theme = theme;
    root.dataset.bsTheme = theme;
    root.style.colorScheme = theme;

    const themeColor = document.getElementById("theme-color");
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#0e141c" : "#f6f7f4");
    }

    updateThemeControl(theme);

    if (shouldSave) {
      saveTheme(theme);
    }
  }

  root.classList.remove("no-js");
  root.classList.add("js");

  const initialTheme = readSavedTheme() || (darkModeQuery.matches ? "dark" : "light");
  applyTheme(initialTheme, false);

  function bindThemeControl() {
    const toggleButton = document.getElementById("theme-toggle");

    if (!toggleButton) {
      return;
    }

    updateThemeControl(root.dataset.theme);
    toggleButton.addEventListener("click", function handleThemeToggle() {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindThemeControl, { once: true });
  } else {
    bindThemeControl();
  }

  darkModeQuery.addEventListener("change", function handleSystemThemeChange(event) {
    if (!readSavedTheme()) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  });
})();
