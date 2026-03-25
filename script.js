const rangeInput = document.querySelector("#scale-range");
const rangeOutput = document.querySelector("#range-output");
const featureToggle = document.querySelector("#feature-toggle");
const toggleState = document.querySelector("#toggle-state");
const tabLists = document.querySelectorAll('[role="tablist"]');

if (rangeInput && rangeOutput) {
  const syncRange = () => {
    rangeOutput.value = rangeInput.value;
    rangeOutput.textContent = rangeInput.value;
  };

  syncRange();
  rangeInput.addEventListener("input", syncRange);
}

if (featureToggle && toggleState) {
  const syncToggle = () => {
    toggleState.textContent = featureToggle.checked ? "enabled" : "disabled";
  };

  syncToggle();
  featureToggle.addEventListener("change", syncToggle);
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
