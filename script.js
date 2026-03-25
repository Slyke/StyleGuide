const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleState = document.querySelector("#theme-toggle-state");
const themeHelper = document.querySelector("#theme-helper");
const fontSelector = document.querySelector("#font-selector");
const fontOptions = fontSelector
  ? new Set(Array.from(fontSelector.options, (option) => option.value))
  : new Set();
const rangeInputs = document.querySelectorAll('input[type="range"][data-output]');
const toggleInputs = document.querySelectorAll(
  'input[type="checkbox"][data-toggle-output]'
);
const tabLists = document.querySelectorAll('[role="tablist"]');

const syncThemeUi = (theme) => {
  const nextTheme = theme === "light" ? "light" : "dark";

  root.dataset.theme = nextTheme;

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "light"));
  }

  if (themeToggleState) {
    themeToggleState.textContent = nextTheme === "light" ? "Light" : "Dark";
  }

  if (themeHelper) {
    themeHelper.textContent =
      nextTheme === "light" ? "light theme active" : "dark theme active";
  }
};

syncThemeUi(root.dataset.theme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";

    syncThemeUi(nextTheme);

    try {
      localStorage.setItem("styleguid-theme", nextTheme);
    } catch (error) {
      console.warn("Theme preference unavailable.", error);
    }
  });
}

const syncFontUi = (fontKey) => {
  const nextFont = fontOptions.has(fontKey) ? fontKey : "system-stack";

  root.dataset.font = nextFont;

  if (fontSelector) {
    fontSelector.value = nextFont;
  }
};

syncFontUi(root.dataset.font);

if (fontSelector) {
  fontSelector.addEventListener("change", () => {
    syncFontUi(fontSelector.value);

    try {
      localStorage.setItem("styleguid-font", fontSelector.value);
    } catch (error) {
      console.warn("Font preference unavailable.", error);
    }
  });
}

rangeInputs.forEach((rangeInput) => {
  const rangeOutput = document.getElementById(rangeInput.dataset.output || "");

  if (!rangeOutput) {
    return;
  }

  const syncRange = () => {
    rangeOutput.value = rangeInput.value;
    rangeOutput.textContent = rangeInput.value;
  };

  syncRange();
  rangeInput.addEventListener("input", syncRange);
});

toggleInputs.forEach((toggleInput) => {
  const toggleState = document.getElementById(
    toggleInput.dataset.toggleOutput || ""
  );

  if (!toggleState) {
    return;
  }

  const syncToggle = () => {
    toggleState.textContent = toggleInput.checked ? "enabled" : "disabled";
  };

  syncToggle();
  toggleInput.addEventListener("change", syncToggle);
});

tabLists.forEach((tabList) => {
  const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

  if (tabs.length === 0) {
    return;
  }

  const selectTab = (nextTab, moveFocus = false) => {
    tabs.forEach((tab) => {
      const isSelected = tab === nextTab;
      const panel = document.getElementById(tab.dataset.panel || "");

      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;

      if (panel) {
        panel.hidden = !isSelected;
      }
    });

    if (moveFocus) {
      nextTab.focus();
    }
  };

  tabList.addEventListener("click", (event) => {
    const nextTab = event.target.closest('[role="tab"]');

    if (!nextTab) {
      return;
    }

    selectTab(nextTab);
  });

  tabList.addEventListener("keydown", (event) => {
    const currentIndex = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectTab(tabs[nextIndex], true);
  });
});
