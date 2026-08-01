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
const searchableSelects = document.querySelectorAll("[data-searchable-select]");
const removableBadgeGroups = document.querySelectorAll("[data-removable-badges]");
const inspectionTriggers = document.querySelectorAll("[data-inspection-trigger]");
const swatchToggles = document.querySelectorAll("[data-swatch-toggle]");
const guideShell = document.querySelector(".guide-shell");
const sectionPanels = document.querySelectorAll(".guide-shell > section.panel");
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
      localStorage.setItem("phox-styleguide-theme", nextTheme);
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
      localStorage.setItem("phox-styleguide-font", fontSelector.value);
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
      localStorage.setItem("phox-styleguide-content-width", contentWidthSelector.value);
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

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Node)) {
    return;
  }

  multiSelects.forEach((multiSelect) => {
    if (!multiSelect.contains(event.target)) {
      multiSelect.removeAttribute("open");
    }
  });
});

searchableSelects.forEach((searchableSelect) => {
  const trigger = searchableSelect.querySelector("[data-searchable-select-trigger]");
  const value = searchableSelect.querySelector("[data-searchable-select-value]");
  const popover = searchableSelect.querySelector("[data-searchable-select-popover]");
  const input = searchableSelect.querySelector("[data-searchable-select-input]");
  const groups = Array.from(
    searchableSelect.querySelectorAll("[data-searchable-select-group]")
  );
  const options = Array.from(
    searchableSelect.querySelectorAll("[data-searchable-select-option]")
  );
  const emptyState = searchableSelect.querySelector("[data-searchable-select-empty]");
  const status = searchableSelect.querySelector("[data-searchable-select-status]");

  if (
    !trigger
    || !value
    || !popover
    || !input
    || !emptyState
    || !status
    || options.length === 0
  ) {
    return;
  }

  let activeOption =
    options.find((option) => option.classList.contains("is-active"))
    ?? options.find((option) => option.getAttribute("aria-selected") === "true")
    ?? options[0];

  const getVisibleOptions = () => options.filter((option) => !option.hidden);

  const setActiveOption = ({ option, shouldScroll = false }) => {
    options.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === option);
    });

    activeOption = option ?? null;

    if (activeOption) {
      input.setAttribute("aria-activedescendant", activeOption.id);

      if (shouldScroll) {
        activeOption.scrollIntoView({ block: "nearest" });
      }
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };

  const filterOptions = () => {
    const query = input.value.trim().toLocaleLowerCase();

    options.forEach((option) => {
      const searchableText = [
        option.dataset.searchableSelectLabel,
        option.dataset.searchableSelectDescription
      ].filter(Boolean).join(" ").toLocaleLowerCase();

      option.hidden = query.length > 0 && !searchableText.includes(query);
    });

    groups.forEach((group) => {
      const groupOptions = Array.from(
        group.querySelectorAll("[data-searchable-select-option]")
      );

      group.hidden = !groupOptions.some((option) => !option.hidden);
    });

    const visibleOptions = getVisibleOptions();
    const optionCount = visibleOptions.length;

    emptyState.hidden = optionCount !== 0;
    status.textContent =
      optionCount === 1
        ? "1 option available"
        : `${optionCount} options available`;

    if (!activeOption || activeOption.hidden) {
      setActiveOption({ option: visibleOptions[0] ?? null });
    }
  };

  const setOpen = ({ shouldOpen, shouldFocusInput = false }) => {
    searchableSelect.classList.toggle("is-open", shouldOpen);
    popover.hidden = !shouldOpen;
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    input.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen) {
      setActiveOption({ option: activeOption });

      if (shouldFocusInput) {
        input.focus();
      }

      return;
    }

    input.value = "";
    filterOptions();
    input.removeAttribute("aria-activedescendant");
  };

  const selectOption = ({ option }) => {
    options.forEach((candidate) => {
      candidate.setAttribute("aria-selected", String(candidate === option));
    });

    const label = option.dataset.searchableSelectLabel ?? option.textContent.trim();
    const description = option.dataset.searchableSelectDescription ?? "";

    value.textContent = description ? `${label} · ${description}` : label;
    setActiveOption({ option });
    setOpen({ shouldOpen: false });
    trigger.focus();
  };

  const moveActiveOption = ({ direction }) => {
    const visibleOptions = getVisibleOptions();

    if (visibleOptions.length === 0) {
      return;
    }

    const currentIndex = visibleOptions.indexOf(activeOption);
    const nextIndex =
      direction === "first"
        ? 0
        : (
          direction === "last"
            ? visibleOptions.length - 1
            : (
              currentIndex === -1
                ? 0
                : (currentIndex + direction + visibleOptions.length) % visibleOptions.length
            )
        );

    setActiveOption({
      option: visibleOptions[nextIndex],
      shouldScroll: true
    });
  };

  trigger.addEventListener("click", () => {
    const shouldOpen = !searchableSelect.classList.contains("is-open");

    setOpen({ shouldOpen, shouldFocusInput: shouldOpen });
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    setOpen({ shouldOpen: true, shouldFocusInput: true });
    moveActiveOption({ direction: event.key === "ArrowDown" ? 1 : -1 });
  });

  input.addEventListener("input", filterOptions);

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveOption({ direction: 1 });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveOption({ direction: -1 });
    } else if (event.key === "Home") {
      event.preventDefault();
      moveActiveOption({ direction: "first" });
    } else if (event.key === "End") {
      event.preventDefault();
      moveActiveOption({ direction: "last" });
    } else if (event.key === "Enter" && activeOption && !activeOption.hidden) {
      event.preventDefault();
      selectOption({ option: activeOption });
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen({ shouldOpen: false });
      trigger.focus();
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      selectOption({ option });
    });

    option.addEventListener("pointermove", () => {
      setActiveOption({ option });
    });
  });

  document.addEventListener("click", (event) => {
    if (
      event.target instanceof Node
      && !searchableSelect.contains(event.target)
    ) {
      setOpen({ shouldOpen: false });
    }
  });

  filterOptions();
});

