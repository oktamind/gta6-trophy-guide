// Leonida Legend — the gta6-trophy-guide-01 entry program (Node 22, standard library only).
//
// What this entry is: a static, offline guide and tracker for the 55 PlayStation 5
// trophies of Grand Theft Auto VI, living in app/ beside this file — plain HTML, CSS
// and JavaScript with no build step, plus app/data/trophies.json holding the official
// names, descriptions and grades and a cited guide for every trophy. The screenshots
// in screenshots/ are real renders of that app in a browser.
//
// What this program does when the grader runs it: it copies app/ and screenshots/
// into the output directory and writes output/dossier.json there, using the vendored
// make.fun frontend library (vendor/makefun-frontend.ts, shipped unchanged — the
// scorer requires the dossier to be byte for byte what that library writes).
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs are identical: nothing here depends on the clock,
// randomness, or the machine, so the grader's determinism check passes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps come from the scorer's own gate: text_max_bytes shapes how much of the
// dossier text the judge reads, and the rest refuse an entry the scorer would refuse
// (more than 4 screenshots, one over 256 KiB, or app/ over its file and byte caps).
// The dossier's cover is the first screenshot by file name (1-cover.jpg).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
