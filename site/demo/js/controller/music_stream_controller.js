/**
 * Demo music list + playback wiring.
 *
 * Flow: demo.js imports `fetchMusicData` → runs once at startup → loads
 * `music.json` + `music_genres.json`, fills #music-select, and plays genre playlists.
 *
 * Emits `maika-demo:genre-playlist-complete` when every track in the selected genre has played.
 */
import {
  attachWaveformCanvas,
  clearWaveform,
  ensureSpectrumFromUserGesture,
  loadWaveformFromUrl,
  startSpectrumRenderLoop,
  stopSpectrumRenderLoop,
} from "./music_waveform_renderer.js";
import { t } from "../i18n/index.js";

export const MUSIC_ENDED_EVENT = "maika-demo:music-ended";
export const MUSIC_PROGRESS_EVENT = "maika-demo:music-progress";
/** Fired when every track in the selected genre playlist has played (wizard may advance). */
export const MUSIC_GENRE_PLAYLIST_COMPLETE_EVENT =
  "maika-demo:genre-playlist-complete";

/** Seconds before track end to begin loop fade-out. */
const LOOP_FADE_OUT_SEC = 2.5;
/** Milliseconds to fade volume back in after a loop restart. */
const LOOP_FADE_IN_MS = 1800;
/** Genre playlist: fade out current track in the last N seconds before advancing. */
const PLAYLIST_TRACK_FADE_OUT_SEC = 2.5;
/** Genre playlist: fade in after loading the next track. */
const PLAYLIST_TRACK_FADE_IN_MS = 1800;
/** Extra fade-out when swapping tracks if not already near silence. */
const PLAYLIST_TRACK_FADE_OUT_MS = 600;

let musicData = [];
/** From `data/music_genres.json`: genre list + track id maps. */
let musicGenresCatalog = null;
/** Wizard genre playlist: catalog indices in play order. */
let genrePlaylistMode = false;
let genrePlaylistQueue = [];
let genrePlaylistPosition = 0;
let activeGenrePlaylistId = "";
/** Bumps when a new genre playlist starts; invalidates in-flight per-track loads. */
let genrePlaylistSession = 0;
/** Prevents double advance from `ended` + `timeupdate` near track end. */
let genrePlaylistAdvancing = false;
let genrePlaylistEndHandledForPosition = -1;
let controlsBound = false;
let selectBound = false;
let selectionLocked = false;
let activeFadeRaf = 0;
let loopFadeRaf = 0;
/** When true, track restarts with crossfade instead of stopping at end. */
let loopPlaybackEnabled = false;
/** Wall-clock listening time for wizard duration gate (survives loop restarts). */
let sessionListenAccumSec = 0;
let sessionListenStartMs = 0;
/** Bumps when session resets so in-flight autoplay attempts are ignored. */
let autoplayGeneration = 0;
/** Resolves the Promise from the current `stopMusicPlayback` fade (if any). */
let activeFadeResolve = null;

function clearActiveFade() {
  if (!activeFadeRaf) return;
  globalThis.cancelAnimationFrame(activeFadeRaf);
  activeFadeRaf = 0;
}

function clearLoopFade() {
  if (!loopFadeRaf) return;
  globalThis.cancelAnimationFrame(loopFadeRaf);
  loopFadeRaf = 0;
}

function getTargetVolume() {
  const volumeSlider = document.getElementById("volume-slider");
  if (!volumeSlider) return 1;
  const v = Number(volumeSlider.value);
  return Number.isFinite(v) ? v : 1;
}

function resetSessionListenClock() {
  sessionListenAccumSec = 0;
  sessionListenStartMs = 0;
}

function markSessionListenStart() {
  const audio = getMainAudio();
  if (!audio || audio.paused || sessionListenStartMs) return;
  sessionListenStartMs = globalThis.performance.now();
}

function markSessionListenPause() {
  if (!sessionListenStartMs) return;
  sessionListenAccumSec += Math.max(
    0,
    (globalThis.performance.now() - sessionListenStartMs) / 1000,
  );
  sessionListenStartMs = 0;
}

function getTotalListenedSeconds() {
  let total = sessionListenAccumSec;
  const audio = getMainAudio();
  if (sessionListenStartMs && audio && !audio.paused) {
    total += Math.max(
      0,
      (globalThis.performance.now() - sessionListenStartMs) / 1000,
    );
  }
  return total;
}

/** Enable/disable seamless loop with fade-out at end and fade-in on restart. */
export function setMusicLoopPlayback(enabled) {
  loopPlaybackEnabled = enabled !== false;
}

function applyLoopFadeOutVolume(audio) {
  // Never touch volume while a stop-fade is running — it owns the volume ramp.
  if (activeFadeRaf) return;

  const d = audio.duration;
  const targetVol = getTargetVolume();
  if (
    !loopPlaybackEnabled ||
    !Number.isFinite(d) ||
    d <= LOOP_FADE_OUT_SEC ||
    loopFadeRaf
  ) {
    audio.volume = targetVol;
    return;
  }
  const remaining = d - audio.currentTime;
  if (remaining <= LOOP_FADE_OUT_SEC && remaining > 0.05) {
    audio.volume = Math.max(0, targetVol * (remaining / LOOP_FADE_OUT_SEC));
  } else if (remaining > LOOP_FADE_OUT_SEC) {
    audio.volume = targetVol;
  }
}