const createSectionControl = ({ action, label, symbol }) => {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "button button-ghost section-control";
  button.dataset.sectionAction = action;
  button.textContent = symbol;
  button.setAttribute("aria-label", label);
  button.title = label;

  return button;
};

const updateSectionControlStates = () => {
  if (!guideShell) {
    return;
  }

  const orderedPanels = Array.from(
    guideShell.querySelectorAll(":scope > section.panel")
  );

  orderedPanels.forEach((section, index) => {
    const moveUp = section.querySelector('[data-section-action="up"]');
    const moveDown = section.querySelector('[data-section-action="down"]');

    if (moveUp) {
      moveUp.disabled = index === 0;
    }

    if (moveDown) {
      moveDown.disabled = index === orderedPanels.length - 1;
    }
  });
};

if (guideShell) {
  sectionPanels.forEach((section) => {
    const heading = section.querySelector(":scope > .section-heading");
    const headingTitle = heading?.querySelector("h2")?.textContent.trim() ?? "Untitled";

    if (!heading) {
      return;
    }

    const headingSide = document.createElement("div");
    const controls = document.createElement("div");
    const moveUp = createSectionControl({
      action: "up",
      label: `Move ${headingTitle} section up`,
      symbol: "↑"
    });
    const moveDown = createSectionControl({
      action: "down",
      label: `Move ${headingTitle} section down`,
      symbol: "↓"
    });
    const collapse = createSectionControl({
      action: "collapse",
      label: `Collapse ${headingTitle} section`,
      symbol: "−"
    });

    headingSide.className = "section-heading-side";
    controls.className = "section-controls";
    controls.setAttribute("aria-label", `${headingTitle} section controls`);
    collapse.setAttribute("aria-expanded", "true");

    Array.from(heading.children).slice(1).forEach((child) => {
      headingSide.append(child);
    });

    controls.append(moveUp, moveDown, collapse);
    headingSide.append(controls);
    heading.append(headingSide);

    controls.addEventListener("click", (event) => {
      const control = event.target.closest("[data-section-action]");

      if (!control || control.disabled) {
        return;
      }

      const action = control.dataset.sectionAction;
      const orderedPanels = Array.from(
        guideShell.querySelectorAll(":scope > section.panel")
      );
      const sectionIndex = orderedPanels.indexOf(section);

      if (action === "up" && sectionIndex > 0) {
        guideShell.insertBefore(section, orderedPanels[sectionIndex - 1]);
        updateSectionControlStates();
      } else if (
        action === "down"
        && sectionIndex < orderedPanels.length - 1
      ) {
        guideShell.insertBefore(orderedPanels[sectionIndex + 1], section);
        updateSectionControlStates();
      } else if (action === "collapse") {
        const isCollapsed = section.classList.toggle("is-collapsed");
        const nextLabel = `${
          isCollapsed ? "Expand" : "Collapse"
        } ${headingTitle} section`;

        control.textContent = isCollapsed ? "+" : "−";
        control.setAttribute("aria-expanded", String(!isCollapsed));
        control.setAttribute("aria-label", nextLabel);
        control.title = nextLabel;
      }
    });
  });

  updateSectionControlStates();
}

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
