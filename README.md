# Stormseed

**[Let lightning decide →](https://ma4ypic4y.github.io/stormseed/)**

A minimal random picker seeded by real NOAA lightning observations and fresh browser randomness. Number, coin, dice and everyday choices, with procedural ASCII lightning and downloadable result cards.

Created for [@mbor1sov](https://x.com/mbor1sov). English interface, public data, no account, no paid API, no application analytics.

## Is this really random?

This is a **hybrid**, not a certified lightning-only true random number generator. Public satellite data is structured and no longer secret. Each pick mixes a snapshot digest with 32 fresh bytes from `crypto.getRandomValues`, using SHA-256 and rejection sampling. The browser supplies fresh unpredictability. We do not claim a measured min-entropy bound for lightning, NIST certification, global coverage, or audited fairness.

Read the full [research, prior art, threat model and product rationale](https://ma4ypic4y.github.io/stormseed/research.html).

## Source pipeline

`scripts/collect_lightning.py` fetches up to two recent GLM-L2-LCFA files each from `noaa-goes19` and `noaa-goes18`, using anonymous HTTPS. It searches the current and preceding two UTC hours. Good-quality, finite flash observations are retained. NetCDF packing and time units are decoded with netCDF4. Coordinates are rounded to five decimal places; energy is retained as decoded. Cross-satellite observations are not deduplicated, so counts describe observations, not unique independent flashes.

`public/data/lightning.json` contains an exact UTF-8 JSON `material` string and its SHA-256 digest. That material includes source URLs, raw file hashes, collection time, observation window, warnings and normalized flashes. The browser verifies the material hash before using it. This checksum detects inconsistency; it is not a signature or authentication proof. Source transport uses HTTPS.

The workflow refreshes and publishes at minute 17 and 47 of each hour, plus on pushes and manual runs. Schedules are best effort. If collection fails completely, the workflow fails and the currently deployed site remains untouched. Partial collection is possible and recorded in the source list and warnings. The interface labels snapshots older than two hours. The checked-in snapshot is a real reproducible bootstrap; scheduled deployments use a fresh artifact, without committing noise into the code history.

GitHub may disable schedules on public repositories after 60 days without activity. Re-enable the workflow under **Actions → Refresh lightning and publish**, and run it manually. Source outages and GitHub Actions delays are reflected by the visible age. This is a free static prototype, not an uptime-backed weather service.

## Run locally

Node 22+ and Python 3.9+:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/collect_lightning.py
npm test
npm run dev
```

Open `http://localhost:4173`. `npm run build` copies the self-contained static site to `dist/`. There are no JavaScript dependencies or build-time services. GitHub Pages must use the **GitHub Actions** deployment source.

## Reproduce a result

Generate a result, open **How it works → Can I inspect my result?**, and download the receipt. Then:

```sh
node scripts/verify_receipt.mjs path/to/receipt.json
```

The receipt includes the exact input snapshot, nonce, range, rejection counter and byte offset. For Choose mode it includes the entire choice list: keep that in mind before sharing the receipt. The verifier checks internal consistency and reproduces the answer; it does not certify that someone did not reroll or that a supplied snapshot is authentic. Check raw NOAA hashes independently when assessing provenance.

Algorithm: `SHA256(JSON.stringify(["stormseed-v1", seed, nonce, min, max, counter]))`. Read eight big-endian 32-bit words in order; reject values at or above `floor(2**32/span)*span`. First accepted word maps to `min + word % span`. If none are accepted, increment the counter. Supported inclusive endpoints: −999,999,999 to 999,999,999. Each nonempty list row is an equally weighted ticket; duplicates carry extra weight. Numeric ranges are bounded for exact JavaScript arithmetic.

The illustrated flash is selected only as a representative member of the full hashed snapshot. Its visual shape is not measured by GOES. The image is procedural ASCII art seeded by the result digest. It is not a weather map or an actual flash reconstruction.

## Design and sharing

A dark ocean-blue canvas, warm pale-green controls, self-hosted Space Grotesk and IBM Plex Mono, and a single clear action centered in a full-screen live ASCII sky. A split action key and segmented mode controls scale with the viewport; a fluid 360–600px picker replaces the former narrow fixed layout. Short screens use tighter spacing, while source metadata stays in document flow. A WebGL glyph shader continuously shimmers; every generation adds a bright branching bolt. Rendering uses a 1.5–2× canvas, pauses animation in hidden tabs, and respects reduced motion. A static canvas fallback is available when WebGL is unsupported. Semantic tabs, keyboard navigation, labelled inputs and live status announcements are included. Share exports only the selected answer and site URL; save-card produces a 1200 × 1500 PNG locally. Choices are not sent to an application server. Hosting still has ordinary request metadata.

The intended return loop is utility → decision → result card → another person trying the tool. This is a hypothesis to test with feedback, not a promise of virality. An independently verifiable future-event draw would require commitment and timestamp infrastructure; it is outside this release.

## Sources and attribution

- [NOAA GOES open data and reuse terms](https://registry.opendata.aws/noaa-goes/) — accessed October 22, 2026. JSON is derived data. No NOAA affiliation or endorsement.
- [NOAA Geostationary Lightning Mapper](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/geostationary-lightning-mapper-glm).
- [RANDOM.ORG source description](https://api.random.org/features) and [FAQ](https://www.random.org/faq/).
- [Shekari et al., RFDIDS, NDSS 2019](https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_07A-2_Shekari_paper.pdf).
- [Blitzortung project and access description](https://www.blitzortung.org/en/cover_your_area.php).
- [NIST SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final).
- [W3C Web Cryptography API](https://www.w3.org/TR/WebCryptoAPI/#Crypto-method-getRandomValues).
- Space Grotesk and IBM Plex Mono are redistributed under their SIL Open Font Licenses in `public/assets/`.