/** Ramp volume down near the end of a genre-playlist track (before advancing). */
function applyGenrePlaylistFadeOutVolume(audio) {
  if (activeFadeRaf || loopFadeRaf || genrePlaylistAdvancing) return;

  const d = audio.duration;
  const targetVol = getTargetVolume();
  if (!genrePlaylistMode || !Number.isFinite(d) || d <= PLAYLIST_TRACK_FADE_OUT_SEC) {
    return;
  }
  const remaining = d - audio.currentTime;
  if (remaining <= PLAYLIST_TRACK_FADE_OUT_SEC && remaining > 0.05) {
    audio.volume = Math.max(0, targetVol * (remaining / PLAYLIST_TRACK_FADE_OUT_SEC));
  } else if (remaining > PLAYLIST_TRACK_FADE_OUT_SEC) {
    audio.volume = targetVol;
  }
}

function waitForAudioReady(audio, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }
    const timeoutId = globalThis.setTimeout(() => {
      cleanup();
      reject(new Error("Track load timed out"));
    }, timeoutMs);
    const cleanup = () => {
      globalThis.clearTimeout(timeoutId);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Track failed to load"));
    };
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

function isGenrePlaylistSessionActive(session) {
  return genrePlaylistMode && session === genrePlaylistSession;
}

async function fadeOutPlayingAudio(audio, maxMs = PLAYLIST_TRACK_FADE_OUT_MS) {
  if (!audio || audio.paused) return;
  const targetVol = getTargetVolume();
  if (!Number.isFinite(audio.volume) || audio.volume <= 0.01) {
    audio.volume = 0;
    return;
  }
  const ratio = targetVol > 0 ? audio.volume / targetVol : 1;
  const ms = Math.max(200, Math.min(maxMs, ratio * maxMs));
  clearLoopFade();
  await fadeVolumeTo(audio, 0, ms);
}

/**
 * Load and play a genre-playlist track with fade-in.
 * @param {number} position
 * @param {number} playlistSession
 */
async function playGenrePlaylistTrackAt(position, playlistSession) {
  if (!isGenrePlaylistSessionActive(playlistSession)) return false;
  if (position < 0 || position >= genrePlaylistQueue.length) return false;

  genrePlaylistPosition = position;
  genrePlaylistEndHandledForPosition = -1;
  const trackIndex = genrePlaylistQueue[position];
  if (!selectMusicTrackByIndex(trackIndex)) return false;

  const audio = getMainAudio();
  if (!audio || !audio.getAttribute("src")) return false;

  const playBtn = document.getElementById("play-pause-btn");

  try {
    await waitForAudioReady(audio);
    if (!isGenrePlaylistSessionActive(playlistSession)) return false;

    await ensureSpectrumFromUserGesture(audio);
    if (!isGenrePlaylistSessionActive(playlistSession)) return false;

    loopPlaybackEnabled = false;
    clearLoopFade();
    audio.volume = 0;
    await audio.play();

    setDeckPlaying(true);
    if (playBtn) {
      setPlayButtonAppearance("♪", t("music.playing"));
      playBtn.disabled = true;
    }
    revealCoverArtInSlot();
    markSessionListenStart();
    startSpectrumRenderLoop();

    await fadeVolumeTo(audio, getTargetVolume(), PLAYLIST_TRACK_FADE_IN_MS);
    return isGenrePlaylistSessionActive(playlistSession);
  } catch {
    if (!isGenrePlaylistSessionActive(playlistSession)) return false;
    if (playBtn) setPlayButtonAppearance("▶", t("music.play"));
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
    return false;
  }
}

/** Fade out the current track, then load and fade in the next playlist item. */
async function transitionGenrePlaylistToPosition(nextPos, playlistSession) {
  if (!isGenrePlaylistSessionActive(playlistSession)) return false;

  const audio = getMainAudio();
  if (audio && !audio.paused) {
    await fadeOutPlayingAudio(audio);
    audio.pause();
    markSessionListenPause();
    stopSpectrumRenderLoop();
  }

  if (!isGenrePlaylistSessionActive(playlistSession)) return false;
  return playGenrePlaylistTrackAt(nextPos, playlistSession);
}

function fadeVolumeTo(audio, targetVolume, durationMs) {
  clearLoopFade();
  const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
  const startAt = globalThis.performance.now();

  return new Promise((resolve) => {
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startAt) / durationMs));
      const eased = progress * progress;
      audio.volume = startVolume + (targetVolume - startVolume) * eased;
      if (progress >= 1) {
        loopFadeRaf = 0;
        audio.volume = targetVolume;
        resolve();
        return;
      }
      loopFadeRaf = globalThis.requestAnimationFrame(tick);
    };
    loopFadeRaf = globalThis.requestAnimationFrame(tick);
  });
}

async function restartTrackWithLoopFade(audio) {
  if (!loopPlaybackEnabled || !audio) return;

  const targetVol = getTargetVolume();
  audio.currentTime = 0;
  audio.volume = 0;

  try {
    await audio.play();
    setPlayButtonAppearance("♪", t("music.playing"));
    setDeckPlaying(true);
    startSpectrumRenderLoop();
    await fadeVolumeTo(audio, targetVol, LOOP_FADE_IN_MS);
  } catch {
    setPlayButtonAppearance("▶", t("music.play"));
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
  }
}

