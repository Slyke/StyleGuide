const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleState = document.querySelector("#theme-toggle-state");
const themeHelper = document.querySelector("#theme-helper");
const fontSelector = document.querySelector("#font-selector");
const contentWidthSelector = document.querySelector("#content-width-selector");
const fontOptions = fontSelector
  ? new Set(Array.from(fontSelector.options, (option) => option.value))
  : new Set();
const contentWidthOptions = contentWidthSelector
  ? new Set(Array.from(contentWidthSelector.options, (option) => option.value))
  : new Set();
const rangeInputs = document.querySelectorAll('input[type="range"][data-output]');
const toggleInputs = document.querySelectorAll(
  'input[type="checkbox"][data-toggle-output]'
);
const tableRowChecks = document.querySelectorAll(
  'input[type="checkbox"][data-row-select]'
);
const tabLists = document.querySelectorAll('[role="tablist"]');
const multiSelects = document.querySelectorAll("[data-multi-select]");
const removableBadgeGroups = document.querySelectorAll("[data-removable-badges]");
const inspectionTriggers = document.querySelectorAll("[data-inspection-trigger]");
const swatchToggles = document.querySelectorAll("[data-swatch-toggle]");
const inspectionModal = document.querySelector("#inspection-modal");
const inspectionModalTitle = document.querySelector("#inspection-modal-title");
const inspectionModalDescription = document.querySelector("#inspection-modal-description");
const inspectionModalValue = document.querySelector("#inspection-modal-value");
const inspectionModalCopy = document.querySelector("#inspection-modal-copy");
const inspectionModalStatus = document.querySelector("#inspection-modal-status");

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

const syncContentWidthUi = (contentWidthKey) => {
  const nextContentWidth = contentWidthOptions.has(contentWidthKey)
    ? contentWidthKey
    : "standard";

  root.dataset.contentWidth = nextContentWidth;

  if (contentWidthSelector) {
    contentWidthSelector.value = nextContentWidth;
  }
};

syncContentWidthUi(root.dataset.contentWidth);

if (contentWidthSelector) {
  contentWidthSelector.addEventListener("change", () => {
    syncContentWidthUi(contentWidthSelector.value);

    try {
      localStorage.setItem("styleguid-content-width", contentWidthSelector.value);
    } catch (error) {
      console.warn("Content width preference unavailable.", error);
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

tableRowChecks.forEach((rowCheck) => {
  const row = rowCheck.closest("tr");

  if (!row) {
    return;
  }

  const syncRow = () => {
    row.dataset.selected = rowCheck.checked ? "true" : "false";
    row.setAttribute("aria-selected", String(rowCheck.checked));
  };

  syncRow();
  rowCheck.addEventListener("change", syncRow);
});

multiSelects.forEach((multiSelect) => {
  const summary = multiSelect.querySelector("[data-multi-select-summary]");
  const options = Array.from(
    multiSelect.querySelectorAll("[data-multi-select-option]")
  );
  const actionButtons = multiSelect.querySelectorAll(
    "[data-multi-select-action]"
  );

  if (!summary || options.length === 0) {
    return;
  }

  const syncMultiSelect = () => {
    const selectedOptions = options.filter((option) => option.checked);

    options.forEach((option) => {
      const optionLabel = option.closest(".dropdown-multi-select-option");

      if (optionLabel) {
        optionLabel.classList.toggle("is-selected", option.checked);
      }
    });

    if (selectedOptions.length === 0) {
      summary.textContent = "No options selected";
    } else if (selectedOptions.length === 1) {
      summary.textContent = `${selectedOptions[0].value} selected`;
    } else {
      summary.textContent = `${selectedOptions.length} options selected`;
    }
  };

  options.forEach((option) => {
    option.addEventListener("change", syncMultiSelect);
  });

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const shouldCheck = button.dataset.multiSelectAction === "all";

      options.forEach((option) => {
        option.checked = shouldCheck;
      });

      syncMultiSelect();
    });
  });

  syncMultiSelect();
});

removableBadgeGroups.forEach((badgeGroup) => {
  badgeGroup.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const action = target.closest("[data-remove-badge]");

    if (!action || !badgeGroup.contains(action)) {
      return;
    }

    const badge = action.closest(".removable-badge");

    if (!badge) {
      return;
    }

    badge.remove();

    if (badgeGroup.querySelector(".removable-badge")) {
      return;
    }

    const emptyState = document.createElement("span");
    emptyState.className = "helper-text";
    emptyState.textContent = "all assignments removed";
    badgeGroup.append(emptyState);
  });
});

swatchToggles.forEach((swatchToggle) => {
  swatchToggle.addEventListener("click", () => {
    const isPressed = swatchToggle.getAttribute("aria-pressed") === "true";

    swatchToggle.setAttribute("aria-pressed", String(!isPressed));
  });
});

const openInspectionModal = ({ trigger }) => {
  if (
    !inspectionModal
    || !inspectionModalTitle
    || !inspectionModalDescription
    || !inspectionModalValue
  ) {
    return;
  }

  inspectionModalTitle.textContent = trigger.dataset.inspectionTitle ?? "Inspect";
  inspectionModalDescription.textContent =
    trigger.dataset.inspectionDescription ?? "Full value for inspection.";
  inspectionModalValue.value = trigger.dataset.inspectionValue ?? "";

  if (inspectionModalCopy) {
    inspectionModalCopy.textContent = trigger.dataset.inspectionCopyLabel ?? "Copy";
  }

  if (inspectionModalStatus) {
    inspectionModalStatus.textContent = "ready";
  }

  if (typeof inspectionModal.showModal === "function") {
    if (!inspectionModal.open) {
      inspectionModal.showModal();
    }
  } else {
    inspectionModal.setAttribute("open", "");
  }

  inspectionModalValue.focus();
};

inspectionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openInspectionModal({ trigger });
  });
});

if (inspectionModal) {
  const closeInspectionModal = () => {
    if (typeof inspectionModal.close === "function") {
      inspectionModal.close();
    } else {
      inspectionModal.removeAttribute("open");
    }
  };

  inspectionModal.addEventListener("click", (event) => {
    if (event.target === inspectionModal) {
      closeInspectionModal();
    }
  });

  inspectionModal.addEventListener("close", () => {
    if (inspectionModalStatus) {
      inspectionModalStatus.textContent = "ready";
    }
  });
}

if (inspectionModalCopy && inspectionModalValue) {
  inspectionModalCopy.addEventListener("click", () => {
    if (!navigator.clipboard) {
      if (inspectionModalStatus) {
        inspectionModalStatus.textContent = "copy unavailable";
      }

      return;
    }

    void navigator.clipboard.writeText(inspectionModalValue.value).then(() => {
      if (inspectionModalStatus) {
        inspectionModalStatus.textContent = "copied";
      }
    }).catch((error) => {
      if (inspectionModalStatus) {
        inspectionModalStatus.textContent = "copy failed";
      }

      console.warn("Clipboard unavailable.", error);
    });
  });
}

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
