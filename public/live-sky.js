import { drawAscii } from './art.js';
// GPU-rendered glyphs. The field is computed once per bolt; time only changes light.
const vertex=`attribute vec2 a;varying vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;uniform vec2 resolution;uniform vec2 grid;uniform sampler2D field;uniform sampler2D flashField;uniform sampler2D glyphs;uniform float time;uniform float strike;uniform float motion;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 pos=vec2(uv.x,1.-uv.y);vec2 cell=floor(pos*grid);vec2 sampleUV=(cell+.5)/grid;
 vec3 f=texture2D(field,sampleUV).rgb;vec3 s=texture2D(flashField,sampleUV).rgb;
 float n=hash(cell);float drift=sin(pos.x*8.+pos.y*5.-time*.28)+sin(pos.y*11.-pos.x*4.+time*.19);
 float breathing=.73+.20*sin(time*.85+pos.y*9.)+.12*sin(time*.56+pos.x*8.);
 float sparkle=.65+.35*sin(time*(.55+n*.7)+n*28.);
 float sky=f.g*breathing;float core=f.r*(.65+.35*sparkle);
 float sweep=exp(-pow((pos.y-(strike*1.55-.1))*5.,2.));
 float flash=step(0.,strike)*exp(-strike*2.8);float bolt=s.r*flash*(.4+sweep*3.8);
 float cloud=s.g*flash*.6;
 float alive=floor(time*1.25+n*3.)*motion;
 float index=floor(mod(n*6.+alive+core*6.+bolt*3.,12.));
 vec2 local=fract(pos*grid);float glyph=texture2D(glyphs,vec2((index+local.x)/12.,local.y)).a;
 float grain=hash(cell+floor(time*.08)*motion);
 float haze=sky*(.32+.14*drift)+cloud*.4;
 vec3 color=vec3(.015,.065,.095);
 color+=vec3(.06,.35,.49)*haze;
 float ink=.018+grain*.025+sky*.30+core*1.45;
 vec3 pigment=mix(vec3(.10,.37,.47),vec3(.61,.91,.88),smoothstep(.15,.9,core));
 color+=glyph*pigment*ink;
 color+=vec3(.34,.84,.91)*bolt*.12;
 color+=glyph*vec3(.78,1.,.93)*bolt*1.8;
 // Keep the central reading area calm without putting the tool in a panel.
 float center=exp(-pow((pos.x-.5)*3.7,2.)-pow((pos.y-.48)*1.5,2.));
 color*=1.-center*.48;
 float vignette=1.-.33*pow(length((pos-.5)*1.25),1.4);
 gl_FragColor=vec4(color*vignette,1.);
}`;
function rngFrom(seed){let n=parseInt(seed.slice(0,8),16)||4242;return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function path(a,b,rng,depth=0){if(depth===4)return[a,b];const m=[(a[0]+b[0])/2+(rng()-.5)*.15*Math.pow(.53,depth),(a[1]+b[1])/2+(rng()-.5)*.035*Math.pow(.5,depth)];return[...path(a,m,rng,depth+1).slice(0,-1),...path(m,b,rng,depth+1)];}
function makeField(cols,rows,seed){
 const rng=rngFrom(seed),flip=rng()>.5;let points=[[.75,-.08],[.63,.19],[.77,.39],[.50,.58],[.37,.82],[.45,1.08]];
 points=points.map(([x,y],i)=>[flip?1-x:x+(i>0&&i<5?(rng()-.5)*.17:0),y]);
 const segments=[];
 function add(a,b,power){const p=path(a,b,rng);for(let i=1;i<p.length;i++)segments.push([p[i-1],p[i],power]);}
 for(let i=1;i<points.length;i++)add(points[i-1],points[i],1);
 add(points[1],[flip?.91:.07,.44],.56);add(points[2],[flip?.07:.98,.64],.7);add(points[3],[flip?.93:.06,.89],.55);add(points[4],[flip?.08:.98,1.03],.4);
 const bytes=new Uint8Array(cols*rows*4);const ratio=cols*8/(rows*11);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const px=(x+.5)/cols,py=(y+.5)/rows;let core=0,glow=0;
  for(const [a,b,power] of segments){const dx=(b[0]-a[0])*ratio,dy=b[1]-a[1],vx=(px-a[0])*ratio,vy=py-a[1];const t=Math.max(0,Math.min(1,(vx*dx+vy*dy)/(dx*dx+dy*dy)));const d=Math.hypot(vx-dx*t,vy-dy*t);core=Math.max(core,Math.exp(-d*105)*power);glow=Math.max(glow,Math.exp(-d*12)*power);}
  const i=(y*cols+x)*4;bytes[i]=Math.round(core*255);bytes[i+1]=Math.round(glow*255);bytes[i+2]=Math.round(rng()*255);bytes[i+3]=255;
 }
 return bytes;
}
export function createLivingSky(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
 if(!gl){drawAscii(canvas,'29af123b',innerWidth*2,innerHeight*2);return{setSeed:seed=>drawAscii(canvas,seed,innerWidth*2,innerHeight*2),strike:seed=>drawAscii(canvas,seed,innerWidth*2,innerHeight*2)};}
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Could not create the ASCII scene.');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const locations=Object.fromEntries(['resolution','grid','field','flashField','glyphs','time','strike','motion'].map(n=>[n,gl.getUniformLocation(program,n)]));
 function texture(unit){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
 const base=texture(0),flash=texture(1),glyph=texture(2);gl.uniform1i(locations.field,0);gl.uniform1i(locations.flashField,1);gl.uniform1i(locations.glyphs,2);
 const atlas=document.createElement('canvas');atlas.width=12*40;atlas.height=56;const ctx=atlas.getContext('2d');ctx.font='34px "IBM Plex Mono", monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';[...'.:;=+xX08#%@'].concat(['*']).slice(0,12).forEach((ch,i)=>ctx.fillText(ch,i*40+20,27));gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,glyph);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
 let cols=0,rows=0,seed='19aca583',flashSeed=seed,start=performance.now(),struck=-100000,last=0,frame=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function upload(unit,t,data){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,cols,rows,0,gl.RGBA,gl.UNSIGNED_BYTE,data);}
 function render(now){
  if(now-last>32||reduce.matches){last=now;gl.uniform1f(locations.time,reduce.matches?0:(now-start)/1000);gl.uniform1f(locations.strike,reduce.matches?-1:(now-struck)/1000>4?-1:(now-struck)/1000);gl.uniform1f(locations.motion,reduce.matches?0:1);gl.drawArrays(gl.TRIANGLES,0,6);}
  if(!reduce.matches&&!document.hidden)frame=requestAnimationFrame(render);
 }
 function play(){cancelAnimationFrame(frame);last=0;render(performance.now());}
 function resize(){const dpr=Math.min(Math.max(devicePixelRatio||1,1.5),2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);cols=Math.ceil(innerWidth/(innerWidth<600?7:8));rows=Math.ceil(innerHeight/11);gl.uniform2f(locations.resolution,canvas.width,canvas.height);gl.uniform2f(locations.grid,cols,rows);upload(0,base,makeField(cols,rows,seed));upload(1,flash,makeField(cols,rows,flashSeed));play();}
 let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,160);});document.addEventListener('visibilitychange',play);reduce.addEventListener('change',play);resize();
 return{setSeed(value){seed=value;upload(0,base,makeField(cols,rows,seed));play();},strike(value){flashSeed=value;upload(1,flash,makeField(cols,rows,flashSeed));struck=performance.now();play();}};
}