/** Cancel an in-progress volume fade and restore volumes from #volume-slider. */
export function interruptMusicFadeOut() {
  clearActiveFade();
  clearLoopFade();
  if (typeof activeFadeResolve === "function") {
    const finish = activeFadeResolve;
    activeFadeResolve = null;
    finish();
  }
  const audio = getMainAudio();
  const fallback = document.getElementById("audio-player");
  const volumeSlider = document.getElementById("volume-slider");
  const v = (() => { const n = volumeSlider ? Number(volumeSlider.value) : NaN; return Number.isFinite(n) ? n : 1; })();
  if (audio && Number.isFinite(audio.volume)) audio.volume = v;
  if (fallback && Number.isFinite(fallback.volume)) fallback.volume = v;
}

/** Cached #music-select in the wizard. */
function getSelect() {
  return document.getElementById("music-select");
}

/** Main audio element driven by custom controls (`#main-audio`). */
function getMainAudio() {
  return document.getElementById("main-audio");
}

function getMusicDeck() {
  return document.getElementById("music-player-deck");
}

function setDeckPlaying(isPlaying) {
  const deck = getMusicDeck();
  if (!deck) return;
  deck.classList.toggle("is-playing", Boolean(isPlaying));
}

function setPlayButtonAppearance(glyph, ariaLabel) {
  const playBtn = document.getElementById("play-pause-btn");
  const playGlyph = document.getElementById("play-pause-glyph");
  if (playGlyph) playGlyph.textContent = glyph;
  else if (playBtn) playBtn.textContent = glyph;
  if (playBtn && ariaLabel) playBtn.setAttribute("aria-label", ariaLabel);
}

function setWavePanelLoading(on) {
  const el = document.getElementById("music-wave-loading");
  if (!el) return;
  el.hidden = !on;
  el.setAttribute("aria-busy", on ? "true" : "false");
}

/** Escapes plain text for safe insertion into HTML (option labels). */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Writes 0–100 into --range-fill so the track shows “elapsed” vs “remaining” /
 * loud vs quiet distinctly (paired with demo.css gradients).
 */
function setRangeFillPercent(rangeEl, percent) {
  if (!rangeEl) return;
  const p = Math.min(100, Math.max(0, percent));
  rangeEl.style.setProperty("--range-fill", `${p}%`);
}

/** Rebuilds dropdown options from `musicData` (replace, never append). Preserves a valid selection. */
function populateMusicSelect() {
  const select = getSelect();
  if (!select || !Array.isArray(musicData)) return;

  const preservedValue = select.value;

  let optionsMarkup = "";
  for (let i = 0; i < musicData.length; i += 1) {
    const song = musicData[i];
    optionsMarkup += `<option value="${i}">${escapeHtml(formatTrackOptionLabel(song))}</option>`;
  }

  select.innerHTML =
    `<option value="">${escapeHtml(t("music.selectPlaceholder"))}</option>` + optionsMarkup;

  if (preservedValue !== "" && musicData[Number(preservedValue)]) {
    select.value = preservedValue;
  }
}

/** Formats seconds as M:SS for the HUD. */
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function normalizeGenres(song) {
  if (!song) return [];
  const raw = song.genres ?? song.genre;
  if (Array.isArray(raw)) {
    return raw.map((g) => String(g || "").trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return [raw.trim()];
  }
  return [];
}

/** Dropdown label: title plus genre(s) in brackets when present. */
function formatTrackOptionLabel(song) {
  const title = typeof song?.title === "string" ? song.title : "";
  const genres = normalizeGenres(song);
  if (!genres.length) return title;
  return `${title} (${genres.join(", ")})`;
}

/** Site-root path for track cover PNGs under `site/demo/data/images/`. */
const TRACK_COVER_IMAGE_PREFIX = "/demo/data/images/";

/**
 * Turns optional `image` from the track catalog into a browser URL (absolute https or site-root
 * `/demo/...` paths).
 */
function resolveTrackImageUrl(song) {
  const raw = song?.image;
  if (!raw || typeof raw !== "string") return "";
  let t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/demo/assets/images/")) {
    t = `${TRACK_COVER_IMAGE_PREFIX}${t.slice("/demo/assets/images/".length)}`;
  } else if (t.startsWith("/assets/images/")) {
    t = `${TRACK_COVER_IMAGE_PREFIX}${t.slice("/assets/images/".length)}`;
  }
  if (t.startsWith("/")) return t;
  if (t.startsWith("site/")) return `/${t.slice("site/".length)}`;
  try {
    const base = new URL("../../data/music.json", import.meta.url).href;
    return new URL(t, base).href;
  } catch {
    return "";
  }
}

function getMusicArtSlot() {
  return document.getElementById("music-art-slot");
}

function clearCoverArt() {
  const img = document.getElementById("music-cover-art");
  const wrap = document.getElementById("music-cover-wrap");
  const slot = getMusicArtSlot();
  if (img) {
    img.onerror = null;
    img.hidden = true;
    img.removeAttribute("src");
    img.alt = "";
  }
  if (wrap) {
    wrap.classList.add("music-player__cover-wrap--empty");
    wrap.setAttribute("aria-hidden", "true");
  }
  slot?.classList.remove("is-showing-cover");
}

