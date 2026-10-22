import { cp, mkdir, rm, stat } from 'node:fs/promises';
await stat(new URL('../public/data/lightning.json', import.meta.url));
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Built static site in dist/');
