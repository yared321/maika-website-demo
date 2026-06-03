/**
 * Sync wizard primary action (Next / Proceed / Done) enabled state per step.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 */
export function syncWizardNextButton(dom, state) {
  if (!dom.nextButton) return;
  if (state.currentStep === 0) {
    dom.nextButton.disabled =
      state.upload.isInFlight || !state.upload.completed;
    return;
  }
  if (state.currentStep === 1) {
    dom.nextButton.disabled = !state.musicGate.requirementMet;
    return;
  }
  if (state.currentStep === 2) {
    dom.nextButton.disabled =
      state.upload.isInFlight ||
      !state.upload.completed ||
      !state.emotionViz.postScanValenceConfirmed;
    return;
  }
  dom.nextButton.disabled = false;
}