/** Preload cover for the selected track; shown in the art slot only after playback starts. */
function stageCoverArt(song) {
  const img = document.getElementById("music-cover-art");
  const wrap = document.getElementById("music-cover-wrap");
  const slot = getMusicArtSlot();
  if (!img || !wrap) return;

  slot?.classList.remove("is-showing-cover");
  const url = resolveTrackImageUrl(song);
  if (!url) {
    clearCoverArt();
    return;
  }

  wrap.classList.remove("music-player__cover-wrap--empty");
  wrap.setAttribute("aria-hidden", "true");
  img.alt = song?.title ? `Cover art for ${song.title}` : "";
  img.hidden = true;
  img.onerror = () => {
    img.onerror = null;
    clearCoverArt();
  };
  img.src = url;
}

function revealCoverArtInSlot() {
  const img = document.getElementById("music-cover-art");
  const wrap = document.getElementById("music-cover-wrap");
  const slot = getMusicArtSlot();
  if (!img || !wrap || !slot) return;
  if (wrap.classList.contains("music-player__cover-wrap--empty") || !img.getAttribute("src")) {
    return;
  }

  img.hidden = false;
  wrap.setAttribute("aria-hidden", "false");
  slot.classList.add("is-showing-cover");
}

/** Updates visible title row for the picked track. */
function updateNowPlaying(song) {
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const genresEl = document.getElementById("genre-tags");
  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) {
    const artist = typeof song?.artist === "string" ? song.artist.trim() : "";
    artistEl.textContent = artist;
    artistEl.hidden = !artist;
  }
  if (genresEl) {
    const genres = normalizeGenres(song);
    if (genres.length > 0) {
      genresEl.innerHTML = genres
        .map((genre) => `<span class="music-player__genre-chip">${escapeHtml(genre)}</span>`)
        .join("");
      genresEl.hidden = false;
    } else {
      genresEl.innerHTML = "";
      genresEl.hidden = true;
    }
  }
  stageCoverArt(song);
}

function normalizeGenreKey(genre) {
  return String(genre || "").trim().toLowerCase();
}

function buildTrackIdToIndexMap() {
  const map = new Map();
  for (let i = 0; i < musicData.length; i += 1) {
    const id = musicData[i]?.id;
    if (id) map.set(id, i);
  }
  return map;
}

/** Catalog indices for a genre (order from music_genres.json). */
function resolveGenrePlaylistIndices(genreId) {
  const want = normalizeGenreKey(genreId);
  if (!want) return [];

  const catalogEntry = musicGenresCatalog?.genres?.find((g) => g.id === want);
  const trackIds = catalogEntry?.trackIds;
  if (Array.isArray(trackIds) && trackIds.length > 0) {
    const idToIndex = buildTrackIdToIndexMap();
    const indices = [];
    for (const trackId of trackIds) {
      const idx = idToIndex.get(trackId);
      if (Number.isFinite(idx)) indices.push(idx);
    }
    if (indices.length) return indices;
  }

  return findTrackIndicesByGenre(want);
}

function clearGenrePlaylistState() {
  genrePlaylistMode = false;
  genrePlaylistQueue = [];
  genrePlaylistPosition = 0;
  activeGenrePlaylistId = "";
  genrePlaylistAdvancing = false;
  genrePlaylistEndHandledForPosition = -1;
  genrePlaylistSession += 1;
}

function finishGenrePlaylistPlayback() {
  const genre = activeGenrePlaylistId;
  clearGenrePlaylistState();
  loopPlaybackEnabled = false;

  const audio = getMainAudio();
  const playBtn = document.getElementById("play-pause-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");

  markSessionListenPause();
  if (audio) {
    audio.pause();
  }
  if (playBtn) {
    setPlayButtonAppearance("▶", t("music.play"));
    playBtn.disabled = false;
  }
  setDeckPlaying(false);
  stopSpectrumRenderLoop();
  if (progressBar) {
    setRangeFillPercent(progressBar, 0);
    progressBar.value = "0";
  }
  if (currentTimeEl) currentTimeEl.textContent = "0:00";

  document.dispatchEvent(
    new CustomEvent(MUSIC_GENRE_PLAYLIST_COMPLETE_EVENT, {
      bubbles: true,
      detail: { genre },
    }),
  );
}

/**
 * @param {{ forGenrePlaylist?: boolean }} [options]
 */
async function playCurrentSelectedTrack(options = {}) {
  const forGenrePlaylist = options.forGenrePlaylist === true;
  const gen = forGenrePlaylist ? autoplayGeneration : ++autoplayGeneration;
  const playlistSession = forGenrePlaylist ? genrePlaylistSession : 0;
  const audio = getMainAudio();
  if (!audio || !audio.getAttribute("src")) return false;

  try {
    await waitForAudioReady(audio);
    if (forGenrePlaylist) {
      if (playlistSession !== genrePlaylistSession || !genrePlaylistMode) return false;
    } else if (gen !== autoplayGeneration) {
      return false;
    }
    if (!audio.getAttribute("src")) return false;

    await ensureSpectrumFromUserGesture(audio);
    if (forGenrePlaylist) {
      if (playlistSession !== genrePlaylistSession || !genrePlaylistMode) return false;
    } else if (gen !== autoplayGeneration) {
      return false;
    }

    startSpectrumRenderLoop();
    loopPlaybackEnabled = false;
    await audio.play();
    return true;
  } catch {
    if (forGenrePlaylist) {
      if (playlistSession !== genrePlaylistSession || !genrePlaylistMode) return false;
    } else if (gen !== autoplayGeneration) {
      return false;
    }
    const playBtn = document.getElementById("play-pause-btn");
    if (playBtn) setPlayButtonAppearance("▶", t("music.play"));
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
    return false;
  }
}

