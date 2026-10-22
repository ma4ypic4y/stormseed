import { ALGORITHM, bytesToHex, derive, parseSnapshot, dataAge } from './core.js';
const $ = id => document.getElementById(id);
let snapshot = null, wrapper = null, mode = 'number', last = null, busy = false, loading = false;
const labels = { number: 'Generate', dice: 'Roll the die' };
const pipPositions = { 1:[[150,150]], 2:[[75,75],[225,225]], 3:[[75,75],[150,150],[225,225]], 4:[[75,75],[225,75],[75,225],[225,225]], 5:[[75,75],[225,75],[150,150],[75,225],[225,225]], 6:[[75,75],[225,75],[75,150],[225,150],[75,225],[225,225]] };
function report(message) { $('action-status').textContent=message; }
function showError(message) { $('error').textContent=message; $('error').hidden=!message; }
function renderDie(value) {
  $('pips').replaceChildren();
  for(const [cx,cy] of pipPositions[value]) {
    const pip=document.createElementNS('http://www.w3.org/2000/svg','circle');
    pip.setAttribute('cx',cx);pip.setAttribute('cy',cy);pip.setAttribute('r','23');$('pips').append(pip);
  }
}
function resetResult() {
  last=null;$('result').textContent='?';$('result').className='result empty';$('result').hidden=false;$('die').toggleAttribute('hidden',true);
  $('result-label').textContent=mode==='number'?'A little room for chance.':'One die. Six possibilities.';
  $('result-actions').hidden=true;$('receipt').disabled=true;$('receipt-note').textContent='Generate a result to download its receipt.';
  $('observation').hidden=true;$('result-art').classList.remove('struck');showError('');report('');updateAge();
}
function setMode(next) {
  if(busy||mode===next)return;
  mode=next;document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  $('generate-label').textContent=snapshot?labels[mode]:'Retry connection';resetResult();
}
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
function updateAge() {
  if(!snapshot)return;
  const shown=last?JSON.parse(last.snapshot.material):snapshot,age=dataAge(shown.observedEnd);
  $('source-button').textContent=`NOAA · ${age.stale?'Older snapshot · ':''}${age.label}`;
  $('source-button').classList.toggle('stale',age.stale);
  $('source-button').title=`${shown.flashes.length.toLocaleString('en-US')} flash observations. Observation window ends ${shown.observedEnd}. Snapshot fetched ${shown.collectedAt}. ${shown.warnings.join(' ')}`;
}
async function loadData() {
  if(loading)return;loading=true;
  if(!snapshot){$('generate').disabled=true;$('generate-label').textContent='Connecting…';}
  try {
    if(!globalThis.crypto?.subtle)throw new Error('Open the HTTPS site to generate a result securely.');
    const response=await fetch('./data/lightning.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Could not load the lightning data. Check your connection and retry.');
    const candidate=await response.json(),parsed=await parseSnapshot(candidate);
    wrapper=candidate;snapshot=parsed;updateAge();showError('');
  } catch(error) {
    if(snapshot){$('source-button').textContent+=' · Refresh unavailable';}
    else{$('source-button').textContent='Lightning data unavailable';$('source-button').classList.add('stale');showError(error.name==='TimeoutError'?'The data request timed out. Please retry.':error.message);}
  } finally {
    loading=false;if(!busy){$('generate').disabled=false;$('generate-label').textContent=snapshot?labels[mode]:'Retry connection';}
  }
}
function strike(digest) {
  const points=[[260,0],[350,120],[305,215],[470,195],[390,340],[505,320],[380,540],[445,700]];
  const path=points.map(([x,y],i)=>`${i?'L':'M'}${x+(parseInt(digest.slice(i*2,i*2+2),16)-128)*.35},${y}`).join(' ');
  $('discharge-path').setAttribute('d',path);
  $('result-art').classList.remove('struck');
  requestAnimationFrame(()=>requestAnimationFrame(()=>$('result-art').classList.add('struck')));
}
async function generate() {
  if(busy)return;if(!snapshot){await loadData();return;}
  busy=true;showError('');report('');$('generate').disabled=true;$('generate-label').textContent='Picking…';
  const controls=[...document.querySelectorAll('[data-mode]')];controls.forEach(el=>el.disabled=true);
  try {
    const inputSnapshot=snapshot,inputWrapper=wrapper,inputMode=mode,config={min:1,max:mode==='number'?100:6};
    const nonce=bytesToHex(crypto.getRandomValues(new Uint8Array(32))),outcome=await derive(inputSnapshot.seed,nonce,config.min,config.max);
    const value=String(outcome.value),flash=inputSnapshot.flashes[parseInt(outcome.digest.slice(8,16),16)%inputSnapshot.flashes.length];
    last={version:1,algorithm:ALGORITHM,generatedAt:new Date().toISOString(),mode:inputMode,config,nonce,seed:inputSnapshot.seed,outcome,displayValue:value,flash,source:inputSnapshot.sources[flash.source],snapshot:inputWrapper};
    $('result').textContent=value;$('result').className=`result${value.length===3?' three-digits':''}`;
    $('result').hidden=inputMode==='dice';$('die').toggleAttribute('hidden',inputMode!=='dice');if(inputMode==='dice')renderDie(outcome.value);
    $('result-label').textContent=inputMode==='number'?`${value} out of 100.`:`You rolled a ${value}.`;
    $('result-actions').hidden=false;$('receipt').disabled=false;$('receipt-note').textContent='Includes the exact inputs needed to reproduce this result.';
    strike(outcome.digest);updateAge();if(!$('observation').hidden)showObservation();
  } catch(error){showError(`Could not generate a result. ${error.message}`);}
  finally{busy=false;$('generate').disabled=false;$('generate-label').textContent=labels[mode];controls.forEach(el=>el.disabled=false);}
}
$('generate').addEventListener('click',generate);
function openMethod(scroll=true) {
  $('how-it-works').hidden=false;$('method-link').setAttribute('aria-expanded','true');
  if(scroll)$('how-it-works').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('method-link').setAttribute('aria-expanded','false');$('method-link').setAttribute('aria-controls','how-it-works');
$('method-link').addEventListener('click',event=>{event.preventDefault();openMethod();});
$('close-method').addEventListener('click',()=>{$('how-it-works').hidden=true;$('method-link').setAttribute('aria-expanded','false');$('method-link').focus();});
function showObservation() {
  if(!snapshot){loadData();return;}
  const flash=last?.flash||snapshot.flashes[0],source=last?.source||snapshot.sources[flash.source];
  $('observation').hidden=false;$('flash-details').replaceChildren();
  const pairs=[['Latitude',`${Math.abs(flash.lat).toFixed(3)}° ${flash.lat>=0?'N':'S'}`],['Longitude',`${Math.abs(flash.lon).toFixed(3)}° ${flash.lon>=0?'E':'W'}`],['Observed (UTC)',new Date(flash.time).toISOString().replace('T',' ').slice(0,23)],['Satellite',source.satellite]];
  pairs.forEach(([name,value])=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;div.append(dt,dd);$('flash-details').append(div);});
  $('raw-source').href=source.url;
}
$('source-button').addEventListener('click',()=>{showObservation();if(snapshot)$('observation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
function download(blob,name) {
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
$('receipt').addEventListener('click',()=>{if(last){download(new Blob([JSON.stringify(last,null,2)],{type:'application/json'}),`stormseed-receipt-${last.outcome.digest.slice(0,10)}.json`);report('Receipt saved.');}});
$('copy-result').addEventListener('click',async()=>{if(!last)return;try{await navigator.clipboard.writeText(last.displayValue);report('Result copied.');}catch{report('Copy is unavailable here. Select the result to copy it.');}});
async function makeCard(result) {
  await document.fonts.ready;
  const c=document.createElement('canvas');c.width=1200;c.height=1500;const ctx=c.getContext('2d');
  const ink='#f1f0e8',red='#f0785c',muted='#a3a59b';
  ctx.fillStyle='#171815';ctx.fillRect(0,0,1200,1500);
  ctx.fillStyle=ink;ctx.font='700 54px Basteleur';ctx.fillText('stormseed.',76,118);
  ctx.font='28px Apfel';ctx.fillText('Let lightning decide.',76,176);
  if(result.mode==='dice'){
    ctx.save();ctx.translate(600,660);ctx.rotate(-.14);ctx.translate(-240,-240);ctx.lineWidth=5;ctx.strokeStyle=ink;ctx.beginPath();ctx.roundRect(0,0,480,480,64);ctx.stroke();
    pipPositions[result.outcome.value].forEach(([x,y])=>{ctx.beginPath();ctx.arc((x-9)/282*480,(y-9)/282*480,36,0,Math.PI*2);ctx.fill();});ctx.restore();
  }else{
    ctx.textAlign='center';ctx.font=`700 ${result.displayValue.length===3?450:660}px Basteleur`;ctx.fillText(result.displayValue,585,900);ctx.textAlign='left';
  }
  ctx.strokeStyle=red;ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(1010,210);ctx.lineTo(960,300);ctx.lineTo(1010,285);ctx.lineTo(935,400);ctx.stroke();
  ctx.fillStyle=ink;ctx.font='32px Apfel';ctx.fillText(result.mode==='dice'?`One die. You rolled a ${result.displayValue}.`:'A number from 1 to 100.',76,1100);
  ctx.strokeStyle='#393b34';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,1170);ctx.lineTo(1124,1170);ctx.stroke();
  ctx.fillStyle=muted;ctx.font='23px Apfel';ctx.fillText('Real lightning + browser randomness.',76,1230);
  ctx.fillText(`Snapshot: ${JSON.parse(result.snapshot.material).observedEnd.slice(0,16).replace('T',' ')} UTC`,76,1270);
  ctx.fillText(`Result ${result.outcome.digest.slice(0,12)}`,76,1310);
  ctx.fillStyle=red;ctx.font='25px Apfel';ctx.fillText('ma4ypic4y.github.io/stormseed',76,1420);
  return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));
}
$('save-card').addEventListener('click',async()=>{
  if(!last)return;const result=last;$('save-card').disabled=true;
  try{download(await makeCard(result),`stormseed-${result.outcome.digest.slice(0,10)}.png`);report('Card saved.');}catch{report('The card could not be saved. Try again.');}finally{$('save-card').disabled=false;}
});
$('share').addEventListener('click',async()=>{
  if(!last)return;
  const text=`${last.mode==='dice'?'I rolled':'The sky picked'} ${last.displayValue}. A random result seeded by real lightning.`;
  const url='https://ma4ypic4y.github.io/stormseed/';
  try{if(navigator.share){await navigator.share({title:'Stormseed — Let lightning decide.',text,url});report('Shared.');}else{await navigator.clipboard.writeText(`${text}\n${url}`);report('Result and link copied. Ready to share.');}}catch(error){if(error.name!=='AbortError')report('Sharing is unavailable. You can still save a card.');}
});
if(location.hash==='#how-it-works')openMethod(false);
loadData();setInterval(updateAge,60000);setInterval(()=>{if(!document.hidden)loadData();},1800000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateAge();});
