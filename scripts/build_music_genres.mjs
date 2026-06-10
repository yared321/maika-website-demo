/**
 * Regenerate site/demo/data/music_genres.json from music.json.
 * Run: node scripts/build_music_genres.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "site", "demo", "data");
const tracks = JSON.parse(readFileSync(join(root, "music.json"), "utf8"));

const GENRE_ORDER = [
  { id: "ambient", label: "Ambient" },
  { id: "neo-classical", label: "Neo-classical" },
  { id: "techno", label: "Techno" },
  { id: "nature", label: "Nature" },
  { id: "electronic chill", label: "Electronic Chill" },
  { id: "synthwave", label: "Synthwave" },
  { id: "lofi", label: "Lofi" },
  { id: "classic", label: "Classic" },
  { id: "jazz", label: "Jazz" },
  { id: "folk", label: "Folk" },
  { id: "hip-pop", label: "Hip-pop" },
  { id: "drone", label: "Drone" },
  { id: "funk", label: "Funk" },
  { id: "noise", label: "Noise" },
];

const tracksByGenre = Object.fromEntries(GENRE_ORDER.map((g) => [g.id, []]));
const trackToGenre = {};

for (const song of tracks) {
  const genre = String(song.genres?.[0] || "")
    .trim()
    .toLowerCase();
  if (!genre || !tracksByGenre[genre]) continue;
  tracksByGenre[genre].push(song.id);
  trackToGenre[song.id] = genre;
}

const genres = GENRE_ORDER.map(({ id, label }) => ({
  id,
  label,
  trackCount: tracksByGenre[id].length,
  trackIds: tracksByGenre[id],
}));

const out = {
  version: 1,
  catalog: "music.json",
  genres,
  trackToGenre,
  tracksByGenre,
};

writeFileSync(join(root, "music_genres.json"), `${JSON.stringify(out, null, 2)}\n`);

const covers = Object.fromEntries(
  tracks.filter((t) => t.title && t.image).map((t) => [t.title, t.image]),
);
writeFileSync(
  join(root, "..", "assets", "track-covers.json"),
  `${JSON.stringify(covers, null, 2)}\n`,
);

console.log("Wrote music_genres.json", genres.map((g) => `${g.label}: ${g.trackCount}`).join(", "));
console.log("Wrote track-covers.json", Object.keys(covers).length, "entries");