/** Play genre playlist tracks from `startPos` until one starts or the queue is exhausted. */
async function advanceGenrePlaylistFrom(startPos) {
  if (!genrePlaylistMode || startPos < 0 || startPos >= genrePlaylistQueue.length) {
    return false;
  }

  loopPlaybackEnabled = false;
  const session = genrePlaylistSession;
  for (let pos = startPos; pos < genrePlaylistQueue.length; pos += 1) {
    if (!isGenrePlaylistSessionActive(session)) return false;
    const played = await playGenrePlaylistTrackAt(pos, session);
    if (played) return true;
  }

  finishGenrePlaylistPlayback();
  return false;
}

async function onGenrePlaylistTrackEnded() {
  if (!genrePlaylistMode || genrePlaylistAdvancing) return;

  genrePlaylistAdvancing = true;
  const session = genrePlaylistSession;
  try {
    const nextPos = genrePlaylistPosition + 1;
    if (nextPos >= genrePlaylistQueue.length) {
      const audio = getMainAudio();
      if (audio && !audio.paused) {
        await fadeOutPlayingAudio(audio, PLAYLIST_TRACK_FADE_IN_MS);
        audio.pause();
      }
      finishGenrePlaylistPlayback();
      return;
    }
    await transitionGenrePlaylistToPosition(nextPos, session);
  } finally {
    genrePlaylistAdvancing = false;
  }
}

function maybeAdvanceGenrePlaylistNearEnd(audio) {
  if (!genrePlaylistMode || genrePlaylistAdvancing || !audio) return;
  const d = audio.duration;
  if (!Number.isFinite(d) || d <= 0.5) return;
  if (audio.currentTime < d - 0.25) return;
  if (genrePlaylistEndHandledForPosition === genrePlaylistPosition) return;
  genrePlaylistEndHandledForPosition = genrePlaylistPosition;
  void onGenrePlaylistTrackEnded();
}

/**
 * Hooks play-only controls — once only.
 * Bails early if markup is incomplete; does not toggle `controlsBound` on failure so a later retry is possible.
 */
function bindAudioControlsOnce() {
  if (controlsBound) return;

  const audio = getMainAudio();
  const playBtn = document.getElementById("play-pause-btn");
  const prevBtn = document.getElementById("prev-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");
  const volumeSlider = document.getElementById("volume-slider");

  if (
    !audio ||
    !playBtn ||
    !rewindBtn ||
    !forwardBtn ||
    !progressBar ||
    !currentTimeEl ||
    !volumeSlider
  ) {
    return;
  }

  controlsBound = true;

  // Restrict controls to "play only" flow.
  if (prevBtn) prevBtn.hidden = true;
  if (nextBtn) nextBtn.hidden = true;
  if (rewindBtn) rewindBtn.hidden = true;
  if (forwardBtn) forwardBtn.hidden = true;
  rewindBtn.disabled = true;
  forwardBtn.disabled = true;
  progressBar.disabled = true;
  setPlayButtonAppearance("▶", t("music.playSelected"));
  playBtn.disabled = true;

  playBtn.addEventListener("click", () => {
    if (getSelect().value === "" || !audio.paused) return;
    setPlayButtonAppearance("⏳", t("music.starting"));
    playBtn.disabled = true;
    void (async () => {
      try {
        if (genrePlaylistMode) loopPlaybackEnabled = false;
        await ensureSpectrumFromUserGesture(audio);
        startSpectrumRenderLoop();
        await audio.play();
      } catch {
        setPlayButtonAppearance("▶", t("music.playSelected"));
        playBtn.disabled = false;
        setDeckPlaying(false);
        stopSpectrumRenderLoop();
      }
    })();
  });

  audio.addEventListener("play", () => {
    setDeckPlaying(true);
    setPlayButtonAppearance("♪", t("music.playing"));
    playBtn.disabled = true;
    revealCoverArtInSlot();
    markSessionListenStart();
    startSpectrumRenderLoop();
  });

  audio.addEventListener("pause", () => {
    markSessionListenPause();
    stopSpectrumRenderLoop();
    setDeckPlaying(false);
  });

  audio.addEventListener("ended", () => {
    if (genrePlaylistMode && genrePlaylistQueue.length > 0) {
      if (genrePlaylistEndHandledForPosition !== genrePlaylistPosition) {
        genrePlaylistEndHandledForPosition = genrePlaylistPosition;
      }
      void onGenrePlaylistTrackEnded();
      return;
    }
    if (loopPlaybackEnabled) {
      void restartTrackWithLoopFade(audio);
      return;
    }
    markSessionListenPause();
    setPlayButtonAppearance("▶", t("music.play"));
    playBtn.disabled = false;
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
    setRangeFillPercent(progressBar, 0);
    progressBar.value = "0";
    currentTimeEl.textContent = "0:00";
    document.dispatchEvent(
      new CustomEvent(MUSIC_ENDED_EVENT, { bubbles: true }),
    );
  });

  audio.addEventListener("timeupdate", () => {
    const d = audio.duration;
    if (genrePlaylistMode) {
      applyGenrePlaylistFadeOutVolume(audio);
      maybeAdvanceGenrePlaylistNearEnd(audio);
    } else {
      applyLoopFadeOutVolume(audio);
    }
    const progress =
      Number.isFinite(d) && d > 0 ? (audio.currentTime / d) * 100 : 0;
    progressBar.value = String(progress || 0);
    setRangeFillPercent(progressBar, progress);
    currentTimeEl.textContent = formatTime(audio.currentTime);
    document.dispatchEvent(
      new CustomEvent(MUSIC_PROGRESS_EVENT, {
        bubbles: true,
        detail: {
          currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
          duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          listenedSeconds: getTotalListenedSeconds(),
        },
      }),
    );
  });

  // Keep seek interaction code for future use, but disable dragging for now.
  // progressBar.addEventListener("input", () => {
  //   const d = audio.duration;
  //   const pct = Number(progressBar.value);
  //   setRangeFillPercent(progressBar, pct);
  //   if (!Number.isFinite(d) || d <= 0) return;
  //   audio.currentTime = (pct / 100) * d;
  // });

  // Keep skip controls code for future use, but disable/hide these controls for now.
  // rewindBtn.addEventListener("click", () => {
  //   audio.currentTime = Math.max(0, audio.currentTime - 10);
  // });
  // forwardBtn.addEventListener("click", () => {
  //   const d = audio.duration;
  //   if (Number.isFinite(d) && d > 0) {
  //     audio.currentTime = Math.min(d, audio.currentTime + 10);
  //   } else {
  //     audio.currentTime += 10;
  //   }
  // });

  const initVol = Number.isFinite(Number(volumeSlider.value)) ? Number(volumeSlider.value) : 1;
  audio.volume = initVol;
  setRangeFillPercent(volumeSlider, initVol * 100);
  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value);
    setRangeFillPercent(volumeSlider, (Number(volumeSlider.value) || 0) * 100);
  });
}

