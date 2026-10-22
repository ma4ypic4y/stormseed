export const ALGORITHM = 'stormseed-v1';
export const MAX_ABS = 999999999;
const enc = new TextEncoder();
export function bytesToHex(bytes) { return [...bytes].map(x => x.toString(16).padStart(2, '0')).join(''); }
export async function sha256(text) { return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)))); }
export function validateRange(min, max) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || Math.abs(min) > MAX_ABS || Math.abs(max) > MAX_ABS) throw new Error('Use whole numbers between −999,999,999 and 999,999,999.');
  if (min > max) throw new Error('The first number must be smaller than or equal to the last.');
  return max - min + 1;
}
// Reject the short remainder so every residue has exactly the same number of preimages.
export function mapWord(word, span) {
  if (!Number.isInteger(span) || span < 1 || span > 0x100000000) throw new Error('Invalid span');
  const limit = Math.floor(0x100000000 / span) * span;
  return word < limit ? word % span : null;
}
export async function derive(seed, nonce, min, max) {
  const span = validateRange(min, max);
  if (!/^[a-f0-9]{64}$/.test(seed) || !/^[a-f0-9]{64}$/.test(nonce)) throw new Error('Invalid random input.');
  for (let counter = 0; counter < 10000; counter++) {
    const digest = await sha256(JSON.stringify([ALGORITHM, seed, nonce, min, max, counter]));
    for (let offset = 0; offset < 64; offset += 8) {
      const index = mapWord(parseInt(digest.slice(offset, offset + 8), 16), span);
      if (index !== null) return { value: min + index, digest, counter, offset };
    }
  }
  throw new Error('Could not sample a result. Try again.');
}
export async function parseSnapshot(wrapper) {
  if (typeof wrapper.material !== 'string' || wrapper.material.length > 5000000 || await sha256(wrapper.material) !== wrapper.digest) throw new Error('Lightning snapshot integrity check failed.');
  const data = JSON.parse(wrapper.material);
  if (data.version !== 1 || !Array.isArray(data.flashes) || !data.flashes.length || !Array.isArray(data.sources) || !data.sources.length || !Number.isFinite(Date.parse(data.observedEnd))) throw new Error('Lightning snapshot is incomplete.');
  for (const source of data.sources) {
    if (!/^https:\/\/noaa-goes(18|19)\.s3\.amazonaws\.com\/GLM-L2-LCFA\/.*\.nc$/.test(source.url) || !/^[a-f0-9]{64}$/.test(source.sha256)) throw new Error('Unexpected observation source.');
  }
  for (const flash of data.flashes) {
    if (!Number.isInteger(flash.source) || !data.sources[flash.source] || !Number.isFinite(flash.lat) || !Number.isFinite(flash.lon) || Math.abs(flash.lat)>90 || Math.abs(flash.lon)>180 || !Number.isFinite(Date.parse(flash.time))) throw new Error('Invalid observation.');
  }
  return { ...data, seed: wrapper.digest };
}
export function parseChoices(text) {
  const rows = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (rows.length < 2) throw new Error('Add at least two choices, one per line.');
  if (rows.length > 200) throw new Error('Use up to 200 choices.');
  if (rows.some(x => x.length > 100)) throw new Error('Keep each choice under 100 characters.');
  return rows;
}
export function dataAge(iso, now = Date.now()) {
  const ms = now - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < -300000) return { label: 'Check observation time', stale: true };
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const label = minutes < 1 ? 'Observed less than a minute ago' : minutes < 60 ? `Observed ${minutes} min ago` : minutes < 1440 ? `Observed ${Math.floor(minutes / 60)}h ${minutes % 60}m ago` : `Observed ${Math.floor(minutes / 1440)} days ago`;
  return { label, stale: ms > 7200000 };
}
