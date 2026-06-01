/**
 * Embed mode for /?embed=1 — chromeless layout + optional height postMessage to parent.
 */
(function () {
  function isEmbedMode() {
    try {
      var p = new URLSearchParams(globalThis.location.search);
      var v = String(p.get("embed") || "").toLowerCase();
      return v === "1" || v === "true" || v === "yes";
    } catch (_e) {
      return false;
    }
  }

  if (!isEmbedMode()) return;

  var root = globalThis.document.documentElement;
  root.classList.add("demo-embed");

  function postHeight() {
    if (globalThis.parent === globalThis) return;
    var height = Math.ceil(
      Math.max(
        root.scrollHeight,
        globalThis.document.body ? globalThis.document.body.scrollHeight : 0,
      ),
    );
    try {
      globalThis.parent.postMessage(
        { type: "maika-demo:resize", height: height },
        "*",
      );
    } catch (_e) {}
  }

  function scheduleHeightPost() {
    globalThis.requestAnimationFrame(postHeight);
  }

  globalThis.addEventListener("load", scheduleHeightPost);
  globalThis.addEventListener("resize", scheduleHeightPost);

  if ("ResizeObserver" in globalThis && globalThis.document.body) {
    new ResizeObserver(scheduleHeightPost).observe(globalThis.document.body);
  }

  if ("MutationObserver" in globalThis && globalThis.document.body) {
    new MutationObserver(scheduleHeightPost).observe(globalThis.document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  globalThis.document.addEventListener("maika-demo:face-scan-blob-ready", scheduleHeightPost);
  globalThis.document.addEventListener("maika-demo:face-upload-complete", scheduleHeightPost);
})();