/**
 * Applies URL + resets HUD after #music-select change; empty selection clears playback.
 */
function onMusicSelectChange() {
  const select = getSelect();
  const audio = getMainAudio();
  const fallback = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-pause-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");

  if (!select || !audio) return;

  const idx = select.value;

  if (idx === "") {
    if (selectionLocked) {
      return;
    }
    audio.pause();
    audio.removeAttribute("src");
    if (fallback) {
      fallback.pause();
      fallback.removeAttribute("src");
    }
    if (progressBar) {
      progressBar.value = "0";
      setRangeFillPercent(progressBar, 0);
    }
    if (currentTimeEl) currentTimeEl.textContent = "0:00";
    if (playBtn) playBtn.disabled = true;
    setPlayButtonAppearance("▶", t("music.playSelected"));
    setDeckPlaying(false);
    setWavePanelLoading(false);
    clearWaveform();
    clearCoverArt();
    return;
  }

  const song = musicData[Number(idx)];
  if (!song?.url) return;

  if (!selectionLocked) {
    selectionLocked = true;
    select.disabled = true;
  }

  audio.pause();
  if (playBtn) {
    setPlayButtonAppearance("▶", t("music.playSelected"));
    playBtn.disabled = true;
  }
  setWavePanelLoading(true);
  audio.src = song.url;
  audio.preload = "auto";
  audio.load();
  if (fallback) {
    fallback.src = song.url;
    fallback.preload = "auto";
    fallback.load();
  }

  if (progressBar) {
    progressBar.value = "0";
    setRangeFillPercent(progressBar, 0);
  }
  if (currentTimeEl) currentTimeEl.textContent = "0:00";

  updateNowPlaying(song);
  void loadWaveformFromUrl(song.url);

  const markPlayable = () => {
    if (playBtn && getSelect().value !== "") {
      setPlayButtonAppearance("▶", t("music.playSelected"));
      playBtn.disabled = false;
    }
    setWavePanelLoading(false);
  };

  const markFailed = () => {
    if (playBtn && getSelect().value !== "") {
      setPlayButtonAppearance("⚠", t("music.unableToLoad"));
      playBtn.disabled = true;
    }
    setWavePanelLoading(false);
    clearWaveform();
  };

  audio.addEventListener("canplay", markPlayable, { once: true });
  audio.addEventListener("loadeddata", markPlayable, { once: true });
  audio.addEventListener("error", markFailed, { once: true });
}

/** Registers a single listener on #music-select. */
function bindMusicSelectOnce() {
  const select = getSelect();
  if (!select || selectBound) return;
  selectBound = true;
  select.addEventListener("change", onMusicSelectChange);
}

/**
 * Loads `data/music.json` + `data/music_genres.json` and initializes the picker + player.
 */
