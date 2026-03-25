const rangeInput = document.querySelector("#scale-range");
const rangeOutput = document.querySelector("#range-output");
const featureToggle = document.querySelector("#feature-toggle");
const toggleState = document.querySelector("#toggle-state");

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
