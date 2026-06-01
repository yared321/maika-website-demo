# MAIKA Website

Interactive Maika demo (face scan + adaptive music) with API routes for verify and face-assess proxy.

## Local development

```bash
cp .env.example .env.local   # set MAIKA_RPPG_UPSTREAM for face-scan uploads
./run.sh                     # or: npm run dev
```

Open **http://localhost:3040/** — the dev server proxies `/api/face-assess/*` to your upstream.

## Deploy

Static output is in `site/` (`index.html` at the root of that folder).

**Cloudflare Pages** (Dashboard → your project → Settings → Builds):

| Setting | Value |
|---------|--------|
| Build command | *(leave empty)* |
| Build output directory | `site` |
| Root directory | `/` (repo root) |

Do not rewrite `/` to `/demo/index.html` — the app lives at `site/index.html`. After changing `_redirects`, redeploy.

For production face-scan uploads you still need a reverse proxy to `MAIKA_RPPG_UPSTREAM` (see `scripts/README.proxy.md`).

## Structure

- `site/`: static site (`/` serves the demo via `_redirects`)
- `scripts/`: local dev server + assess API proxy

## Demo face scan (current logic)

The demo face scan (`site/demo/`) is now **MediaPipe-only** for browser-side detection/alignment.

- Runtime: `@mediapipe/tasks-vision`
- Default model type: `landmarker`
- Upload/scoring API behavior is unchanged (this affects client-side framing/quality gating only)

### Runtime config in `site/demo/index.html`

Current flow reads these meta tags:

- `maika-mediapipe-model-type` (`landmarker` or `detector`)
- `maika-mediapipe-js-cdn`
- `maika-mediapipe-wasm-root`
- `maika-mediapipe-model-url`
- `maika-mediapipe-delegate`
- `maika-mediapipe-min-detection-confidence`

`maika-face-detector-provider` can stay in markup for compatibility, but the active flow in
`site/demo/js/controller/face_scan_flow_controller.js` configures MediaPipe explicitly.

## Face scan quality pipeline

During align + record phases, the demo evaluates:

1. Face present
2. Face centered
3. Face size in range
4. Frontal pose
5. Forehead/cheeks/nose visibility
6. Mean luminance range
7. Overexposure ratio
8. Underexposure ratio
9. Left/right luminance symmetry
10. Brightness stability over time
11. Head motion per sample
12. FPS stability
13. Optional preliminary rPPG proxy

Thresholds are defined in `site/demo/js/controller/face_scan_flow_controller.js`
and consumed by quality helpers/controllers.

## Artifact policy and restart behavior

Recording quality now uses tiered artifact handling from
`site/demo/js/controller/face_scan_artifact_policy.js`:

- **Minor** (`1-4` fail samples): keep recording, track segment
- **Moderate** (`5-24`): pause recording + extend target by `2500ms` each time
- **Major** (`25+`): stop-level quality; sustained streak (`30+`) can abort recording

Additional guard: too many pause episodes (`recordingPauseCount > 5`) also triggers abort.

### Recording time behavior

- Base usable target: `RECORD_TARGET_MS = 30000`
- Wall-clock cap: `RECORD_MAX_WALL_CLOCK_MS = 45000`
- Moderate pauses can extend usable target up to `+12000ms` total

### Manual restart UX

On quality abort, the run is discarded and the UI shows:

- recovery card (`scan-recovery`)
- **Restart camera** action (manual user-triggered restart)
- **Cancel** action

No automatic restart loop is used.

## Post-scan startup behavior

Post-music scan now uses one entry path in `site/demo/js/demo.js`:

- `startPostScanCapture(dom, state)` handles all setup and starts camera once via
  `restartFaceScanForNewRecording()`
- removed extra `requestAnimationFrame(autoStartFaceScanDirectly)` call that previously could cause duplicate camera starts

## Face scan debug logging

Enable structured logs in DevTools:

- Meta tag: `maika-face-scan-debug="true"` in `site/demo/index.html`
- Or URL: `?faceScanDebug=1`

Filter by `[Maika FaceScan]`.

## Embedding the demo (iframe)

Use embed mode to hide site header/footer and fit the wizard in a parent page:

```html
<iframe
  id="maika-demo"
  src="https://your-domain.com/?embed=1"
  title="Maika interactive demo"
  allow="camera; autoplay; fullscreen"
  loading="lazy"
  style="width:100%;min-height:720px;border:0;"
></iframe>
```

Requirements:

- Parent page must be **HTTPS** (or localhost) for camera access.
- Set `allow="camera; autoplay; fullscreen"` on the iframe.
- Use `?embed=1` on the demo URL for chromeless layout.

The demo posts height updates to the parent for auto-resize:

```javascript
window.addEventListener("message", (event) => {
  if (event.data?.type !== "maika-demo:resize") return;
  const iframe = document.getElementById("maika-demo");
  if (iframe && typeof event.data.height === "number") {
    iframe.style.height = `${event.data.height}px`;
  }
});
```

`site/_headers` sets `frame-ancestors *` on `/` so the page can be framed. Restrict to specific parent origins in `_headers` if needed (e.g. `frame-ancestors https://partner.example`).

Debug logging: set `maika-face-scan-debug="true"` in `site/demo/index.html` or add `?faceScanDebug=1` (works with or without embed mode).

## Key face-scan files

- `site/demo/js/demo.js`
- `site/demo/js/controller/face_scan_flow_controller.js`
- `site/demo/js/controller/face_scan_camera_controller.js`
- `site/demo/js/controller/face_scan_recording_controller.js`
- `site/demo/js/controller/face_scan_artifact_policy.js`
- `site/demo/js/controller/face_scan_quality_checks.js`
- `site/demo/js/controller/face_scan_quality_helpers.js`
- `site/demo/js/utils/face_scan_face_model.js`