export async function fetchMusicData() {
  try {
    const dataBase = new URL("../../data/", import.meta.url);
    const [tracksRes, genresRes] = await Promise.all([
      fetch(new URL("music.json", dataBase).href),
      fetch(new URL("music_genres.json", dataBase).href),
    ]);
    const data = await tracksRes.json();
    musicData = Array.isArray(data) ? data : [];
    try {
      musicGenresCatalog = await genresRes.json();
    } catch {
      musicGenresCatalog = null;
    }
    populateMusicSelect();
    bindMusicSelectOnce();
    bindAudioControlsOnce();
    const wf = document.getElementById("music-waveform-canvas");
    if (wf) attachWaveformCanvas(wf, getMainAudio);
    const pb = document.getElementById("progress-bar");
    const vs = document.getElementById("volume-slider");
    setRangeFillPercent(pb, pb ? Number(pb.value) || 0 : 0);
    setRangeFillPercent(vs, vs ? (Number(vs.value) || 0) * 100 : 100);
  } catch (_error) {
    musicData = [];
    musicGenresCatalog = null;
    populateMusicSelect();
  }
}

export function stopMusicPlayback(options = {}) {
  const audio = getMainAudio();
  const fallback = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-pause-btn");

  const stopNow = () => {
    clearActiveFade();
    clearLoopFade();
    activeFadeResolve = null;
    markSessionListenPause();
    loopPlaybackEnabled = false;
    clearGenrePlaylistState();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (fallback) {
      fallback.pause();
      fallback.currentTime = 0;
    }
    if (playBtn) {
      setPlayButtonAppearance("▶", t("music.play"));
    }
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
  };

  const fadeOutMs = Math.max(0, Number(options.fadeOutMs) || 0);
  const fadeTargets = [audio, fallback]
    .filter(
      (el) =>
        el &&
        !el.paused &&
        Number.isFinite(el.volume) &&
        el.volume > 0,
    )
    .map((el) => ({ el, startVolume: el.volume }));

  if (fadeOutMs === 0 || fadeTargets.length === 0) {
    stopNow();
    return Promise.resolve();
  }

  clearActiveFade();
  const startAt = globalThis.performance.now();

  return new Promise((resolve) => {
    const restoreVolumes = () => {
      for (const target of fadeTargets) {
        target.el.volume = target.startVolume;
      }
    };

    const finishFade = () => {
      activeFadeResolve = null;
      stopNow();
      restoreVolumes();
      resolve();
    };

    activeFadeResolve = finishFade;

    const tick = (now) => {
      const allPaused = fadeTargets.every((target) => target.el.paused);
      if (allPaused) {
        finishFade();
        return;
      }

      const elapsed = Math.max(0, now - startAt);
      const progress = Math.min(1, elapsed / fadeOutMs);
      // Ease-out curve: volume drops quickly at first then tails off smoothly into
      // silence, which is how the human ear expects a natural fade to feel and
      // avoids the abrupt click that an ease-in curve produces near the end.
      const remaining = 1 - progress;
      const multiplier = remaining * remaining;
      for (const target of fadeTargets) {
        target.el.volume = Math.max(0, target.startVolume * multiplier);
      }

      if (progress >= 1) {
        finishFade();
        return;
      }
      activeFadeRaf = globalThis.requestAnimationFrame(tick);
    };

    activeFadeRaf = globalThis.requestAnimationFrame(tick);
  });
}

/**
 * Full demo reset: unlock track picker, clear sources, HUD, and “now playing” labels.
 * Call when returning to landing (e.g. wizard Done) so the next run starts clean.
 */
/**
 * Load a track by catalog index (used by guided auto-play; #music-select may be hidden).
 * @param {number} index
 * @returns {boolean}
 */
