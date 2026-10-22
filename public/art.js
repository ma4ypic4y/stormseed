// Procedural ASCII, not a map or a reconstruction of any observed flash.
function random(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function subdivide(a, b, jitter, rng, depth = 0) {
  if (depth === 5) return [a,b];
  const mid = [(a[0]+b[0])/2+(rng()-.5)*jitter,(a[1]+b[1])/2+(rng()-.5)*jitter*.22];
  return [...subdivide(a,mid,jitter*.52,rng,depth+1).slice(0,-1), ...subdivide(mid,b,jitter*.52,rng,depth+1)];
}
function distance(x,y,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function drawAscii(canvas, seed = 'af48b6c9', width = 740, height = 820) {
  canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext('2d'); const rng=random(parseInt(seed.slice(0,8),16) || 43321);
  ctx.clearRect(0,0,width,height);
  const p=[[.59,-.06],[.47,.19],[.54,.33],[.37,.53],[.52,.73],[.40,1.06]];
  for(let i=1;i<p.length-1;i++) p[i][0]+=(rng()-.5)*.12;
  const paths=[];
  for(let i=0;i<p.length-1;i++) paths.push({points:subdivide(p[i],p[i+1],.17,rng),power:1});
  paths.push({points:subdivide(p[2],[.86,.52],.12,rng),power:.48});
  paths.push({points:subdivide(p[3],[.12,.69],.14,rng),power:.64});
  paths.push({points:subdivide(p[1],[.16,.40],.12,rng),power:.46});
  paths.push({points:subdivide(p[4],[.79,.96],.13,rng),power:.38});
  const step=8, sy=10;
  const glyphs='.:+xX080#';
  ctx.font=`${step+1}px "IBM Plex Mono", monospace`;
  ctx.textAlign='center';
  for(let y=0;y<height;y+=sy) for(let x=0;x<width;x+=step) {
    let strength=0, glow=0;
    for(const path of paths) {
      let d=2;
      for(let n=1;n<path.points.length;n++) d=Math.min(d,distance(x/width,y/height,path.points[n-1],path.points[n]));
      strength=Math.max(strength,Math.exp(-d*105)*path.power);
      glow=Math.max(glow,Math.exp(-d*17)*path.power);
    }
    const n=rng(), edge=Math.min(1,x/70,(width-x)/70,y/45,(height-y)/65);
    const haze=glow*(.38+.62*n)*edge;
    if(haze>.035) {
      ctx.fillStyle=`rgba(17,123,161,${haze*.42})`;
      ctx.fillRect(x-4,y-8,step,sy);
    }
    if(n>.38 || strength>.18) {
      const alpha=(.025+n*.025+glow*.22+strength*1.1)*edge;
      if(strength>.48) ctx.fillStyle=`rgba(221,255,241,${alpha})`;
      else if(strength>.16) ctx.fillStyle=`rgba(99,198,209,${alpha})`;
      else ctx.fillStyle=`rgba(65,144,175,${alpha})`;
      ctx.shadowColor='rgba(81,210,223,.8)'; ctx.shadowBlur=strength>.2?7:0;
      const char=glyphs[Math.min(7,Math.floor((strength*.7+n*.3)*8))];
      ctx.fillText(char,x,y);
    }
  }
  return canvas;
}
export function activateArtwork(canvas, seed) {
  drawAscii(canvas,seed);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.animate([{opacity:.45,filter:'brightness(.7)'},{opacity:1,filter:'brightness(1.18)'},{opacity:1,filter:'brightness(1)'}],{duration:850,easing:'cubic-bezier(.16,1,.3,1)'});
  }
}