export function selectMusicTrackByIndex(index) {
  const select = getSelect();
  if (!select || !musicData[Number(index)]) return false;
  select.value = String(index);
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/** Picks a random catalog track and loads it into the player. */
export function selectRandomMusicTrack() {
  if (!musicData.length) return false;
  const idx = Math.floor(Math.random() * musicData.length);
  return selectMusicTrackByIndex(idx);
}

function formatGenreLabel(genre) {
  return String(genre || "")
    .split("-")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join("-");
}

function sortGenresByTrackCount(genres) {
  return genres.sort((a, b) => {
    const diff = (b.trackCount || 0) - (a.trackCount || 0);
    return diff !== 0 ? diff : a.label.localeCompare(b.label);
  });
}

/** Genre entries for the landing picker (from music_genres.json when loaded). */
export function getAvailableGenres() {
  const catalog = musicGenresCatalog?.genres;
  if (Array.isArray(catalog) && catalog.length > 0) {
    return sortGenresByTrackCount(
      catalog
        .filter((g) => g.trackCount > 0)
        .map((g) => ({
          id: g.id,
          label: g.label || formatGenreLabel(g.id),
          trackCount: g.trackCount,
        })),
    );
  }
  const seen = new Set();
  for (const song of musicData) {
    for (const genre of normalizeGenres(song)) {
      seen.add(genre.toLowerCase());
    }
  }
  return sortGenresByTrackCount(
    Array.from(seen).map((id) => ({
      id,
      label: formatGenreLabel(id),
      trackCount: findTrackIndicesByGenre(id).length,
    })),
  );
}

/** Fills the landing-page genre picker from the genre catalog. */
export function populateLandingGenreSelect(selectEl) {
  if (!selectEl) return;
  const genres = getAvailableGenres();
  selectEl.innerHTML = "";
  if (!genres.length) {
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = t("landing.access.genreEmpty");
    selectEl.appendChild(empty);
    selectEl.disabled = true;
    return;
  }
  selectEl.disabled = false;
  for (const genre of genres) {
    const opt = document.createElement("option");
    opt.value = genre.id;
    const count =
      Number.isFinite(genre.trackCount) && genre.trackCount > 0
        ? ` (${genre.trackCount})`
        : "";
    opt.textContent = `${genre.label}${count}`;
    selectEl.appendChild(opt);
  }
}

function findTrackIndicesByGenre(genre) {
  const want = String(genre || "").trim().toLowerCase();
  if (!want) return [];
  const out = [];
  for (let i = 0; i < musicData.length; i += 1) {
    const song = musicData[i];
    if (normalizeGenres(song).some((g) => g.toLowerCase() === want)) {
      out.push(i);
    }
  }
  return out;
}

/** Picks a random track for the given genre tag. */
export function selectRandomMusicTrackByGenre(genre) {
  const matches = findTrackIndicesByGenre(genre);
  if (!matches.length) return selectRandomMusicTrack();
  const idx = matches[Math.floor(Math.random() * matches.length)];
  return selectMusicTrackByIndex(idx);
}

async function autoplaySelectedMusicTrack(selectTrackFn) {
  const gen = ++autoplayGeneration;
  const audio = getMainAudio();
  if (!audio || !selectTrackFn()) return false;

  const waitForReady = () =>
    new Promise((resolve, reject) => {
      if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        resolve();
        return;
      }
      const timeoutMs = 45000;
      const timeoutId = globalThis.setTimeout(() => {
        cleanup();
        reject(new Error("Track load timed out"));
      }, timeoutMs);
      const cleanup = () => {
        globalThis.clearTimeout(timeoutId);
        audio.removeEventListener("canplay", onReady);
        audio.removeEventListener("loadeddata", onReady);
        audio.removeEventListener("error", onError);
      };
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Track failed to load"));
      };
      audio.addEventListener("canplay", onReady, { once: true });
      audio.addEventListener("loadeddata", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
    });

  try {
    await waitForReady();
    if (gen !== autoplayGeneration) return false;
    if (!audio.getAttribute("src")) return false;

    await ensureSpectrumFromUserGesture(audio);
    if (gen !== autoplayGeneration) return false;

    startSpectrumRenderLoop();
    loopPlaybackEnabled = !genrePlaylistMode;
    resetSessionListenClock();
    await audio.play();
    return true;
  } catch {
    if (gen !== autoplayGeneration) return false;
    const playBtn = document.getElementById("play-pause-btn");
    if (playBtn) setPlayButtonAppearance("▶", t("music.play"));
    setDeckPlaying(false);
    stopSpectrumRenderLoop();
    return false;
  }
}

/**
 * Pick a random track, wait until it can play, then start playback (wizard music step).
 * @returns {Promise<boolean>}
 */
export async function autoplayRandomMusicTrack() {
  clearGenrePlaylistState();
  return autoplaySelectedMusicTrack(selectRandomMusicTrack);
}

/**
 * Play one random track from the genre; advances to face scan when it ends.
 * @param {string} genre
 * @returns {Promise<boolean>}
 */
export async function autoplayMusicTrackByGenre(genre) {
  const want = normalizeGenreKey(genre);
  const indices = resolveGenrePlaylistIndices(want);
  if (!indices.length) return false;

  autoplayGeneration += 1;
  genrePlaylistSession += 1;
  activeGenrePlaylistId = want;
  genrePlaylistQueue = [indices[Math.floor(Math.random() * indices.length)]];
  genrePlaylistPosition = 0;
  genrePlaylistMode = true;
  genrePlaylistAdvancing = false;
  genrePlaylistEndHandledForPosition = -1;
  loopPlaybackEnabled = false;
  selectionLocked = true;
  resetSessionListenClock();

  return advanceGenrePlaylistFrom(0);
}

export function resetMusicDemoSession() {
  autoplayGeneration += 1;
  selectionLocked = false;
  loopPlaybackEnabled = false;
  clearGenrePlaylistState();
  clearLoopFade();
  resetSessionListenClock();

  const select = getSelect();
  const audio = getMainAudio();
  const fallback = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-pause-btn");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeEl = document.getElementById("current-time");

  if (select) {
    select.disabled = false;
    select.value = "";
  }

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
  }
  if (fallback) {
    fallback.pause();
    fallback.currentTime = 0;
    fallback.removeAttribute("src");
  }

  if (progressBar) {
    progressBar.value = "0";
    setRangeFillPercent(progressBar, 0);
  }
  if (currentTimeEl) currentTimeEl.textContent = "0:00";

  if (playBtn) {
    setPlayButtonAppearance("▶", t("music.playSelected"));
    playBtn.disabled = true;
  }

  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const genresEl = document.getElementById("genre-tags");
  if (titleEl) titleEl.textContent = t("music.defaultTitle");
  if (artistEl) {
    artistEl.textContent = "";
    artistEl.hidden = true;
  }
  if (genresEl) {
    genresEl.innerHTML = "";
    genresEl.hidden = true;
  }
  clearCoverArt();
  setDeckPlaying(false);
  setWavePanelLoading(false);
  clearWaveform();
}
